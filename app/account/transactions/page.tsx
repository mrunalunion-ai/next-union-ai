"use client";

import { CalendarDays, Check, Copy, ReceiptText, UsersRound } from "lucide-react";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import { AccountPageHeader } from "@/components/account/account-ui";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import { setAccountLoading } from "@/redux/modules/account";
import { useWebSocket } from "@/services/socket/WebSocketContext";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function formatAmount(amount: number, currency?: string) {
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
}

function shortenTransactionId(value: string) {
  if (!value) return "—";
  return value.length > 22 ? `${value.slice(0, 18)}…${value.slice(-4)}` : value;
}

export default function TransactionsPage() {
  const dispatch = useAppDispatch();
  const { user_data, account } = usePosterReducers();
  const { isConnected, sendMessage } = useWebSocket();
  const userId = user_data?.user?.id ?? "";
  const loadTransactions = useCallback(() => {
    if (!isConnected || !userId) return;
    dispatch(setAccountLoading(true));
    sendMessage("action", { type: "paymentService", action: "getTransactions", payload: { ownerUserId: userId, page: 1, limit: 20 } });
  }, [dispatch, isConnected, sendMessage, userId]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const copyTransactionId = async (transactionId: string) => {
    if (!transactionId) return;
    await navigator.clipboard.writeText(transactionId);
    toast.success("Transaction ID copied");
  };

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <AccountPageHeader
            title="Transaction History"
            description="Review subscription payments made for your relationship space."
            showBack
          />

          {account.loading && account.transactions.length === 0 ? (
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="h-36 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : account.transactions.length === 0 ? (
            <Card className="rounded-3xl p-10 text-center">
              <ReceiptText className="mx-auto h-10 w-10 text-primary/50" />
              <h2 className="mt-4 font-extrabold">No transactions yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your subscription payments will appear here.
              </p>
            </Card>
          ) : (
            <div className="">
              {account.transactions.map((transaction: any) => {
                const isPaid = transaction.status?.toLowerCase() === "success";
                const transactionId = transaction.transactionId || "";

                return (
                  <Card
                    key={transaction.id}
                    className="rounded-2xl border-border/70 bg-surface p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <UsersRound className="h-3.5 w-3.5" />
                        Partner
                      </span>
                      <span
                        className={`inline-flex uppercase items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isPaid && <Check className="h-3.5 w-3.5" />}
                        {transaction.status || "Pending"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {transaction.planName || "Subscription"}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-foreground">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </p>
                    </div>

                    <div className="mt-3 flex min-w-0 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2">
                      <span className="shrink-0 text-[11px] text-muted-foreground">Transaction ID</span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                        {shortenTransactionId(transactionId)}
                      </span>
                      <button
                        type="button"
                        aria-label="Copy transaction ID"
                        disabled={!transactionId}
                        onClick={() => copyTransactionId(transactionId)}
                        className="shrink-0 text-primary transition-colors hover:text-primary/70 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
