import { InsightsActionTypes } from "./action";
import { IInsightsState, initialInsightsState } from "./types";

const insightsReducer = (
  state: IInsightsState = initialInsightsState,
  action: any,
): IInsightsState => {
  switch (action.type) {
    case InsightsActionTypes.SET_LOADING:
      return { ...state, loading: action.payload, error: "" };
    case InsightsActionTypes.SET_ANALYSES:
      return {
        ...state,
        analyses: action.payload.analyses,
        trend: action.payload.trend,
        loading: false,
        error: "",
      };
    case InsightsActionTypes.SET_DASHBOARD:
      return { ...state, dashboard: action.payload, loading: false, error: "" };
    case InsightsActionTypes.SET_ERROR:
      return { ...state, loading: false, error: action.payload };
    case InsightsActionTypes.CLEAR:
      return initialInsightsState;
    default:
      return state;
  }
};

export default insightsReducer;
