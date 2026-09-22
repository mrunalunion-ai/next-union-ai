"use client";

import { Bell, CheckCheck, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect } from "react";

import {
  NotificationCard,
  NotificationsSkeleton,
} from "@/app/notifications/components/notification-card";
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

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
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
    sendMessage("action", {
      type: "notificationService",
      action: "unreadCount",
      payload: {},
    });
  }, [dispatch, isConnected, sendMessage]);

  useEffect(() => {
    if (open) loadNotifications();
  }, [loadNotifications, open]);

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

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close notifications"
        className="fixed inset-0 z-40 cursor-default bg-slate-950/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside
        aria-label="Notifications"
        aria-modal="true"
        role="dialog"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border/70 bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">Notifications</h2>
              <p className="text-xs text-muted-foreground">
                {notifications.unreadCount} unread
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close notifications"
            title="Close notifications"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 px-2 text-xs text-primary"
            disabled={!isConnected || notifications.unreadCount === 0}
            onClick={markAllRead}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Refresh notifications"
            title="Refresh notifications"
            disabled={!isConnected || notifications.loading}
            onClick={loadNotifications}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {notifications.loading && notifications.items.length === 0 ? (
            <NotificationsSkeleton />
          ) : notifications.error ? (
            <Card className="rounded-2xl border-destructive/30 p-6 text-center">
              <p className="text-sm font-semibold text-destructive">
                {notifications.error}
              </p>
              <Button className="mt-4" onClick={loadNotifications}>
                Try again
              </Button>
            </Card>
          ) : notifications.items.length === 0 ? (
            <Card className="rounded-2xl border-border/70 p-8 text-center">
              <Bell className="mx-auto h-9 w-9 text-primary/50" />
              <h3 className="mt-3 text-sm font-extrabold">
                No notifications yet
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                New relationship updates will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.items.map((notification: any) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markRead}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
