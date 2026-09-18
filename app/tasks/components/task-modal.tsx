"use client";

import { CalendarDays, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, type FormEvent } from "react";
import { useForm } from "react-hook-form";

import InputField from "@/components/ui/InputField";
import DropdownSelect from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { ITask } from "@/redux/modules/tasks";
import DatePicker from "@/components/ui/datePicker";
import { taskSchema, type TaskFormValues } from "@/utils/schema";

export type { TaskFormValues } from "@/utils/schema";

interface TaskModalProps {
  task?: ITask | null;
  saving: boolean;
  onClose: () => void;
  onSave: (values: TaskFormValues) => void;
}

const assigneeOptions = [
  { value: "me", label: "Me", key: "me" },
  { value: "partner", label: "Partner", key: "partner" },
];

const priorityOptions = [
  { value: "low", label: "Low", key: "low" },
  { value: "medium", label: "Medium", key: "medium" },
  { value: "high", label: "High", key: "high" },
];

function getDefaultValues(task?: ITask | null): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    assignedTo: task?.assignedTo ?? "me",
    priority: task?.priority ?? "medium",
    dueDate: task?.dueDate?.slice(0, 10) ?? "",
  };
}

export function TaskModal({
  task,
  saving,
  onClose,
  onSave,
}: TaskModalProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: getDefaultValues(task),
    mode: "onChange",
  });
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = form;

  useEffect(() => {
    reset(getDefaultValues(task));
  }, [reset, task]);

  const submit = (values: TaskFormValues) => {
    onSave({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto scrollbar-hidden rounded-3xl border border-border bg-surface p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="task-modal-title" className="text-xl font-extrabold">
              {task ? "Update Relationship Task" : "Add Relationship Task"}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close task form"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-6"
          noValidate
        >
          <InputField<TaskFormValues>
            name="title"
            label="Task Title"
            required
            register={register}
            error={errors.title}
            placeholder="e.g. Plan a date night"
            inputClassName="auth-input"
          />

          <InputField<TaskFormValues>
            name="description"
            label="Description"
            required
            register={register}
            error={errors.description}
            useFor="textarea"
            rows={4}
            placeholder="What specifically needs to be done?"
            inputClassName="auth-input"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <DropdownSelect
              name="assignedTo"
              label="Assign to"
              control={control}
              options={assigneeOptions}
              defaultValue="assignee"
              placeholder="Select assignee"
              labelClassName="auth-field-label"
              formClassName="mt-1 h-11 rounded-[10px] border-input"
              errors={errors.assignedTo}
            />

            <DropdownSelect
              name="priority"
              label="Priority"
              control={control}
              options={priorityOptions}
              defaultValue="priority"
              placeholder="Select priority"
              labelClassName="auth-field-label"
              formClassName="mt-1 h-11 rounded-[10px] border-input"
              errors={errors.priority}
            />
          </div>

          <DatePicker<TaskFormValues>
            name="dueDate"
            control={control}
            label="Due date"
            error={errors.dueDate}
            required
            labelClassName="auth-field-label"
            inputClassName="auth-input"
            format="YYYY-MM-DD"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving || !isValid}>
              {saving ? "Saving…" : task ? "Update task" : "Save task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
