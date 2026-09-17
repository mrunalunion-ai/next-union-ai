"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_URL } from "@/constant/static";
import { CheckSquare, Home, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: APP_URL.LINKS.DASHBOARD, label: "Dashboard", icon: Home },
  {
    href: APP_URL.LINKS.WEEKLY_CHECK_IN,
    label: "Weekly check-in",
    icon: CheckSquare,
  },
  { href: APP_URL.LINKS.SETTINGS, label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-surface p-4 lg:block">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              pathname === href && "bg-primary/10 text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
