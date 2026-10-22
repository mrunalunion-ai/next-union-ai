"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constant/static";

export interface PublicPlan {
  id: string;
  code: string;
  name: string;
  tag?: string;
  active: boolean;
  deletedAt?: string | null;
  duration: number;
  durationUnit: string;
  isFree: boolean;
  priceGBP: string | number;
  priceUSD: string | number;
  trialDays: number;
}

export interface PublicPlanFeature {
  id: string;
  name: string;
  active: boolean;
  deletedAt?: string | null;
}

type Currency = "USD" | "GBP";

function formatPlanDuration(plan: PublicPlan) {
  const duration = Number(plan.duration) || 1;
  const unit = (plan.durationUnit || "MONTHS").toLowerCase().replace(/s$/, "");
  return `${duration} ${unit}${duration === 1 ? "" : "s"}`;
}

function formatPlanPrice(plan: PublicPlan, currency: Currency) {
  if (plan.isFree) return "Free";
  const amount = Number(currency === "USD" ? plan.priceUSD : plan.priceGBP);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

export function PlanPricing({ plans, features }: { plans: PublicPlan[]; features: PublicPlanFeature[] }) {
  const [currency, setCurrency] = useState<Currency>("USD");

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Choose the plan that fits your shared rhythm.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/75 sm:text-base">
          Every plan includes the same relationship tools. Choose a duration and view prices in your currency.
        </p>

        <div className="mt-6 inline-flex rounded-full border border-border/80 bg-card p-1 shadow-sm" role="group" aria-label="Choose price currency">
          {(["USD", "GBP"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={currency === option}
              onClick={() => setCurrency(option)}
              className={`min-w-24 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${currency === option ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {option === "USD" ? "$ USD" : "£ GBP"}
            </button>
          ))}
        </div>
      </div>

      {plans.length > 0 ? (
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.id} className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:p-6">
              <div className="flex min-h-8 items-center justify-between gap-3">
                <h3 className="min-w-0 truncate text-lg font-bold">{plan.name || formatPlanDuration(plan)}</h3>
                {plan.tag ? <span className="max-w-[48%] truncate rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{plan.tag}</span> : null}
              </div>
              {/* <p className="mt-1 text-sm text-muted-foreground">Billed every {formatPlanDuration(plan)}</p> */}
              <div className="mt-5 border-t border-border/70 pt-5">
                <p className="text-3xl font-extrabold tracking-tight text-foreground">{formatPlanPrice(plan, currency)}</p>
                {!plan.isFree && <p className="mt-1 text-xs text-muted-foreground">{currency} for {formatPlanDuration(plan)}</p>}
              </div>
              {plan.trialDays > 0 ? (
                <p className="mt-5 inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {plan.trialDays}-day free trial
                </p>
              ) : <p className="mt-5 text-xs text-muted-foreground">No free trial</p>}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-border/70 bg-background p-6 text-center text-sm text-muted-foreground">Plans are temporarily unavailable. Please check back soon.</p>
      )}

      {features.length > 0 && (
        <div className="mt-8 rounded-3xl border border-border/70 bg-card p-5 text-card-foreground shadow-sm sm:p-7">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Shared across all plans</p>
            <h3 className="mt-2 text-lg font-bold">Everything you need to grow together</h3>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <li key={feature.id} className="flex items-start gap-3 rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><Check className="h-3.5 w-3.5" /></span>
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
