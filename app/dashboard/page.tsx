"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Heart,
  Sparkles
} from "lucide-react";
import Image from "next/image";
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

function scoreColor(score: number) {
  if (score > 75) return { bg: "bg-[#9B67F9]/10", dot: "bg-[#9B67F9]", text: "text-[#9B67F9]", stroke: "#9B67F9" };
  if (score >= 50) return { bg: "bg-[#22C55E]/10", dot: "bg-[#22C55E]", text: "text-[#22C55E]", stroke: "#22C55E" };
  if (score >= 25) return { bg: "bg-[#EAB308]/10", dot: "bg-[#EAB308]", text: "text-[#EAB308]", stroke: "#EAB308" };
  return { bg: "bg-[#EF4444]/10", dot: "bg-[#EF4444]", text: "text-[#EF4444]", stroke: "#EF4444" };
}

function UnionGrowthIcon() {
  return (
    <svg
      className="union-growth-icon h-16 w-16"
      viewBox="0 0 80 80"
      fill="none"
      aria-label="Your union is growing"
      role="img"
    >
      <path d="M40 68V31" stroke="#182E72" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 52C31 51 25 46 24 38C33 38 39 43 40 52Z" fill="#8BC34A" stroke="#182E72" strokeWidth="2" />
      <path d="M40 47C49 46 55 41 56 33C47 33 41 38 40 47Z" fill="#8BC34A" stroke="#182E72" strokeWidth="2" />
      <path d="M40 36C33 34 29 30 30 24C36 25 40 29 40 36Z" fill="#8BC34A" stroke="#182E72" strokeWidth="2" />
      <path d="M40 36C47 34 51 30 50 24C44 25 40 29 40 36Z" fill="#8BC34A" stroke="#182E72" strokeWidth="2" />
      <path d="M40 8C36 3 28 6 28 12C28 18 35 23 40 27C45 23 52 18 52 12C52 6 44 3 40 8Z" fill="#F26A91" stroke="#182E72" strokeWidth="2.5" />
      <path d="M22 68H58" stroke="#182E72" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user_data, insights, account } = usePosterReducers();
  const user = user_data?.user;
  const relationship = user?.relationships?.[0];
  const partner = relationship?.partner;
  const isUser1 = relationship?.user1Id === user?.id;
  const activeSubscription = account?.activeSubscription ?? relationship?.subscription;
  const subscriptionIsActive = Boolean(
    activeSubscription &&
    activeSubscription?.status &&
    (typeof activeSubscription?.isActive === "boolean"
      ? activeSubscription?.isActive
      : activeSubscription?.status?.toUpperCase() !== "EXPIRED"),
  );
  const hasActiveSubscription = Boolean(
    subscriptionIsActive,
  );
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
  const startedOn = displayDate(currentWeek?.start?.toISOString());
  const dueDate = displayDate(currentWeek?.end?.toISOString());

  const dashboard = insights?.dashboard;
  const unionScore = Math.min(Math.max(Math.round(dashboard?.overallScore ?? 0), 0), 1000);
  const unionScorePercent = unionScore / 10;
  const unionScoreColor = scoreColor(unionScorePercent);
  const mine =
    dashboard?.user1?.id === userId
      ? dashboard?.user1
      : dashboard?.user2?.id === userId
        ? dashboard?.user2
        : dashboard?.user1;
  const dashboardPartner = mine === dashboard?.user1 ? dashboard?.user2 : dashboard?.user1;
  const userSubmitted = mine?.checkedIn === true;
  const partnerSubmitted = dashboardPartner?.checkedIn === true;
  const showExplorePlans = isUser1 && userSubmitted && partnerSubmitted && !hasActiveSubscription;
  const hasDashboardData = Boolean(
    dashboard &&
    typeof dashboard?.overallScore === "number" &&
    userSubmitted &&
    partnerSubmitted &&
    hasActiveSubscription,
  );
  const dashboardRecommendations = dashboard?.recommendations?.slice(0, 3) ?? [];
  const dashboardUserName = mine?.name || userName;
  const dashboardPartnerName = dashboardPartner?.name || partnerName;
  const statusLabel = (dashboard?.relationshipStatus || "Growing connection")
    ?.toLowerCase()
    ?.replace(/_/g, " ")
    ?.replace(/\b\w/g, (letter: any) => letter?.toUpperCase());

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
      <main className="min-h-full px-4 py-6 text-foreground sm:px-6 lg:px-10">
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
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-label={`Union score ${unionScore} out of 1000`} role="img">
                    <circle cx="60" cy="60" r="49" fill="none" className="stroke-muted" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="49"
                      fill="none"
                      className="transition-all duration-700"
                      style={{ stroke: unionScoreColor?.stroke }}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${unionScore * 0.3079} 307.9`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-extrabold tracking-tight ${unionScoreColor?.text}`}>
                      {unionScore}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="union-score-lock relative mx-auto mt-7 flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
                  <div className="union-score-lock__halo absolute inset-5 rounded-full" />
                  <div className="union-score-lock__ring absolute inset-1 rounded-full" />
                  <div className="union-score-lock__ring union-score-lock__ring--soft absolute inset-1 rounded-full" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-border/80 bg-background shadow-[0_2px_12px_rgba(35,25,80,0.08)] sm:h-28 sm:w-28">
                    <svg className="union-score-lock__icon h-14 w-14 sm:h-16 sm:w-16" viewBox="0 0 64 64" fill="none" aria-label="Union Score locked" role="img">
                      <g className="union-score-lock__body">
                        <rect x="16" y="27" width="32" height="25" rx="2.5" fill="#FF6E98" stroke="#182E72" strokeWidth="2" />
                        <path className="union-score-lock__heart" d="M32 34.5c-1.75-2.5-6-1.4-6 1.65 0 3.1 3.4 5.05 6 6.85 2.6-1.8 6-3.75 6-6.85 0-3.05-4.25-4.15-6-1.65Z" fill="#D83E72" />
                      </g>
                      <g className="union-score-lock__shackle" transform="rotate(0 21 28)">
                        <path d="M21 28V19.5C21 13.7 25.7 9 31.5 9h1C38.3 9 43 13.7 43 19.5V28" stroke="#182E72" strokeWidth="3" strokeLinecap="round" />
                        <path d="M24 28V19.5C24 15.4 27.4 12 31.5 12h1c4.1 0 7.5 3.4 7.5 7.5V28" stroke="#FFFFFF" strokeOpacity=".9" strokeWidth="1.5" strokeLinecap="round" />
                      </g>
                    </svg>
                  </div>
                </div>
              )}
              {hasDashboardData ? (
                <>
                  <div className={`mx-auto mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${unionScoreColor.bg} ${unionScoreColor.text}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${unionScoreColor?.dot}`} />
                    {statusLabel}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Score shown here is out of 1000</p>
                </>
              ) : (
                <>
                  <p className="mx-auto mt-7 max-w-md text-base leading-7 text-muted-foreground sm:text-base">
                    {!userSubmitted
                      ? "Once you both complete your check-ins, your Union Score will appear"
                      : !partnerSubmitted
                        ? "Your Union Score will appear when your partner completes their check-in."
                        : !hasActiveSubscription
                          ? isUser1
                            ? "Once you purchase a subscription, your Union Score will be unlocked for both of you."
                            : "Once your partner purchases a subscription, your score will be unlocked for both of you."
                          : "Your check-ins are complete. Your Union Score will appear here once analysis is ready."}
                  </p>

                </>
              )}
            </div>
          </Card>

          <div className="flex h-full flex-col gap-5">
            {!userSubmitted &&
              <Button asChild className="h-12 w-full rounded-xl text-sm shadow-lg shadow-primary/20">
                <Link href={APP_URL.LINKS.WEEKLY_CHECK_IN}>
                  Complete Weekly Check-in
                </Link>
              </Button>
            }
            {showExplorePlans && (
              <Button asChild className="h-12 w-full rounded-xl text-sm shadow-lg shadow-primary/20"
              >
                <Link href={APP_URL.LINKS.EXPLORE_PLANS}>
                  Explore Plans
                </Link>
              </Button>
            )}

            <Card
              id="insights"
              className="flex h-full flex-col rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-6"
            >
              <p className="text-sm font-extrabold text-center uppercase tracking-[0.12em] text-primary">
                Your Union
              </p>

              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {user?.profileImage ? (
                      <Image
                        width={56}
                        height={56}
                        src={API_BASE_URL + user?.profileImage}
                        alt={userName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      userInitials
                    )}
                  </div>
                  <p className="mt-2 text-sm font-bold">{hasDashboardData ? dashboardUserName : "You"}</p>
                  <p className={`mt-2 flex items-center justify-center gap-1 text-xs font-semibold ${userSubmitted ? "text-green-500" : "text-amber-600"}`}>
                    <Check className="h-3.5 w-3.5 bg-green-500 rounded-full text-white" />
                    {userSubmitted ? "Checked in" : "Waiting for check-in"}
                  </p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center">
                  {userSubmitted && partnerSubmitted ? (
                    <UnionGrowthIcon />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                      <Heart className="h-7 w-7 fill-current" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {partner?.profileImage ? (
                      <Image
                        width={56}
                        height={56}
                        src={API_BASE_URL + partner?.profileImage}
                        alt={partnerName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      partnerInitials
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm font-bold">{dashboardPartnerName}</p>
                  <p className={`mt-2 flex items-center justify-center gap-1 text-xs font-semibold ${partnerSubmitted ? "text-green-500" : "text-amber-600"}`}>
                    <Check className="h-3.5 w-3.5 bg-green-500 rounded-full text-white" />
                    {partnerSubmitted ? "Checked in" : "Waiting for check-in"}
                  </p>
                </div>
              </div>

              <div className="my-5 h-px bg-border" />
              {userSubmitted && partnerSubmitted ?
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Next check-in on</p>
                  <p className="mt-1 text-sm font-bold">{nextCheckInDate}</p>
                </div>
                :
                <div className="flex justify-between text-center items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in started on</p>
                    <p className="mt-1 text-sm font-bold">{startedOn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in due on</p>
                    <p className="mt-1 text-sm font-bold">{dueDate}</p>
                  </div>
                </div>}
              <div className="my-5 h-px bg-border" />
              <Link
                href={APP_URL.LINKS.INSIGHTS}
                className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline"
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
            {dashboardRecommendations?.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {dashboardRecommendations?.map((recommendation: any, index: any) => (
                  <Card key={recommendation?.id || `${recommendation?.title}-${index}`} className="overflow-hidden rounded-3xl border-border/70 bg-surface shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-primary/10 bg-primary/5 px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-primary">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="truncate uppercase">This week&apos;s focus</span>
                      </div>
                      {recommendation?.category && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                          {recommendation?.category}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-sm font-extrabold leading-7">{recommendation?.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{recommendation?.description}</p>
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
