"use client";

import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useCallback, useEffect } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import {
  markAllNotificationsRead,
  markNotificationRead,
  setNotificationsLoading,
} from "@/redux/modules/notifications";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import {
  NotificationCard,
  NotificationsSkeleton,
} from "./components/notification-card";

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { notifications } = usePosterReducers();
  const { isConnected, sendMessage } = useWebSocket();

  const loadNotifications = useCallback(() => {
    if (!isConnected) return;

    dispatch(setNotificationsLoading(true));
    sendMessage("action", {
      type: "notificationService",
      action: "list",
      payload: { page: 1, limit: 10 },
    });
  }, [dispatch, isConnected, sendMessage]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = (id: string) => {
    if (!isConnected) return;

    dispatch(markNotificationRead(id));
    sendMessage("action", {
      type: "notificationService",
      action: "markRead",
      payload: { id },
    });
  };

  const markAllRead = () => {
    if (!isConnected || notifications.unreadCount === 0) return;

    dispatch(markAllNotificationsRead());
    sendMessage("action", {
      type: "notificationService",
      action: "markAllRead",
      payload: {},
    });
  };

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                Stay up to date
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Notifications
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Updates about your relationship, tasks, and check-ins.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={!isConnected || notifications.loading}
              onClick={loadNotifications}
              title="Refresh notifications"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </header>

          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-muted-foreground">
              {notifications.unreadCount} unread
            </span>
            <Button
              type="button"
              variant="ghost"
              className="gap-2 text-xs text-primary"
              disabled={!isConnected || notifications.unreadCount === 0}
              onClick={markAllRead}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          </div>

          {notifications.loading && notifications.items.length === 0 ? (
            <NotificationsSkeleton />
          ) : notifications.error ? (
            <Card className="rounded-3xl border-destructive/30 bg-surface p-10 text-center">
              <p className="text-sm font-semibold text-destructive">
                {notifications.error}
              </p>
              <Button className="mt-5" onClick={loadNotifications}>
                Try again
              </Button>
            </Card>
          ) : notifications.items.length === 0 ? (
            <Card className="rounded-3xl border-border/70 bg-surface p-10 text-center shadow-sm">
              <Bell className="mx-auto h-10 w-10 text-primary/50" />
              <h2 className="mt-4 text-lg font-extrabold">No notifications yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                New relationship updates will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3" role="list">
              {notifications?.items?.map((notification: any) => (
                <div key={notification.id} role="listitem">
                  <NotificationCard
                    notification={notification}
                    onMarkRead={markRead}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
