"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LogOut,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PopupVariant = "logout" | "danger" | "warning" | "success" | "info";

type PopupStyle = {
  icon: LucideIcon;
  iconClassName: string;
  iconWrapperClassName: string;
  confirmVariant: ButtonProps["variant"];
  confirmClassName: string;
  cancelClassName: string;
};

/** The visual language for each popup type lives here, not in every caller. */
export const popupStyles: Record<PopupVariant, PopupStyle> = {
  logout: {
    icon: LogOut,
    iconClassName: "text-destructive",
    iconWrapperClassName: "bg-destructive/10",
    confirmVariant: "destructive",
    confirmClassName: "shadow-sm",
    cancelClassName: "border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive",
  },
  danger: {
    icon: Trash2,
    iconClassName: "text-destructive",
    iconWrapperClassName: "bg-destructive/10",
    confirmVariant: "destructive",
    confirmClassName: "shadow-sm",
    cancelClassName: "border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: "text-amber-600",
    iconWrapperClassName: "bg-amber-100",
    confirmVariant: "default",
    confirmClassName: "bg-amber-600 text-white hover:bg-amber-700",
    cancelClassName: "border-amber-600 text-amber-700 hover:bg-amber-50 hover:text-amber-700",
  },
  success: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-600",
    iconWrapperClassName: "bg-emerald-100",
    confirmVariant: "default",
    confirmClassName: "bg-emerald-600 text-white hover:bg-emerald-700",
    cancelClassName: "border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700",
  },
  info: {
    icon: Info,
    iconClassName: "text-primary",
    iconWrapperClassName: "bg-primary/10",
    confirmVariant: "default",
    confirmClassName: "",
    cancelClassName: "",
  },
};

export interface PopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmText: string;
  cancelText?: string;
  variant?: PopupVariant;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmButtonProps?: Omit<ButtonProps, "children" | "onClick">;
  cancelButtonProps?: Omit<ButtonProps, "children" | "onClick">;
}

/**
 * A controlled confirmation popup. Pass content and a variant key; the icon
 * and button treatment are selected from popupStyles above.
 */
export function Popup({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  variant = "info",
  onConfirm,
  onCancel,
  confirmButtonProps,
  cancelButtonProps,
}: PopupProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);
  const style = popupStyles[variant];
  const Icon = style.icon;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm?.();
      onOpenChange(false);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[400px] gap-0 !rounded-2xl border-0 bg-surface p-5 shadow-xl sm:p-6 [&>button:last-child]:hidden"
      >
        <DialogHeader className="items-center space-y-4 text-center">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              style.iconWrapperClassName
            )}
          >
            <Icon className={cn("h-8 w-8", style.iconClassName)} aria-hidden="true" />
          </div>
          <DialogTitle className="text-lg font-semibold text-foreground">{title}</DialogTitle>
          <DialogDescription className="max-w-[320px] text-center text-sm leading-5 text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            {...cancelButtonProps}
            className={cn("h-10 rounded-lg", style.cancelClassName, cancelButtonProps?.className)}
            onClick={handleCancel}
            disabled={isConfirming || cancelButtonProps?.disabled}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={style.confirmVariant}
            {...confirmButtonProps}
            className={cn("h-10 rounded-lg", style.confirmClassName, confirmButtonProps?.className)}
            onClick={handleConfirm}
            disabled={isConfirming || confirmButtonProps?.disabled}
          >
            {isConfirming ? "Please wait…" : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
