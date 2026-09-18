"use client";

import {
  CalendarDays,
  Check,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ITask } from "@/redux/modules/tasks";

interface TaskCardProps {
  task: ITask;
  currentUserId?: string;
  onToggle: (task: ITask) => void;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
}

const priorityStyles = {
  high: "border-rose-200 bg-rose-50 text-rose-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-yellow-200 bg-yellow-50 text-yellow-700",
};

function formatDueDate(value?: string | null) {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No due date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TaskCard({
  task,
  currentUserId,
  onToggle,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const canManage =
    !currentUserId ||
    task.createdByUserId === currentUserId ||
    task.assignedToUserId === currentUserId;

  const isCompleted = task.status === "completed";
  const isOverdue = task.status === "overdue";

  return (
    <Card className="rounded-2xl border-border/70 bg-surface px-5 py-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="relative">
        {/* Priority */}
        <span
          className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${priorityStyles[task.priority]}`}
        >
          {task.priority} priority
        </span>

        {/* Completion Circle */}
        <button
          type="button"
          aria-label={
            isCompleted ? "Mark task as pending" : "Mark task complete"
          }
          title={isCompleted ? "Mark task as pending" : "Mark task complete"}
          aria-pressed={isCompleted}
          disabled={!canManage || isOverdue}
          onClick={() => onToggle(task)}
          className={`absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
            isCompleted
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-500 bg-transparent hover:border-primary hover:bg-primary/5"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isCompleted && <Check className="h-4 w-4" strokeWidth={3} />}
        </button>

        {/* Title */}
        <h2
          className={`mt-2 pr-12 text-base font-bold leading-5 ${
            isCompleted
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {task.title}
        </h2>

        {/* Description */}
        {task.description && (
          <p className="mt-1.5 truncate text-xs leading-5 text-muted-foreground">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-3">
        <div className="flex min-w-0 items-center gap-4 text-xs font-medium text-muted-foreground">
          {/* Due Date */}
          <span
            className={`inline-flex min-w-0 items-center gap-1.5 ${
              isOverdue ? "text-rose-600" : ""
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />

            <span className="truncate">
              {formatDueDate(task.dueDate)}
            </span>
          </span>

          {/* Assigned User */}
          <span className="inline-flex items-center gap-1">
            <UserRound className="h-3.5 w-3.5 shrink-0" />
            {task.assignedTo === "partner" ? "Partner" : "Me"}
          </span>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Edit Task`}
              title={`Edit Task`}
              className="h-8 w-8"
              onClick={() => onEdit(task)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete Task`}
              title={`Delete Task`}
              className="h-8 w-8"
              onClick={() => onDelete(task)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
