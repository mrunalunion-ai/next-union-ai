import { TaskActionTypes } from "./action";
import { ITasksState, initialTasksState } from "./types";

const tasksReducer = (
  state: ITasksState = initialTasksState,
  action: any,
): ITasksState => {
  switch (action.type) {
    case TaskActionTypes.SET_LIST:
      return {
        ...state,
        byFilter: {
          ...state.byFilter,
          [action.payload.filter]: action.payload.tasks,
        },
        counts: {
          ...state.counts,
          [action.payload.filter]: action.payload.count,
        },
        loading: false,
        error: "",
      };
    case TaskActionTypes.SET_FILTER:
      return { ...state, activeFilter: action.payload };
    case TaskActionTypes.SET_LOADING:
      return { ...state, loading: action.payload, error: "" };
    case TaskActionTypes.SET_SAVING:
      return { ...state, saving: action.payload };
    case TaskActionTypes.SET_ERROR:
      return { ...state, loading: false, saving: false, error: action.payload };
    case TaskActionTypes.CLEAR:
      return initialTasksState;
    default:
      return state;
  }
};

export default tasksReducer;
