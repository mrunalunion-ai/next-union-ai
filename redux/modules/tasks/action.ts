import { ITask, TaskFilter } from "./types";

export const TaskActionTypes = {
  SET_LIST: "TASK_SET_LIST",
  SET_FILTER: "TASK_SET_FILTER",
  SET_LOADING: "TASK_SET_LOADING",
  SET_SAVING: "TASK_SET_SAVING",
  SET_ERROR: "TASK_SET_ERROR",
  CLEAR: "TASK_CLEAR",
};

export const setTaskList = (payload: {
  filter: TaskFilter;
  tasks: ITask[];
  count: number;
}) => ({
  type: TaskActionTypes.SET_LIST,
  payload,
});

export const setTaskFilter = (payload: TaskFilter) => ({
  type: TaskActionTypes.SET_FILTER,
  payload,
});

export const setTasksLoading = (payload: boolean) => ({
  type: TaskActionTypes.SET_LOADING,
  payload,
});

export const setTasksSaving = (payload: boolean) => ({
  type: TaskActionTypes.SET_SAVING,
  payload,
});

export const setTasksError = (payload: string) => ({
  type: TaskActionTypes.SET_ERROR,
  payload,
});

export const clearTasks = () => ({ type: TaskActionTypes.CLEAR });
