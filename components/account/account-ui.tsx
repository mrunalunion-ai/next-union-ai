"use client";

import { ArrowLeft, Bell, ChevronRight, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { APP_URL } from "@/constant/static";

export function AccountSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-sm font-bold text-muted-foreground">{title}</h2>
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-surface shadow-sm">
        {children}
      </Card>
    </section>
  );
}

export function AccountRow({
  icon: Icon,
  label,
  description,
  onClick,
  destructive = false,
  className,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick: () => void;
  destructive?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-border/60 px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/60 ${destructive ? "text-destructive" : "text-foreground"}`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${className ? className : "text-primary"}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function AccountPageHeader({
  title,
  description,
  showBack = false,
}: {
  title: string;
  description?: string;
  showBack?: boolean;
}) {
  const router = useRouter();

  return (
    <header className="mb-8">
      {showBack && (
        <button
          type="button"
          onClick={() => router.push(APP_URL.LINKS.ACCOUNT)}
          className="mb-3 inline-flex items-center gap-2 rounded-lg py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:underline hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}
      <h1 className="text-xl font-extrabold tracking-tight">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
    </header>
  );
}

export function SettingRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[56px] items-center gap-3 border-b border-border/60 px-4 py-3 text-left text-foreground transition-colors last:border-b-0 hover:bg-muted/60">
      <Icon className="h-5 w-5 shrink-0 text-primary" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-5">
          {label}
        </p>
      </div>

      <div className="ml-3 flex shrink-0 items-center">
        {children}
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"
        }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-[left] ${checked ? "left-6" : "left-1"
          }`}
      />
    </button>
  );
}
