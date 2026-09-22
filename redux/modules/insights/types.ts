export interface IInsightTrendPoint {
  label: string;
  weekNumber: number;
  periodStart: string;
  overallScore: number;
}

export interface IInsightText {
  title: string;
  description: string;
}

export interface ICoachRecommendation {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
}

export interface IAnalysisItem {
  id: string;
  weekNumber: number;
  overallScore: number;
  relationshipStatus: string;
  emotionalConnection: number;
  communicationSatisfaction: number;
  pacingAndReciprocity: number;
  coreTrustIndex: number;
  coreStrengths: IInsightText[];
  gapsAndRisks: IInsightText[];
  recommendations: ICoachRecommendation[];
}

export interface IInsightUser {
  id: string;
  name: string;
  checkedIn: boolean;
}

export interface IInsightDashboard {
  overallScore?: number;
  relationshipStatus?: string;
  user1?: IInsightUser | null;
  user2?: IInsightUser | null;
  recommendations: ICoachRecommendation[];
  recommendationCount?: number;
  pendingTaskCount?: number;
}

export interface IInsightsState {
  analyses: IAnalysisItem[];
  trend: IInsightTrendPoint[];
  dashboard: IInsightDashboard | null;
  loading: boolean;
  error: string;
}

export const initialInsightsState: IInsightsState = {
  analyses: [],
  trend: [],
  dashboard: null,
  loading: false,
  error: "",
};
