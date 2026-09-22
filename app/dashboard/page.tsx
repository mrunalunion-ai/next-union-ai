"use client";

import {
  ArrowRight,
  Check,
  CheckSquare,
  CheckCircle2,
  Heart,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  CheckinReminderDialog,
  WelcomeDialog,
} from "@/components/dashboard/dashboard-dialogs";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { API_BASE_URL, APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import { setInsightsLoading } from "@/redux/modules/insights";
import { useWebSocket } from "@/services/socket/WebSocketContext";

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "U";
}

function displayDate(value?: string, fallback = "Not started") {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function getCurrentWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - daysFromMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getNextWeekStart() {
  const today = new Date();
  const day = today.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const nextMonday = new Date(today);
  nextMonday.setHours(0, 0, 0, 0);
  nextMonday.setDate(today.getDate() + (7 - daysFromMonday));

  return nextMonday;
}

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user_data, insights } = usePosterReducers();
  const user = user_data?.user;
  const relationship = user?.relationships?.[0];
  const partner = relationship?.partner;
  const { isConnected, sendMessage } = useWebSocket();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCheckinReminder, setShowCheckinReminder] = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const relationshipId = relationship?.id ?? "";
  const userId = user?.id ?? "";

  const loadDashboardData = useCallback(() => {
    if (!isConnected || !relationshipId) return;

    dispatch(setInsightsLoading(true));
    sendMessage("action", {
      type: "checkinService",
      action: "list",
      payload: { relationshipId },
    });
    sendMessage("action", {
      type: "relationshipAnalysisService",
      action: "dashboard",
      payload: { relationshipId },
    });
  }, [dispatch, isConnected, relationshipId, sendMessage, userId]);

  const userName = user?.firstName?.trim() || "there";
  const partnerName =
    `${partner?.firstName ?? ""} ${partner?.lastName ?? ""}`.trim() ||
    "Your partner";
  const userInitials = getInitials(user?.firstName, user?.lastName);
  const partnerInitials = getInitials(partner?.firstName, partner?.lastName);
  const currentWeek = getCurrentWeekRange();
  const startedOn = displayDate(currentWeek.start.toISOString());
  const dueDate = displayDate(currentWeek.end.toISOString());

  const dashboard = insights.dashboard;
  const mine =
    dashboard?.user1?.id === userId
      ? dashboard?.user1
      : dashboard?.user2?.id === userId
        ? dashboard?.user2
        : dashboard?.user1;
  const dashboardPartner = mine === dashboard?.user1 ? dashboard?.user2 : dashboard?.user1;
  const userSubmitted = mine?.checkedIn === true;
  const partnerSubmitted = dashboardPartner?.checkedIn === true;
  const hasDashboardData = Boolean(
    dashboard &&
    typeof dashboard.overallScore === "number" &&
    userSubmitted &&
    partnerSubmitted,
  );
  const dashboardRecommendations = dashboard?.recommendations?.slice(0, 3) ?? [];
  const dashboardUserName = mine?.name || userName;
  const dashboardPartnerName = dashboardPartner?.name || partnerName;
  const statusLabel = (dashboard?.relationshipStatus || "Growing connection")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: any) => letter.toUpperCase());

  const nextCheckInDate = userSubmitted && partnerSubmitted
    ? displayDate(getNextWeekStart().toISOString(), "Next week")
    : "";

  useEffect(() => {
    if (!relationshipId || !userId) return;

    const storageKey = `unionai:dashboard-dialogs:${userId}:${relationshipId}:welcome`;
    if (window.localStorage.getItem(storageKey) === "shown") return;

    window.localStorage.setItem(storageKey, "shown");
    setShowWelcome(true);
    setReminderDismissed(false);
    const timer = window.setTimeout(() => setShowWelcome(false), 5000);

    return () => window.clearTimeout(timer);
  }, [relationshipId, userId]);

  useEffect(() => {
    if (!relationshipId || !userId || userSubmitted) return;

    const storageKey = `unionai:dashboard-dialogs:${userId}:${relationshipId}:checkin-reminder`;
    if (window.localStorage.getItem(storageKey) === "shown") return;

    const timer = window.setTimeout(() => {
      if (!userSubmitted && !reminderDismissed) {
        window.localStorage.setItem(storageKey, "shown");
        setShowCheckinReminder(true);
      }
    }, 5600);

    return () => window.clearTimeout(timer);
  }, [relationshipId, reminderDismissed, userId, userSubmitted]);

  useEffect(() => {
    if (!isConnected) return;
    sendMessage("action", { type: "userService", action: "get", payload: {} });
  }, [isConnected, sendMessage]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (userSubmitted) setShowCheckinReminder(false);
  }, [userSubmitted]);

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <section className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {" "}
              <span className="bg-gradient-to-r from-[#ef5b51] to-[#8b59c9] bg-clip-text text-transparent">
                {user?.firstName || "friend"}
              </span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Connected with {partnerName}
            </p>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
            <Heart className="h-6 w-6 fill-primary/15" />
          </div>
        </section>

        <div className="grid items-stretch gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="h-full overflow-hidden rounded-3xl border-border/70 bg-surface shadow-sm">
            <div className="p-5 text-center sm:p-6 lg:p-7">
              <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-primary">
                {hasDashboardData ? "Relationship Wellness Union Score" : "Union Score"}
              </p>
              {hasDashboardData ? (
                <div className="relative mx-auto mt-5 h-44 w-44 sm:h-48 sm:w-48">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-label={`Union score ${Math.round(dashboard?.overallScore ?? 0)} out of 1000`} role="img">
                    <circle cx="60" cy="60" r="49" fill="none" className="stroke-muted" strokeWidth="7" />
                    <circle
                      cx="60"
                      cy="60"
                      r="49"
                      fill="none"
                      className="stroke-emerald-500 transition-all duration-700"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(Math.max(dashboard?.overallScore ?? 0, 0), 1000) * 0.3079} 307.9`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold tracking-tight text-emerald-600">
                      {Math.round(dashboard?.overallScore ?? 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative mx-auto mt-7 flex h-48 w-48 items-center justify-center rounded-full bg-[conic-gradient(from_210deg,rgba(114,83,229,0.12),rgba(114,83,229,0.12)_8%,transparent_8%,transparent_100%)] sm:h-56 sm:w-56">
                  <div className="absolute inset-4 rounded-full border border-primary/10 shadow-[0_0_45px_rgba(114,83,229,0.18)]" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-border bg-background shadow-sm sm:h-28 sm:w-28">
                    <LockKeyhole className="h-12 w-12 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
              )}
              {hasDashboardData ? (
                <>
                  <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-emerald-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    {statusLabel}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Score shown here is out of 1000</p>
                </>
              ) : (
                <p className="mx-auto mt-7 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
                  {!userSubmitted
                    ? "Once you both complete your check-ins, your Union Score will appear"
                    : !partnerSubmitted
                      ? "Your Union Score will appear when your partner completes their check-in."
                      : "Your check-ins are complete. Your Union Score will appear here once analysis is ready."}
                </p>
              )}
            </div>
          </Card>

          <div className="flex h-full flex-col gap-5">
            {!userSubmitted &&
              <Button asChild className="h-12 w-full rounded-xl text-base shadow-lg shadow-primary/20">
                <Link href={APP_URL.LINKS.WEEKLY_CHECK_IN}>
                  <CheckSquare className="mr-2 h-5 w-5" />
                  Complete Weekly Check-in
                </Link>
              </Button>
            }

            <Card
              id="insights"
              className="h-full rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-6"
            >
              <p className="text-sm font-extrabold text-center uppercase tracking-[0.12em] text-primary">
                Your Union
              </p>

              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {user?.profileImage ? (
                      <img
                        src={API_BASE_URL + user.profileImage}
                        alt={userName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      userInitials
                    )}
                  </div>
                  <p className="mt-2 text-sm font-bold">{hasDashboardData ? dashboardUserName : "You"}</p>
                  <p className={`mt-2 flex items-center justify-center gap-1 text-xs font-semibold ${userSubmitted ? "text-emerald-600" : "text-amber-600"}`}>
                    <Check className="h-3.5 w-3.5" />
                    {userSubmitted ? "Checked in" : "Waiting for check-in"}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <Heart className="h-7 w-7 fill-current" />
                </div>

                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {partner?.profileImage ? (
                      <img
                        src={API_BASE_URL + partner.profileImage}
                        alt={partnerName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      partnerInitials
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm font-bold">{dashboardPartnerName}</p>
                  <p className={`mt-2 flex items-center justify-center gap-1 text-xs font-semibold ${partnerSubmitted ? "text-emerald-600" : "text-amber-600"}`}>
                    <Check className="h-3.5 w-3.5" />
                    {partnerSubmitted ? "Checked in" : "Waiting for check-in"}
                  </p>
                </div>
              </div>

              <div className="mb-5 mt-10 h-px bg-border" />
              {userSubmitted && partnerSubmitted ?
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Next check-in on</p>
                  <p className="mt-2 text-sm font-bold sm:text-base">{nextCheckInDate}</p>
                </div>
                :
                <div className="flex justify-between text-center items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in started on</p>
                    <p className="mt-2 text-sm font-bold sm:text-base">{startedOn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in due on</p>
                    <p className="mt-2 text-sm font-bold sm:text-base">{dueDate}</p>
                  </div>
                </div>}

              <Link
                href={APP_URL.LINKS.INSIGHTS}
                className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                View Insights
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>

        {hasDashboardData && (
          <section className="mt-8" aria-labelledby="coach-recommendations-heading">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="coach-recommendations-heading" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                <Sparkles className="h-5 w-5 text-primary" />
                Coach recommendations
              </h2>
              <Link
                href={APP_URL.LINKS.INSIGHTS}
                className="flex items-center gap-3 text-sm font-semibold text-primary hover:underline"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {dashboardRecommendations.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {dashboardRecommendations.map((recommendation: any, index: any) => (
                  <Card key={recommendation.id || `${recommendation.title}-${index}`} className="overflow-hidden rounded-3xl border-border/70 bg-surface shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-primary/10 bg-primary/5 px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-primary">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="truncate uppercase">This week&apos;s focus</span>
                      </div>
                      {recommendation.category && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                          {recommendation.category}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-sm font-extrabold leading-7">{recommendation.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{recommendation.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-3xl border-border/70 bg-surface p-6 text-sm text-muted-foreground shadow-sm">
                Your latest relationship recommendations will appear here.
              </Card>
            )}
          </section>
        )}
      </main>
      <WelcomeDialog
        open={showWelcome}
        name={userName}
        onOpenChange={setShowWelcome}
      />
      <CheckinReminderDialog
        open={showCheckinReminder}
        onOpenChange={(open) => {
          setShowCheckinReminder(open);
          if (!open) setReminderDismissed(true);
        }}
        onComplete={() => {
          setShowCheckinReminder(false);
          setReminderDismissed(true);
          router.push(APP_URL.LINKS.WEEKLY_CHECK_IN);
        }}
      />
    </DashboardLayout>
  );
}
