"use client";

import { ReceiptText, RefreshCw } from "lucide-react";
import { useCallback, useEffect } from "react";

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

  return <DashboardLayout><main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10"><div className="mx-auto"><div className="flex items-start justify-between gap-4"><AccountPageHeader title="Transaction History" description="Review subscription payments made for your relationship space." showBack /></div>{account.loading && account.transactions.length === 0 ? <div className="h-64 animate-pulse rounded-3xl bg-muted" /> : account.transactions.length === 0 ? <Card className="rounded-3xl p-10 text-center"><ReceiptText className="mx-auto h-10 w-10 text-primary/50" /><h2 className="mt-4 font-extrabold">No transactions yet</h2><p className="mt-2 text-sm text-muted-foreground">Your subscription payments will appear here.</p></Card> : <Card className="overflow-hidden rounded-3xl border-border/70 bg-surface shadow-sm"><div className="divide-y divide-border/60">{account.transactions.map((transaction) => <div key={transaction.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div className="min-w-0"><h2 className="truncate text-sm font-extrabold">{transaction.planName || "Subscription"}</h2><p className="mt-1 text-xs text-muted-foreground">{transaction.transactionId || "—"} · {formatDate(transaction.date)}</p></div><div className="text-right"><p className="font-extrabold">{transaction.currency} {transaction.amount.toFixed(2)}</p><span className="text-xs font-bold capitalize text-muted-foreground">{transaction.status.toLowerCase()}</span></div></div>)}</div></Card>}</div></main></DashboardLayout>;
}
