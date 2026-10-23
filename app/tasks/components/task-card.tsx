"use client";

import {
  CalendarDays,
  Check,
  Eye,
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
  partnerName?: string;
  onToggle: (task: ITask) => void;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
  onView: (task: ITask) => void;
  isOwner: boolean;
  isCompletedTab?: boolean;
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
  partnerName,
  onToggle,
  onEdit,
  onDelete,
  onView,
  isOwner,
  isCompletedTab = false,
}: TaskCardProps) {
  const isAssignedToUser = currentUserId ? task.assignedToUserId === currentUserId : false;
  const isSelfAssigned = Boolean(
    task.createdByUserId &&
    task.assignedToUserId &&
    task.createdByUserId === task.assignedToUserId,
  );
  const otherPerson = partnerName?.trim() || "your partner";
  const assignmentLabel = isSelfAssigned
    ? isAssignedToUser
      ? "Self-assigned"
      : `Assigned to ${otherPerson}`
    : isAssignedToUser
      ? `Assigned by ${otherPerson}`
      : `Assigned to ${otherPerson}`;
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

        {/* Completion status */}
        {isCompleted ? (
          <span className="absolute right-0 top-0 inline-flex h-7 items-center gap-1.5 rounded-full border border-emerald-500 bg-emerald-500 px-2.5 text-[10px] font-semibold text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Completed
          </span>
        ) : (
          <button
            type="button"
            aria-label="Mark task complete"
            title="Mark task complete"
            disabled={isOverdue}
            onClick={() => onToggle(task)}
            className="absolute right-0 top-0 inline-flex h-7 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 text-[10px] font-semibold text-primary transition-colors hover:border-primary/60 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Mark complete
          </button>
        )}

        {/* Title */}
        <h2
          className={`mt-2 pr-28 text-base font-bold leading-5 ${isCompleted
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
            className={`inline-flex items-center gap-1.5 ${isOverdue ? "text-rose-600" : ""
              }`}
          >
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />

            <span>
              {formatDueDate(task.dueDate)}
            </span>
          </span>

          {/* Assigned User */}
          <span className="inline-flex items-center gap-1">
            <UserRound className="h-3.5 w-3.5 shrink-0" />
            <span title={assignmentLabel}>{assignmentLabel}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {(!isOwner || isCompletedTab) &&
            <Button
              variant="ghost"
              size="icon"
              aria-label={`View Task`}
              title={`View Task`}
              className="h-8 w-8"
              onClick={() => onView(task)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          }
          {isOwner && (
            <>
              {!isCompletedTab && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit Task"
                  title="Edit Task"
                  className="h-8 w-8"
                  onClick={() => onEdit(task)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}

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
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
