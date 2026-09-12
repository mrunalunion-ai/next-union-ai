"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_URL } from "@/constant/static";

const NAV_ITEMS = [
  { href: APP_URL.LINKS.DASHBOARD, label: "Dashboard" },
  { href: APP_URL.LINKS.SETTINGS, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r p-4">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm hover:bg-accent",
              pathname === item.href && "bg-accent font-medium"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
