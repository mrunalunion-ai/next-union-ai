"use client";

import {
  Check,
  Crown,
  LockKeyhole,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import { AccountPageHeader } from "@/components/account/account-ui";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StripeCheckoutModal } from "@/components/payment";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import {
  initialAccountState,
  setAccountLoading,
} from "@/redux/modules/account";
import { IAccountPlan, IPlanFeature } from "@/redux/modules/account/types";
import { useWebSocket } from "@/services/socket/WebSocketContext";

type Currency = "USD" | "GBP";

function getPlanPrice(plan: IAccountPlan, currency: Currency) {
  if (plan.availableCurrencies && !plan.availableCurrencies.includes(currency)) return null;
  const numericPrice = Number(currency === "USD" ? plan.priceUSD : plan.priceGBP);

  return Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : null;
}

function formatDuration(plan: IAccountPlan) {
  const unit = (plan.durationUnit || "MONTHS").toLowerCase().replace(/s$/, "");
  const duration = Number.isFinite(Number(plan.duration)) && Number(plan.duration) > 0 ? Number(plan.duration) : 1;
  return `${duration} ${unit}${duration === 1 ? "" : "s"}`;
}

function formatBillingInterval(plan: IAccountPlan) {
  const rawDuration = Number(plan.duration);
  const duration = Number.isFinite(rawDuration) && rawDuration > 0 ? rawDuration : 1;
  const rawUnit = (plan.durationUnit || "MONTHS").toLowerCase().replace(/s$/, "");
  const unit = ["day", "month"].includes(rawUnit) ? rawUnit : "month";
  return `/${duration > 1 ? `${duration} ` : ""}${unit}${duration > 1 ? "s" : ""}`;
}

function createCheckoutRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0").slice(-12)}`;
}

