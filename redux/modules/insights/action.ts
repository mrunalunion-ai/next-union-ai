import {
  IAnalysisItem,
  IInsightDashboard,
  IInsightTrendPoint,
} from "./types";

export const InsightsActionTypes = {
  SET_LOADING: "INSIGHTS_SET_LOADING",
  SET_ANALYSES: "INSIGHTS_SET_ANALYSES",
  SET_DASHBOARD: "INSIGHTS_SET_DASHBOARD",
  SET_ERROR: "INSIGHTS_SET_ERROR",
  CLEAR: "INSIGHTS_CLEAR",
};

export const setInsightsLoading = (payload: boolean) => ({
  type: InsightsActionTypes.SET_LOADING,
  payload,
});

export const setInsightsAnalyses = (payload: {
  analyses: IAnalysisItem[];
  trend: IInsightTrendPoint[];
}) => ({
  type: InsightsActionTypes.SET_ANALYSES,
  payload,
});

export const setInsightsDashboard = (payload: IInsightDashboard) => ({
  type: InsightsActionTypes.SET_DASHBOARD,
  payload,
});

export const setInsightsError = (payload: string) => ({
  type: InsightsActionTypes.SET_ERROR,
  payload,
});

export const clearInsights = () => ({ type: InsightsActionTypes.CLEAR });
