"use client";

import { Hourglass, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect } from "react";

import { APP_URL } from "@/constant/static";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import { setInsightsLoading } from "@/redux/modules/insights";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import {
  AlignmentCards,
  CoachCard,
  DimensionsCard,
  InsightsSkeleton,
  ScoreTrendCard,
} from "./components/insight-cards";

export default function InsightsPage() {
  const dispatch = useAppDispatch();
  const { user_data, insights, account } = usePosterReducers();
  const { isConnected, sendMessage } = useWebSocket();
  const relationship = user_data?.user?.relationships?.[0];
  const relationshipId = relationship?.id ?? "";
  const isUser1 = relationship?.user1Id === user_data?.user?.id;
  const activeSubscription = account?.activeSubscription ?? relationship?.subscription;
  const hasActiveSubscription = Boolean(
    activeSubscription &&
    activeSubscription?.status &&
    (typeof activeSubscription?.isActive === "boolean"
      ? activeSubscription?.isActive
      : activeSubscription?.status?.toUpperCase() !== "EXPIRED"),
  );

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

  const latest = insights?.analyses[0];
  const recommendations = (
    latest?.recommendations?.length
      ? latest?.recommendations
      : insights?.dashboard?.recommendations ?? []
  ).slice(0, 3);
  const currentScore =
    insights?.trend?.at(-1)?.overallScore ?? latest?.overallScore ?? 0;
  const isLastWeekData = insights?.dashboard?.isLastWeekData === true;
  const isWaitingForCheckIns = Boolean(
    insights?.dashboard?.user1 &&
    insights?.dashboard?.user2 &&
    !isLastWeekData &&
    (!insights?.dashboard?.user1?.checkedIn ||
      !insights?.dashboard?.user2?.checkedIn),
  );

  return (
    <DashboardLayout>
      <main className="min-h-full px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <header className="mb-8">
            <h1 className="text-xl font-extrabold tracking-tight">
              Insights &amp; Trends
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Deep AI analysis of your relationship alignment metrics
            </p>
          </header>
          {insights?.loading && !latest ? (
            <InsightsSkeleton />
          ) : insights?.error ? (
            <Card className="rounded-3xl border-destructive/30 bg-surface p-10 text-center">
              <p className="text-sm font-semibold text-destructive">
                {insights?.error}
              </p>
              <Button className="mt-5" onClick={loadInsights}>
                Try again
              </Button>
            </Card>
          ) : isWaitingForCheckIns ? (
            <Card className="mx-auto rounded-3xl border-border/70 bg-surface p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                <Hourglass className="h-12 w-12" strokeWidth={1.8} />
              </div>
              <h2 className="mt-5 text-lg font-extrabold sm:text-xl">
                Once you both complete your check-ins, <br />Insights &amp; Trends will appear
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                For insights and trends, you can view graphs of your score trend,
                core alignment dimensions, strengths, gaps and risks, along with AI
                Coach recommendations.
              </p>
              <Button asChild className="mt-6 h-11 w-full rounded-xl font-semibold sm:max-w-sm">
                <Link href={APP_URL.LINKS.WEEKLY_CHECK_IN}>Complete Weekly Check-in</Link>
              </Button>
            </Card>
          ) : !hasActiveSubscription ? (
            <Card className="mx-auto rounded-3xl border-border/70 bg-surface p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                <Hourglass className="h-12 w-12" strokeWidth={1.8} />
              </div>
              <h2 className="mt-5 text-lg font-extrabold sm:text-xl">
                {isUser1
                  ? "Once you purchase a subscription,"
                  : "Once your partner purchases a subscription,"}
                <br />
                Insights &amp; Trends will appear for both of you.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                For insights and trends, you can view graphs of your score trend,
                core alignment dimensions, strengths, gaps and risks, along with AI
                Coach recommendations.
              </p>
              {isUser1 && (
                <Button asChild className="mt-6 h-11 w-full rounded-xl font-semibold sm:max-w-sm">
                  <Link href={APP_URL.LINKS.EXPLORE_PLANS}>Explore Plans</Link>
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                <ScoreTrendCard
                  trend={insights?.trend}
                  currentScore={currentScore}
                  status={latest?.relationshipStatus}
                />

                <DimensionsCard analysis={latest} />
              </div>

              <section aria-labelledby="alignment-analysis-title">
                <h2
                  id="alignment-analysis-title"
                  className="mb-4 text-base uppercase font-extrabold"
                >
                  Alignment Analysis
                </h2>
                <AlignmentCards analysis={latest} />
              </section>

              {recommendations?.length > 0 && (
                <section aria-labelledby="coach-recommendations-title">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2
                      id="coach-recommendations-title"
                      className="flex items-center uppercase gap-2 text-base font-extrabold"
                    >
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Coach Recommendations
                    </h2>
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                      Updated weekly
                    </span>
                  </div>
                  <div className="space-y-3">
                    {recommendations?.map((recommendation: any, index: any) => (
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
