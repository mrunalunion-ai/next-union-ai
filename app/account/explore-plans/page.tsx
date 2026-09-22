"use client";

import {
  Check,
  Crown,
  LockKeyhole,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import { AccountPageHeader } from "@/components/account/account-ui";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
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

function PlanCard({
  plan,
  currency,
  selected,
  current = false,
  onSelect,
}: {
  plan: IAccountPlan;
  currency: Currency;
  selected: boolean;
  current?: boolean;
  onSelect: () => void;
}) {
  const price = getPlanPrice(plan, currency);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="group w-full text-left"
    >
      <Card
        className={`relative flex min-h-[142px] h-full flex-col rounded-3xl bg-surface p-5 shadow-sm transition-all duration-200 ${selected
          ? "border-2 border-primary ring-4 ring-primary/10"
          : "border border-border/70 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-bold uppercase leading-6 text-primary">
            {formatDuration(plan)}
          </p>
          <span className="rounded-lg bg-muted px-3 py-1 text-sm font-bold text-muted-foreground">
            Basic
          </span>
          {current && (
            <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
              Current Plan
            </span>
          )}
        </div>
        <div className="mt-5 flex items-baseline">
          <span className="text-[25px] font-bold leading-none tracking-tight text-foreground">
            {currency === "USD" ? "$" : "£"}{price.toFixed(2)}
          </span>
          <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
        </div>
        <div className="mt-2 min-h-5">
          {plan.trialDays > 0 && (
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
  const dispatch = useAppDispatch();
  const { user_data, account } = usePosterReducers();
  const { isConnected, lastEvent, sendMessage } = useWebSocket();
  const accountState = account ?? initialAccountState;
  const [currency, setCurrency] = useState<Currency>("USD");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const userId = user_data?.user?.id ?? "";
  const relationship = user_data?.user?.relationships?.[0];
  const subscriptionCandidate = accountState.activeSubscription ?? relationship?.subscription;
  const activeSubscription = subscriptionCandidate?.planId &&
    subscriptionCandidate?.status &&
    subscriptionCandidate.status.toUpperCase() !== "EXPIRED" &&
    subscriptionCandidate.isActive !== false
    ? subscriptionCandidate
    : null;
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const paymentPending = useRef(false);

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


  }, [dispatch, isConnected, sendMessage, userId]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (!paymentPending.current) return;

    const message = lastEvent?.data;
    if (
      message?.request?.type !== "paymentService" ||
      message?.request?.action !== "recordPayment"
    ) {
      return;
    }

    paymentPending.current = false;
    setProcessingPayment(false);
    if (message.status === true) {
      setCheckoutOpen(false);
      toast.success(message.msg ?? "Subscription activated successfully.");
      sendMessage("action", { type: "userService", action: "get", payload: {} });
    } else {
      toast.error(message.msg ?? "Unable to complete the subscription.");
    }
  }, [lastEvent, sendMessage]);

  useEffect(() => {
    const selectablePlans = activeSubscription
      ? accountState.plans.filter((plan: any) => plan.id !== activeSubscription.planId)
      : accountState.plans;

    if (!selectablePlans.length) {
      if (selectedPlanId) setSelectedPlanId("");
      return;
    }

    if (!selectedPlanId || !selectablePlans.some((plan: any) => plan.id === selectedPlanId)) {
      const preferredPlan =
        selectablePlans.find((plan: any) => plan.isPopular || plan.isBestValue) ??
        selectablePlans[0];
      setSelectedPlanId(preferredPlan.id);
    }
  }, [accountState.plans, activeSubscription, selectedPlanId]);

  const selectedPlan = useMemo(
    () => accountState.plans.find((plan: any) => plan.id === selectedPlanId),
    [accountState.plans, selectedPlanId],
  );

  const subscribe = () => {
    if (!selectedPlan) return;
    setCheckoutOpen(true);
  };

  const confirmSubscription = () => {
    if (!selectedPlan || processingPayment) return;

    setProcessingPayment(true);
    paymentPending.current = true;
    const transactionId = globalThis.crypto?.randomUUID?.() ?? `WEB-${Date.now()}`;
    sendMessage("action", {
      type: "paymentService",
      action: "recordPayment",
      payload: {
        planId: selectedPlan.id,
        ownerUserId: userId,
        otherUserId: relationship?.partner?.id ?? "",
        platform: "MANUAL",
        productId: selectedPlan.code,
        transactionId,
        originalTransactionId: transactionId,
        currency,
        amount: getPlanPrice(selectedPlan, currency),
      },
    });
  };

  const currentPlan = accountState.plans.find((plan: any) => plan.id === activeSubscription?.planId);
  const otherPlans = accountState.plans.filter((plan: any) => plan.id !== activeSubscription?.planId);

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <AccountPageHeader
            title="Explore Plans"
            description="Choose the plan that fits your shared relationship journey."
            showBack
          />

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
                {activeSubscription ? "Current Plan" : "Choose your duration"}
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

            {accountState.loading && accountState.plans.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-64 animate-pulse rounded-3xl bg-muted"
                  />
                ))}
              </div>
            ) : accountState.plans.length === 0 ? (
              <Card className="rounded-3xl p-10 text-center shadow-sm">
                <Crown className="mx-auto h-10 w-10 text-primary/50" />
                <h2 className="mt-4 font-extrabold">Plans are not available</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please try again when the subscription service is available.
                </p>
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
                  {(activeSubscription ? otherPlans : accountState.plans).map((plan: any) => {
                    const selected = plan?.id === selectedPlanId;

                    return (
                      <PlanCard
                        key={plan?.id}
                        plan={plan}
                        currency={currency}
                        selected={selected}
                        onSelect={() => setSelectedPlanId(plan?.id)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {accountState.plans.length > 0 && (
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
                {activeSubscription ? "Extend Current" : "Subscribe"}
              </Button>
            </section>
          )}
        </div>

        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] max-w-2xl overflow-y-auto rounded-3xl bg-surface p-5 shadow-2xl sm:p-7">
            {selectedPlan && (
              <>
                <DialogHeader className="items-start text-left">
                  <DialogTitle className="text-xl font-bold">You selected</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Review your plan details before continuing.
                  </DialogDescription>
                </DialogHeader>
                <Card className="mt-4 rounded-2xl border-2 border-primary bg-primary/[0.03] p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-extrabold uppercase text-primary">{formatDuration(selectedPlan)}</p>
                    <span className="rounded-lg bg-muted px-3 py-1 text-sm font-bold">Basic</span>
                  </div>
                  <p className="mt-4 text-3xl font-extrabold">
                    {currency === "USD" ? "$" : "£"}{getPlanPrice(selectedPlan, currency).toFixed(2)} total
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedPlan.duration * 30} days · /mo {currency === "USD" ? "$" : "£"}{(getPlanPrice(selectedPlan, currency) / Math.max(selectedPlan.duration, 1)).toFixed(2)}
                  </p>
                </Card>
                <p className="mt-5 text-base text-muted-foreground">
                  Renews automatically unless cancelled before {activeSubscription?.endDate ? new Date(activeSubscription.endDate).toLocaleDateString() : "the next billing date"}.
                </p>
                <div className="mt-5 rounded-2xl border border-border bg-background p-5 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Plan</span><strong>{formatDuration(selectedPlan)}</strong></div>
                  <div className="mt-3 flex justify-between gap-4"><span className="font-bold text-muted-foreground">Due today</span><strong>{currency === "USD" ? "$" : "£"}{getPlanPrice(selectedPlan, currency).toFixed(2)}</strong></div>
                  <p className="mt-4 text-muted-foreground">Payment method on file will be charged through the configured payment provider. Cancel anytime.</p>
                </div>
                <div className="flex gap-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCheckoutOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="submit flex-1" onClick={confirmSubscription} disabled={processingPayment}>
                    <LockKeyhole className="mr-2 h-4 w-4" />
                    {processingPayment ? "Processing..." : "Subscribe"}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </DashboardLayout>
  );
}
