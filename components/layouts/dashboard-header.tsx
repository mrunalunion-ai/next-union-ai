"use client";

import { Bell, Moon, Sun, UserCircle } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAppSelector } from "@/redux/hooks";
import { NotificationDrawer } from "./notification-drawer";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "U";
}

export function DashboardHeader() {
  const router = useRouter();
  const { user_data } = usePosterReducers();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = useAppSelector(
    (state) => state.combinedReducer.notifications?.unreadCount ?? 0,
  );
  const isDark = mounted && resolvedTheme === "dark";
  const user = user_data?.user;
  const userInitials = getInitials(user?.firstName, user?.lastName);
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="relative flex min-h-[64px] items-center justify-between px-4 py-3 backdrop-blur-xl sm:px-6 lg:justify-end lg:px-8">
        <div className="lg:hidden">
          <Link
            href={APP_URL.LINKS.DASHBOARD}
            aria-label="UnionAI home"
            className="group inline-flex items-center"
          >
            <img
              src={APP_URL.IMAGES.LOGO}
              alt="UnionAI"
              className="h-9 w-auto dark:hidden sm:h-10"
            />
            <img
              src={APP_URL.IMAGES.LIGHT_LOGO}
              alt="UnionAI"
              className="hidden h-9 w-auto dark:block sm:h-10"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => setNotificationsOpen(true)}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors duration-200 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            <Bell className="relative h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors duration-200 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            <span className="relative h-5 w-5">
              <Sun
                className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
              />
              <Moon
                className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
              />
            </span>
          </button>

          <div className="hidden h-7 w-px bg-border/70 sm:block" />

          {/* <button
            type="button"
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-foreground hover:shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_4px_14px_-2px_rgba(139,92,246,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
            onClick={() => router.push(APP_URL.LINKS.ACCOUNT)}
            title="Open account"
          >
            <UserCircle className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          </button> */}
          <button
            type="button"
            aria-label="Open account"
            onClick={() => router.push(APP_URL.LINKS.ACCOUNT)}
            className="group flex h-10 items-center gap-2 rounded-full bg-surface py-1 pl-1 pr-3 transition-all hover:bg-primary/5 duration-300 hover:border-primary/40"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#e85d9e] text-xs font-bold text-white ring-2 ring-white/40 dark:ring-white/10">
              {userInitials}
            </span>
            <span className="hidden max-w-[120px] truncate text-sm font-semibold text-foreground sm:block">
              {displayName}
            </span>
          </button>

        </div>
        <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </header>
      <NotificationDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}
