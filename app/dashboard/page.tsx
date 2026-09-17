"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckSquare,
  Heart,
  Lightbulb,
  LockKeyhole,
  Medal,
} from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useEffect } from "react";
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

export default function DashboardPage() {
  const { user_data } = usePosterReducers();
  const user = user_data?.user;
  const relationship = user?.relationships?.[0];
  const partner = relationship?.partner;
  const { isConnected, lastEvent, sendMessage } = useWebSocket();

  const userName = user?.firstName?.trim() || "there";
  const partnerName =
    `${partner?.firstName ?? ""} ${partner?.lastName ?? ""}`.trim() ||
    "Your partner";
  const userInitials = getInitials(user?.firstName, user?.lastName);
  const partnerInitials = getInitials(partner?.firstName, partner?.lastName);
  const startedOn = displayDate(relationship?.createdAt);
  const dueDate = displayDate(
    relationship?.createdAt
      ? new Date(
        new Date(relationship.createdAt).getTime() +
        6 * 24 * 60 * 60 * 1000,
      ).toISOString()
      : undefined,
    "Complete your first check-in",
  );

  useEffect(() => {
    if (!isConnected) return;
    sendMessage("action", { type: "userService", action: "get", payload: {} });
  }, [isConnected])

  return (
    <DashboardLayout>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pb-10">
        <section className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Good to see you, {userName}
            </p>
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

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden rounded-3xl border-border/70 bg-surface shadow-sm">
            <div className="p-6 text-center sm:p-8 lg:p-10">
              <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-primary">
                Union Score
              </p>
              <div className="relative mx-auto mt-7 flex h-48 w-48 items-center justify-center rounded-full bg-[conic-gradient(from_210deg,rgba(114,83,229,0.12),rgba(114,83,229,0.12)_8%,transparent_8%,transparent_100%)] sm:h-56 sm:w-56">
                <div className="absolute inset-4 rounded-full border border-primary/10 shadow-[0_0_45px_rgba(114,83,229,0.18)]" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-border bg-background shadow-sm sm:h-28 sm:w-28">
                  <LockKeyhole className="h-12 w-12 text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <p className="mx-auto mt-7 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
                Once you both complete your check-ins, your Union Score will appear.
              </p>
            </div>
          </Card>

          <div className="flex flex-col gap-5">
            <Button
              asChild
              className="h-14 w-full rounded-2xl text-base shadow-lg shadow-primary/20"
            >
              <Link href={APP_URL.LINKS.WEEKLY_CHECK_IN}>
                <CheckSquare className="mr-2 h-5 w-5" />
                Complete Weekly Check-in
              </Link>
            </Button>

            <Card
              id="insights"
              className="flex-1 rounded-3xl border-border/70 bg-surface p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-primary">
                  Your Union
                </p>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                  In progress
                </span>
              </div>

              <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {userInitials}
                  </div>
                  <p className="mt-2 text-sm font-bold">You</p>
                  <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-amber-600">
                    <Check className="h-3.5 w-3.5" />
                    Waiting for check-in
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <Heart className="h-7 w-7 fill-current" />
                </div>

                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {partnerInitials}
                  </div>
                  <p className="mt-2 truncate text-sm font-bold">{partnerName}</p>
                  <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-amber-600">
                    <Check className="h-3.5 w-3.5" />
                    Waiting for check-in
                  </p>
                </div>
              </div>

              <div className="my-7 h-px bg-border" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Check-in started on</p>
                  <p className="mt-2 text-sm font-bold sm:text-base">{startedOn}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-in due on</p>
                  <p className="mt-2 text-sm font-bold sm:text-base">{dueDate}</p>
                </div>
              </div>

              <Link
                href="#insights"
                className="mt-7 flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                View Insights
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>

        <section id="tasks" className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl border-border/70 bg-surface p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Lightbulb className="h-4 w-4" />
            </div>
            <p className="mt-4 text-sm font-bold">Today&apos;s reflection</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Take two minutes to share what made you smile today.
            </p>
          </Card>

          <Card className="rounded-2xl border-border/70 bg-surface p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Medal className="h-4 w-4" />
            </div>
            <p className="mt-4 text-sm font-bold">Keep your streak</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              You&apos;re building a healthier habit together.
            </p>
          </Card>

          <Card className="rounded-2xl border-border/70 bg-surface p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <CalendarDays className="h-4 w-4" />
            </div>
            <p className="mt-4 text-sm font-bold">Next check-in</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              A gentle moment to reconnect is waiting.
            </p>
          </Card>
        </section>
      </main>
    </DashboardLayout>
  );
}
