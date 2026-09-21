"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setInsightsLoading } from "@/redux/modules/insights";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import {
  AlignmentCards,
  CoachCard,
  DimensionsCard,
  InsightsEmptyState,
  InsightsSkeleton,
  ScoreTrendCard,
} from "./components/insight-cards";

export default function InsightsPage() {
  const dispatch = useAppDispatch();
  const { user_data } = usePosterReducers();
  const { isConnected, sendMessage } = useWebSocket();
  const insights = useAppSelector(
    (state) => state.combinedReducer.insights,
  );
  const relationshipId = user_data?.user?.relationships?.[0]?.id ?? "";

  const loadInsights = useCallback(() => {
    if (!relationshipId || !isConnected) return;

    dispatch(setInsightsLoading(true));
    sendMessage("action", {
      type: "relationshipAnalysisService",
      action: "list",
      payload: { relationshipId },
    });
    sendMessage("action", {
      type: "relationshipAnalysisService",
      action: "dashboard",
      payload: { relationshipId },
    });
  }, [dispatch, isConnected, relationshipId, sendMessage]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const latest = insights.analyses[0];
  const recommendations = (
    latest?.recommendations.length
      ? latest.recommendations
      : insights.dashboard?.recommendations ?? []
  ).slice(0, 3);
  const currentScore =
    insights.trend.at(-1)?.overallScore ?? latest?.overallScore ?? 0;
  const isWaitingForCheckIns = Boolean(
    insights.dashboard?.user1 &&
    insights.dashboard.user2 &&
    (!insights.dashboard.user1.checkedIn ||
      !insights.dashboard.user2.checkedIn),
  );

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <header className="mb-8">
            <h1 className="text-xl font-extrabold tracking-tight">
              Insights &amp; Trends
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Deep AI analysis of your relationship alignment metrics.
            </p>
          </header>
          {insights.loading && !latest ? (
            <InsightsSkeleton />
          ) : insights.error ? (
            <Card className="rounded-3xl border-destructive/30 bg-surface p-10 text-center">
              <p className="text-sm font-semibold text-destructive">
                {insights.error}
              </p>
              <Button className="mt-5" onClick={loadInsights}>
                Try again
              </Button>
            </Card>
          ) : isWaitingForCheckIns ? (
            <Card className="rounded-3xl border-border/70 bg-surface p-10 text-center shadow-sm">
              <Sparkles className="mx-auto h-10 w-10 text-primary/60" />
              <h2 className="mt-4 text-lg font-extrabold">
                Insights are being prepared
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Complete this week&apos;s check-in together to reveal your latest relationship analysis.
              </p>
            </Card>
          ) : !latest ? (
            <InsightsEmptyState />
          ) : (
            <div className="space-y-6">
              <ScoreTrendCard
                trend={insights?.trend}
                currentScore={currentScore}
                status={latest?.relationshipStatus}
              />

              <DimensionsCard analysis={latest} />

              <section aria-labelledby="alignment-analysis-title">
                <h2
                  id="alignment-analysis-title"
                  className="mb-4 text-lg font-extrabold"
                >
                  Alignment Analysis
                </h2>
                <AlignmentCards analysis={latest} />
              </section>

              {recommendations.length > 0 && (
                <section aria-labelledby="coach-recommendations-title">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2
                      id="coach-recommendations-title"
                      className="flex items-center gap-2 text-lg font-extrabold"
                    >
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Coach Recommendations
                    </h2>
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                      Updated weekly
                    </span>
                  </div>
                  <div className="space-y-3">
                    {recommendations.map((recommendation, index) => (
                      <CoachCard
                        key={recommendation?.id || `${recommendation?.title}-${index}`}
                        recommendation={recommendation}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
