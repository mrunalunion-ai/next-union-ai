"use client";

import { CheckCircle, Plus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

import { TaskCard } from "@/app/tasks/components/task-card";
import { TaskFormValues, TaskModal } from "@/app/tasks/components/task-modal";
import { Popup } from "@/components/common/popup";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import {
  setTaskFilter,
  setTasksError,
  setTasksLoading,
  setTasksSaving,
  type ITask,
  type TaskFilter,
} from "@/redux/modules/tasks";
import { useWebSocket } from "@/services/socket/WebSocketContext";

const taskTabs: Array<{ label: string; value: TaskFilter }> = [
  { label: "Mine", value: "me" },
  { label: "Partner", value: "partner" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
];

const taskFilters: TaskFilter[] = taskTabs.map(({ value }) => value);

function parseMessage(rawMessage: unknown): Record<string, any> | null {
  if (!rawMessage) return null;

  if (typeof rawMessage === "string") {
    try {
      return JSON.parse(rawMessage) as Record<string, any>;
    } catch {
      return null;
    }
  }

  return typeof rawMessage === "object"
    ? (rawMessage as Record<string, any>)
    : null;
}

function isTaskResponse(message: Record<string, any> | null) {
  const request = message?.request ?? message;
  return request?.type === "tasksService";
}

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const { user_data, tasks } = usePosterReducers();
  const { isConnected, lastEvent, sendMessage } = useWebSocket();
  const [modalTask, setModalTask] = useState<ITask | null | undefined>(undefined);
  const [deleteTask, setDeleteTask] = useState<ITask | null>(null);
  const relationshipId = user_data?.user?.relationships?.[0]?.id ?? "";
  const userId = user_data?.user?.id;
  console.log("tasks",tasks)
  const loadTasks = useCallback((filter?: TaskFilter) => {
    if (!isConnected) return;

    dispatch(setTasksLoading(true));

    const filters = filter ? [filter] : taskFilters;

    filters.forEach((taskFilter) => {
      sendMessage("action", {
        type: "tasksService",
        action: "list",
        payload: {
          page: 1,
          limit: 100,
          active: true,
          filter: taskFilter,
        },
      });
    });
  }, [dispatch, isConnected, sendMessage]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const message = parseMessage(lastEvent?.data);

    if (!message || !isTaskResponse(message)) return;

    const request = message?.request ?? message;
    const action = request?.action;

    if (!["create", "update", "delete"].includes(action)) return;

    if (message?.status === false) {
      dispatch(setTasksError(message.msg ?? "Unable to update this task."));
      toast.error(message.msg ?? "Unable to update this task.");
      return;
    }

    setModalTask(undefined);
    setDeleteTask(null);
    toast.success(message.msg ?? "Task updated successfully.");
    loadTasks();
  }, [dispatch, lastEvent, loadTasks]);

  const saveTask = (values: TaskFormValues) => {
    if (!isConnected || !relationshipId) {
      toast.error("Connect a relationship before managing tasks.");
      return;
    }

    dispatch(setTasksSaving(true));

    sendMessage("action", {
      type: "tasksService",
      action: modalTask ? "update" : "create",
      payload: {
        ...(modalTask ? { id: modalTask.id } : {}),
        title: values.title,
        description: values.description,
        assignedTo: values.assignedTo,
        priority: values.priority,
        dueDate: values.dueDate,
        relationshipId,
      },
    });
  };

  const toggleTask = (task: ITask) => {
    if (!isConnected) return;

    dispatch(setTasksSaving(true));
    sendMessage("action", {
      type: "tasksService",
      action: "update",
      payload: {
        id: task.id,
        status: task.status === "completed" ? "pending" : "completed",
      },
    });
  };

  const confirmDelete = () => {
    if (!deleteTask || !isConnected) return;

    dispatch(setTasksSaving(true));
    sendMessage("action", {
      type: "tasksService",
      action: "delete",
      payload: { id: deleteTask.id },
    });
  };

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Relationship Tasks
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Proactive milestones for your connections.
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              title="Add task"
              disabled={!isConnected}
              onClick={() => setModalTask(null)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add task
            </Button>
          </header>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex w-full flex-1 gap-8 overflow-x-auto border-b border-border/70">
              {taskTabs.map(({ label, value }) => {
                const isActive = tasks.activeFilter === value;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-colors ${isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    onClick={() => dispatch(setTaskFilter(value))}
                  >
                    {label}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                      {tasks.counts?.[value] ??
                        tasks.byFilter[value]?.length ??
                        0}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          <div className="mt-6">
            {tasks.loading && tasks.byFilter[tasks.activeFilter].length === 0 ? (
              <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
                {[1, 2, 3, 4].map((item) => (
                  <Card key={item} className="h-40 animate-pulse rounded-2xl bg-surface" />
                ))}
              </div>
            ) : tasks.byFilter[tasks.activeFilter].length === 0 ? (
              <Card className="p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <h2 className="mt-4 text-lg font-extrabold">No Tasks Found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create a task for your partner to get started
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {tasks?.byFilter[tasks?.activeFilter].map((task: any) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUserId={userId}
                    onToggle={toggleTask}
                    onEdit={setModalTask}
                    onDelete={setDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {modalTask !== undefined && (
        <TaskModal
          task={modalTask}
          saving={tasks.saving}
          onClose={() => setModalTask(undefined)}
          onSave={saveTask}
        />
      )}

      <Popup
        open={Boolean(deleteTask)}
        onOpenChange={(open) => !open && setDeleteTask(null)}
        variant="logout"
        title="Delete task?"
        description="This task will be removed from your shared task list."
        confirmText="Delete"
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
}
