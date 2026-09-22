"use client";

import {
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Info,
  ReceiptText,
  RefreshCw,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "react-toastify";

import { AccountPageHeader } from "@/components/account/account-ui";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useWebSocket } from "@/services/socket/WebSocketContext";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
}

function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 0;
  const difference = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
}

function durationLabel(days: number) {
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"}`;
}

function DetailCard({
  icon: Icon,
  label,
  value,
  valueClassName = "text-foreground",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className={`mt-3 text-base font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}

export default function CurrentPlanPage() {
  const router = useRouter();
  const { user_data, account } = usePosterReducers();
  const { isConnected, sendMessage } = useWebSocket();
  const relationship = user_data?.user?.relationships?.[0];
  const subscription = account?.activeSubscription ?? relationship?.subscription;

  useEffect(() => {
    if (!isConnected) return;
    sendMessage("action", { type: "userService", action: "get", payload: {} });
  }, [isConnected, sendMessage]);

  const remainingDays = useMemo(
    () => Math.max(0, daysBetween(new Date().toISOString(), subscription?.endDate)),
    [subscription?.endDate],
  );
  const totalDays = daysBetween(subscription?.startDate, subscription?.endDate);
  const isActive = Boolean(
    subscription &&
    subscription.status &&
    typeof subscription.isActive === "boolean"
      ? subscription.isActive
      : subscription?.status?.toUpperCase() !== "EXPIRED",
  );
  const purchaser = subscription?.ownerUserId === user_data?.user?.id ? "You" : "Partner";

  const copyTransactionId = async () => {
    if (!subscription?.transactionId) return;
    await navigator.clipboard?.writeText(subscription.transactionId);
    toast.success("Transaction ID copied");
  };

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <AccountPageHeader
            title="Current Plan"
            description="View your active subscription and relationship access."
            showBack
          />

          {!isActive ? (
            <Card className="rounded-3xl border-border/70 bg-surface p-10 text-center shadow-sm">
              <ReceiptText className="mx-auto h-10 w-10 text-primary/60" />
              <h2 className="mt-4 text-lg font-extrabold">No active plan</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Choose a plan to unlock shared relationship scores and insights.
              </p>
              <Button className="mt-6" onClick={() => router.push(APP_URL.LINKS.EXPLORE_PLANS)}>
                Explore Plans
              </Button>
            </Card>
          ) : (
            <>
              <Card className="rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      {subscription?.isShared ? "Shared subscription" : "Subscription"}
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                      {subscription?.planName || "Premium plan"}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold capitalize text-emerald-600">
                    <Check className="h-3.5 w-3.5" />
                    {subscription?.status?.toLowerCase() || "active"}
                  </span>
                </div>

                <div className="my-6 h-px bg-border" />

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailCard icon={CalendarDays} label="Start date" value={formatDate(subscription?.startDate)} />
                  <DetailCard icon={CalendarDays} label="End date" value={formatDate(subscription?.endDate)} />
                  <DetailCard icon={Clock3} label="Duration" value={durationLabel(totalDays)} />
                  <DetailCard
                    icon={Clock3}
                    label="Remaining"
                    value={`${remainingDays} day${remainingDays === 1 ? "" : "s"}`}
                    valueClassName={remainingDays <= 7 ? "text-destructive" : undefined}
                  />
                </div>

                <div className="my-6 h-px bg-border" />

                <div className="rounded-xl border border-border/70 bg-background p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ReceiptText className="h-4 w-4" />
                    <span>Transaction ID</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {subscription?.transactionId || "—"}
                    </p>
                    <button
                      type="button"
                      onClick={copyTransactionId}
                      disabled={!subscription?.transactionId}
                      className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
                      aria-label="Copy transaction ID"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    {purchaser === "You" ? <UserRound className="h-5 w-5 text-primary" /> : <UsersRound className="h-5 w-5 text-emerald-600" />}
                    <span className="text-sm text-muted-foreground">Purchased by</span>
                    <strong className="ml-auto rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">{purchaser}</strong>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background p-4">
                    <RefreshCw className={`h-5 w-5 ${subscription?.autoRenew ? "text-emerald-600" : "text-muted-foreground"}`} />
                    <span className="text-sm text-muted-foreground">Auto renew</span>
                    <strong className={`ml-auto rounded-lg px-3 py-1 text-sm ${subscription?.autoRenew ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {subscription?.autoRenew ? "On" : "Off"}
                    </strong>
                  </div>
                </div>
              </Card>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>
                  Upgrades are queued for the next billing period. Your current access remains active until {formatDate(subscription?.endDate)}.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button onClick={() => router.push(APP_URL.LINKS.EXPLORE_PLANS)}>
                  Upgrade Plan
                </Button>
                <Button variant="outline" onClick={() => router.push(APP_URL.LINKS.TRANSACTIONS)}>
                  View Transactions
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