function PlanCard({
  plan,
  currency,
  selected,
  current = false,
  trialEligible = false,
  onSelect,
}: {
  plan: IAccountPlan;
  currency: Currency;
  selected: boolean;
  current?: boolean;
  trialEligible?: boolean;
  onSelect: () => void;
}) {
  const price = getPlanPrice(plan, currency);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={price === null}
      aria-pressed={selected}
      className="group w-full text-left disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Card
        className={`relative flex min-h-[142px] h-full flex-col rounded-3xl bg-surface p-5 shadow-sm transition-all duration-200 ${selected
          ? "border-2 border-primary ring-4 ring-primary/10"
          : "border border-border/70 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-bold uppercase leading-6 text-primary">
            {plan.name || formatDuration(plan)}
          </p>
          <span className="rounded-lg bg-muted px-3 py-1 text-sm font-bold text-muted-foreground">
            {plan.tag || "Subscription"}
          </span>
          {current && (
            <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
              Current Plan
            </span>
          )}
        </div>
        <div className="mt-5 flex items-baseline">
          <span className="text-[25px] font-bold leading-none tracking-tight text-foreground">
            {price === null ? "Unavailable" : `${currency === "USD" ? "$" : "£"}${price.toFixed(2)}`}
          </span>
          <span className="ml-1 text-sm font-medium text-muted-foreground">{formatBillingInterval(plan)}</span>
        </div>
        <div className="mt-2 min-h-5">
          {trialEligible && plan?.trialDays > 0 && (
            <p className="text-sm font-medium leading-5 text-muted-foreground">
              + {plan.trialDays} days free trial
            </p>
          )}
        </div>
      </Card>
    </button>
  );
}

export default function ExplorePlansPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user_data, account } = usePosterReducers();
  const { isConnected, sendMessage } = useWebSocket();
  const accountState = account ?? initialAccountState;
  const planFeatures: IPlanFeature[] = accountState?.planFeatures ?? [];
  const [checkoutReturn, setCheckoutReturn] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const checkoutRequestId = useRef<string | null>(null);
  const userId = user_data?.user?.id ?? "";
  const relationship = user_data?.user?.relationships?.[0];
  const isUser1 = relationship?.user1Id === userId;
  const trialEligible = relationship?.subscription?.subscriptionEligibility?.canUseFirstPurchaseTrial === true;
  const subscriptionCandidate = accountState?.activeSubscription ?? relationship?.subscription;
  const subscriptionStatus = String(subscriptionCandidate?.status ?? "").toUpperCase();
  const hasBlockingSubscription = ["ACTIVE", "PENDING", "GRACE_PERIOD", "BILLING_RETRY", "ON_HOLD"].includes(subscriptionStatus);
  const activeSubscription = subscriptionCandidate?.planId &&
    subscriptionCandidate?.status?.toUpperCase() === "ACTIVE" &&
    subscriptionCandidate?.isActive !== false
    ? subscriptionCandidate
    : null;
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const availablePlans = useMemo(
    () => accountState.plans.filter((plan: IAccountPlan) => {
      const price = getPlanPrice(plan, currency);
      const duration = Number(plan.duration);
      const unit = plan.durationUnit?.toUpperCase();
      return Boolean(plan.id) && price !== null && Number.isFinite(duration) && duration > 0 &&
        ["DAY", "DAYS", "MONTH", "MONTHS"].includes(unit ?? "");
    }),
    [accountState.plans, currency],
  );
  const selectedPlanForPrice = accountState.plans.find((plan: IAccountPlan) => plan.id === selectedPlanId);
  const selectedPlanPrice = selectedPlanForPrice ? getPlanPrice(selectedPlanForPrice, currency) : null;

  const loadPlans = useCallback(() => {
    if (!isConnected || !isUser1) return;
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
  }, [dispatch, isConnected, isUser1, sendMessage]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("checkout");
    if (result === "success" || result === "cancelled") setCheckoutReturn(result);
  }, []);

  useEffect(() => {
    if (!checkoutReturn || !isConnected) return;
    sendMessage("action", { type: "userService", action: "get", payload: {} });
    const refresh = window.setInterval(() => {
      sendMessage("action", { type: "userService", action: "get", payload: {} });
    }, 2500);
    const stop = window.setTimeout(() => window.clearInterval(refresh), 30000);
    return () => {
      window.clearInterval(refresh);
      window.clearTimeout(stop);
    };
  }, [checkoutReturn, isConnected, sendMessage]);

  useEffect(() => {
    if (checkoutReturn !== "success" || !activeSubscription) return;
    toast.success("Your subscription is active.");
    router.replace("/account/explore-plans");
  }, [activeSubscription, checkoutReturn, router]);



  useEffect(() => {
    const plansWithValidPrice = availablePlans;
    const selectablePlans = activeSubscription
      ? plansWithValidPrice.filter((plan: IAccountPlan) => plan?.id !== activeSubscription?.planId)
      : plansWithValidPrice;

    if (!selectablePlans?.length) {
      if (selectedPlanId) setSelectedPlanId("");
      return;
    }

    if (!selectedPlanId || !selectablePlans?.some((plan: any) => plan?.id === selectedPlanId)) {
      const preferredPlan =
        selectablePlans?.find((plan: any) => plan?.isPopular || plan?.isBestValue) ??
        selectablePlans[0];
      setSelectedPlanId(preferredPlan?.id);
    }
  }, [availablePlans, activeSubscription, selectedPlanId]);

  const selectedPlan = useMemo(
    () => availablePlans.find((plan: IAccountPlan) => plan.id === selectedPlanId),
    [availablePlans, selectedPlanId],
  );

  const subscribe = () => {
    if (!isUser1 || !selectedPlan) return;
    void confirmSubscription();
  };

  const confirmSubscription = () => {
    if (!isUser1 || !selectedPlan) return;
    checkoutRequestId.current ??= createCheckoutRequestId();
    setCheckoutOpen(true);
  };

  const currentPlan = accountState?.plans?.find((plan: any) => plan?.id === activeSubscription?.planId);
  const otherPlans = availablePlans.filter((plan: IAccountPlan) => plan?.id !== activeSubscription?.planId);

  if (!isUser1) {
    return (
      <DashboardLayout>
        <main className="min-h-full px-4 py-6 text-foreground sm:px-6 lg:px-10">
          <div className="mx-auto">
            <AccountPageHeader
              title="Subscription"
              description="Your partner manages the Union subscription"
              showBack
            />
            <Card className="rounded-3xl p-10 text-center shadow-sm">
              <LockKeyhole className="mx-auto h-10 w-10 text-primary/50" />
              <h2 className="mt-4 font-extrabold">Subscription managed by your partner</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Once your partner purchases a subscription, your Union Score will be unlocked for both of you.
              </p>
              <Button className="mt-5" onClick={() => router.back()}>
                Go back
              </Button>
            </Card>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="min-h-full px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <AccountPageHeader
            title="Explore Plans"
            description="Choose the plan that fits your shared relationship journey"
            showBack
          />

          <section className="mb-10">
            <h1 className="text-xl font-bold tracking-tight sm:text-xl">
              What will you get
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-sm">
              Explore the features included with a subscription
            </p>

            <Card className="mt-6 rounded-3xl border-border/70 bg-surface p-5 text-left shadow-sm sm:p-7 lg:p-8">
              <ul className="grid gap-4 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-5">
                {planFeatures?.length > 0 ? (
                  planFeatures?.map((feature) => (
                    <li
                      key={feature?.id}
                      className="flex min-w-0 items-start gap-3 text-sm leading-6 text-foreground sm:text-sm"
                    >
                      <Check className="h-5 w-5 shrink-0 rounded-full bg-emerald-500 p-1 text-white" />
                      <span className="min-w-0 break-words">{feature?.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="col-span-2 text-center text-muted-foreground">Loading features...</li>
                )}
              </ul>
            </Card>
          </section>

          <section aria-labelledby="choose-duration-heading">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2
                id="choose-duration-heading"
                className="text-xl font-bold tracking-tight sm:text-xl"
              >
                {activeSubscription ? "Current Plan" : "Choose your duration"}
              </h2>
              <div className="flex w-full rounded-xl border border-border bg-surface p-1 sm:w-auto" role="group" aria-label="Subscription currency">
                {(["USD", "GBP"] as Currency[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={currency === option}
                    onClick={() => {
                      if (currency === option) return;
                      setCurrency(option);
                      setSelectedPlanId("");
                      checkoutRequestId.current = null;
                    }}
                    className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${currency === option
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    {option === "USD" ? "$" : "£"} {option}
                  </button>
                ))}
              </div>
            </div>

            {checkoutReturn === "cancelled" && (
              <Card className="mb-5 rounded-2xl border-amber-500/30 bg-amber-500/5 p-4 text-sm" role="status">
                Checkout was cancelled. No payment was confirmed and your existing subscription has not been changed.
              </Card>
            )}
            {checkoutReturn === "success" && !activeSubscription && (
              <Card className="mb-5 rounded-2xl border-primary/30 bg-primary/5 p-4 text-sm" role="status">
                Payment return received. We’re confirming your subscription with the server; this can take a short time. You can safely leave this page and return later.
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => sendMessage("action", { type: "userService", action: "get", payload: {} })}
                >
                  Check status again
                </Button>
              </Card>
            )}
            {hasBlockingSubscription && !activeSubscription && (
              <Card className="mb-5 rounded-2xl border-amber-500/30 bg-amber-500/5 p-4 text-sm" role="status">
                Your subscription is {subscriptionStatus.toLowerCase()}. We’ll confirm its latest status before another checkout can start.
              </Card>
            )}

            {accountState?.loading && accountState?.plans?.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
                {[1, 2, 3, 4]?.map((item) => (
                  <div
                    key={item}
                    className="h-64 animate-pulse rounded-3xl bg-muted"
                  />
                ))}
              </div>
            ) : availablePlans.length === 0 ? (
              <Card className="rounded-3xl p-10 text-center shadow-sm">
                <Crown className="mx-auto h-10 w-10 text-primary/50" />
                <h2 className="mt-4 font-extrabold">{accountState.error ? "Plans could not be loaded" : "Plans are not available"}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {accountState.error ? "Check your connection and try again." : "Please try again when the subscription service is available."}
                </p>
                {accountState.error && <Button className="mt-5" onClick={loadPlans}>Retry</Button>}
              </Card>
            ) : (
              <>
                {activeSubscription && currentPlan && (
                  <div className="mb-7 max-w-md">
                    <PlanCard
                      plan={currentPlan}
                      currency={currency}
                      selected={false}
                      current
                      trialEligible={trialEligible}
                      onSelect={() => toast.info("This is your current plan.")}
                    />
                  </div>
                )}

                {activeSubscription && (
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold tracking-tight">Other Plans</h2>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
                  {(activeSubscription ? otherPlans : availablePlans)?.map((plan: any) => {
                    const selected = plan?.id === selectedPlanId;

                    return (
                      <PlanCard
                        key={plan?.id}
                        plan={plan}
                        currency={currency}
                        selected={selected}
                        trialEligible={trialEligible}
                        onSelect={() => { setSelectedPlanId(plan?.id); checkoutRequestId.current = null; }}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {availablePlans.length > 0 && (
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
                disabled={!selectedPlan || hasBlockingSubscription}
                onClick={subscribe}
              >
                {activeSubscription ? "Subscription active" : hasBlockingSubscription ? "Subscription needs attention" : "Subscribe"}
              </Button>
            </section>
          )}
        </div>

        {selectedPlan && selectedPlanPrice !== null && (
          <StripeCheckoutModal
            open={checkoutOpen}
            onOpenChange={(open) => {
              setCheckoutOpen(open);
              if (!open) checkoutRequestId.current = null;
            }}
            planId={selectedPlan.id}
            amount={selectedPlanPrice}
            currency={currency}
            checkoutRequestId={checkoutRequestId.current ?? createCheckoutRequestId()}
          />
        )}
      </main>
    </DashboardLayout>
  );
}
