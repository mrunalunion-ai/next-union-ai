"use client";

import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  Lightbulb,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INotification } from "@/redux/modules/notifications";

const notificationIcons = {
  checkin: ClipboardCheck,
  sync: HeartHandshake,
  task: CheckCircle2,
  insight: Lightbulb,
  system: Bell,
};

function formatTimestamp(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const elapsed = Date.now() - date.getTime();
  const minutes = Math.floor(elapsed / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 7) return `${days} d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: INotification;
  onMarkRead: (id: string) => void;
}) {
  const Icon = notificationIcons[notification.type] ?? Bell;

  return (
    <Card
      className={`rounded-2xl border-border/70 bg-surface p-4 shadow-sm transition-colors ${
        notification.isRead ? "" : "border-primary/30 bg-primary/[0.03]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-extrabold">{notification.title}</h2>
            {!notification.isRead && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
            )}
          </div>
          {notification.description && (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {notification.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              {formatTimestamp(notification.createdAt)}
            </span>
            {!notification.isRead && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-primary"
                onClick={() => onMarkRead(notification.id)}
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading notifications">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
