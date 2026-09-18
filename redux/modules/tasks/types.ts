export type TaskFilter = "me" | "partner" | "completed" | "overdue";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed" | "overdue";

export interface ITask {
  id: string;
  title: string;
  description: string;
  assignedTo: "me" | "partner";
  priority: TaskPriority;
  dueDate?: string | null;
  createdByUserId?: string | null;
  assignedToUserId?: string | null;
  relationshipId?: string | null;
  status: TaskStatus;
  active?: boolean;
  createdAt?: string | null;
}

export interface ITasksState {
  byFilter: Record<TaskFilter, ITask[]>;
  counts: Record<TaskFilter, number>;
  activeFilter: TaskFilter;
  loading: boolean;
  saving: boolean;
  error: string;
}

export const initialTasksState: ITasksState = {
  byFilter: {
    me: [],
    partner: [],
    completed: [],
    overdue: [],
  },
  counts: {
    me: 0,
    partner: 0,
    completed: 0,
    overdue: 0,
  },
  activeFilter: "me",
  loading: false,
  saving: false,
  error: "",
};
