"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { usePosterReducers } from "@/redux/getdata/usePostReducer";

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "U";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function DashboardHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user_data } = usePosterReducers();
  const [mounted, setMounted] = useState(false);
  const user = user_data?.user;
  const userInitials = getInitials(user?.firstName, user?.lastName);
  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-border/60 bg-surface/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <div className="lg:hidden">
        <img
          src="/assets/images/logo.svg"
          alt="UnionAI"
          className="h-8 w-auto"
        />
      </div>

      <div className="hidden lg:block">
        <p className="text-xs font-medium text-muted-foreground">
          Your relationship dashboard
        </p>
        <p className="mt-1 text-sm font-bold">
          {formatDate(new Date().toISOString())}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        <button
          type="button"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
        >
          {mounted && (isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
        </button>

        <div className="hidden h-9 w-px bg-border sm:block" />

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {userInitials}
          </div>
          <span className="max-w-[90px] truncate text-xs font-semibold sm:max-w-none sm:text-sm">
            {user?.firstName || "Account"}
          </span>
        </div>
      </div>
    </header>
  );
}
