"use client";

import {
  CheckSquare,
  Home,
  LogOut,
  TrendingUp,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_URL } from "@/constant/static";

const dashboardNavItems = [
  { label: "Home", icon: Home, href: APP_URL.LINKS.DASHBOARD },
  { label: "Tasks", icon: CheckSquare, href: APP_URL.LINKS.TASKS },
  { label: "Insights", icon: TrendingUp, href: APP_URL.LINKS.INSIGHTS },
  { label: "Account", icon: UserRound, href: APP_URL.LINKS.ACCOUNT },
];

interface DashboardSidebarProps {
  onLogout: () => void;
}

export function DashboardSidebar({ onLogout }: DashboardSidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="hidden h-full w-[248px] shrink-0 flex-col bg-surface px-5 py-6 lg:flex">
      <Link
        href={APP_URL.LINKS.HOME}
        aria-label="UnionAI home"
        className="group inline-flex w-full items-center justify-center relative z-50 shrink-0"
      >
        <img
          src={APP_URL.IMAGES.LOGO}
          alt="UnionAI"
          className="h-8 w-auto sm:h-9 dark:hidden"
        />
        <img
          src={APP_URL.IMAGES.LIGHT_LOGO}
          alt="UnionAI"
          className="hidden h-8 w-auto sm:h-9 dark:block"
        />
      </Link>

      <nav className="mt-8 space-y-1.5" aria-label="Dashboard navigation">
        {dashboardNavItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className="mt-auto flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut className="h-[18px] w-[18px]" />
        Log out
      </button>
    </aside>
  );
}

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(30,25,60,0.06)] backdrop-blur-xl lg:hidden"
      aria-label="Dashboard navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {dashboardNavItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={label}
              href={href}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-semibold ${isActive ? "text-primary" : "text-muted-foreground"
                }`}
            >
              <Icon
                className="h-6 w-6"
                strokeWidth={isActive ? 2.5 : 2}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
