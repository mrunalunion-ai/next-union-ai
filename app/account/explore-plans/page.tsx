"use client";

import {
  Check,
  Crown,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { AccountPageHeader } from "@/components/account/account-ui";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  initialAccountState,
  setAccountLoading,
} from "@/redux/modules/account";
import { IAccountPlan } from "@/redux/modules/account/types";
import { useWebSocket } from "@/services/socket/WebSocketContext";

type Currency = "USD" | "GBP";

const includedFeatures = [
  "Exclusive Premium Contents",
  "Early Features",
  "Priority Support",
  "Premium insights & analysis",
  "Weekly Relationship Check-ins",
  "Unlimited AI Analysis",
];

function getPlanPrice(plan: IAccountPlan, currency: Currency) {
  return currency === "GBP" ? plan.priceGBP : plan.priceUSD;
}

function formatDuration(plan: IAccountPlan) {
  const unit = plan.durationUnit?.toLowerCase() || "month";
  return `${plan.duration} ${unit}`;
}

export default function ExplorePlansPage() {
  const dispatch = useAppDispatch();
  const { user_data } = usePosterReducers();
  const { isConnected, sendMessage } = useWebSocket();
  const account = useAppSelector(
    (state) => state.combinedReducer.account ?? initialAccountState,
  );
  const [currency, setCurrency] = useState<Currency>("USD");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const userId = user_data?.user?.id ?? "";

  const loadPlans = useCallback(() => {
    if (!isConnected) return;

    dispatch(setAccountLoading(true));
    sendMessage("action", {
      type: "subscriptionPlanService",
      action: "list",
      payload: {
        page: 1,
        limit: 100,
        search: "",
        active: true,
        isFeature: true,
      },
    });

    if (userId) {
      sendMessage("action", {
        type: "subscriptionService",
        action: "getActive",
        payload: { user_id: userId },
      });
    }
  }, [dispatch, isConnected, sendMessage, userId]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (!selectedPlanId && account.plans.length) {
      const preferredPlan =
        account.plans.find((plan) => plan.isPopular || plan.isBestValue) ??
        account.plans[0];
      setSelectedPlanId(preferredPlan.id);
    }
  }, [account.plans, selectedPlanId]);

  const selectedPlan = useMemo(
    () => account.plans.find((plan) => plan.id === selectedPlanId),
    [account.plans, selectedPlanId],
  );

  const subscribe = () => {
    if (!selectedPlan) return;

    toast.info("Subscription checkout will be available soon.");
  };

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
            <AccountPageHeader
              title="Explore Plans"
              description="Choose the plan that fits your shared relationship journey."
              showBack
            />

          {account.activeSubscription && (
            <Card className="mb-6 rounded-3xl border-primary/20 bg-primary/[0.04] p-5 shadow-sm">
              <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
                Current plan
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold">
                  {account.activeSubscription.planName}
                </h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
                  {account.activeSubscription.status}
                </span>
              </div>
            </Card>
          )}

          <section className="mb-10">
            <h1 className="text-xl font-bold tracking-tight sm:text-xl">
              What will you get
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-sm">
              All features included in every plan &amp; free trial
            </p>

            <Card className="mt-6 rounded-3xl border-border/70 bg-surface p-5 text-left shadow-sm sm:p-7 lg:p-8">
              <ul className="grid gap-4 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-5">
                {includedFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex min-w-0 items-start gap-3 text-sm leading-6 text-foreground sm:text-sm"
                  >
                    <Check className="h-5 w-5 shrink-0 rounded-full bg-emerald-500 p-1 text-white" />
                    <span className="min-w-0 break-words">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section aria-labelledby="choose-duration-heading">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2
                id="choose-duration-heading"
                className="text-xl font-bold tracking-tight sm:text-xl"
              >
                Choose your duration
              </h2>
              <div className="flex w-full rounded-xl border border-border bg-surface p-1 sm:w-auto">
                {(["USD", "GBP"] as Currency[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCurrency(option)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${currency === option
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    $ {option}
                  </button>
                ))}
              </div>
            </div>

            {account.loading && account.plans.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-64 animate-pulse rounded-3xl bg-muted"
                  />
                ))}
              </div>
            ) : account.plans.length === 0 ? (
              <Card className="rounded-3xl p-10 text-center shadow-sm">
                <Crown className="mx-auto h-10 w-10 text-primary/50" />
                <h2 className="mt-4 font-extrabold">Plans are not available</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please try again when the subscription service is available.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
                {account?.plans?.map((plan) => {
                  const selected = plan?.id === selectedPlanId;
                  const price = getPlanPrice(plan, currency);

                  return (
                    <button
                      key={plan?.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan?.id)}
                      aria-pressed={selected}
                      className="group w-full text-left"
                    >
                      <Card
                        className={`relative flex min-h-[142px] h-full flex-col rounded-3xl bg-surface p-5 shadow-sm transition-all duration-200 ${selected
                            ? "border-2 border-primary ring-4 ring-primary/10"
                            : "border border-border/70 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                          }`}
                      >
                        {/* Plan Name */}
                        <div className="">
                          <p className="text-base font-bold uppercase leading-6 text-primary">
                            {plan.name}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="mt-5 flex items-baseline">
                          <span className="text-[25px] font-bold leading-none tracking-tight text-foreground">
                            {currency === "USD" ? "$" : "£"}
                            {price.toFixed(2)}
                          </span>

                          <span className="ml-1 text-sm font-medium text-muted-foreground">
                            /mo
                          </span>
                        </div>

                        {/* Trial */}
                        <div className="mt-2">
                          {plan.trialDays > 0 ? (
                            <p className="text-sm font-medium leading-5 text-muted-foreground">
                              + {plan.trialDays} days free trial
                            </p>
                          ) : (
                            <p className="text-sm leading-5 text-transparent">
                              &nbsp;
                            </p>
                          )}
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {account.plans.length > 0 && (
            <section className="mt-8 flex flex-col gap-5 rounded-2xl sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  Secured with standard 256-bit encryption. Cancel anytime.
                </span>
              </p>
              <Button
                type="button"
                className="default w-full !px-20 sm:w-auto"
                disabled={!selectedPlan}
                onClick={subscribe}
              >
                Subscribe
              </Button>
            </section>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
