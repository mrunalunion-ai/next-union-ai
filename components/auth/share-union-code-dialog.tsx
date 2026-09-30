"use client";

import {
  Link2,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareUnionCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copyLink: () => void;
  openWhatsApp: () => void;
  openEmail: () => void;
  nativeShare: () => void;
}

export function ShareUnionCodeDialog({
  open,
  onOpenChange,
  copyLink,
  openWhatsApp,
  openEmail,
  nativeShare,
}: ShareUnionCodeDialogProps) {
  const shareMethods = [
    {
      icon: Link2,
      iconColor: "text-blue-500",
      label: "Copy Link",
      onClick: copyLink,
    },
    {
      icon: MessageCircle,
      iconColor: "text-green-500",
      label: "WhatsApp",
      onClick: openWhatsApp,
    },
    {
      icon: Mail,
      iconColor: "text-orange-500",
      label: "Email",
      onClick: openEmail,
    },
    {
      icon: Share2,
      iconColor: "text-purple-500",
      label: "Native Share",
      onClick: nativeShare,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] rounded-2xl border-border/70 bg-surface p-5 shadow-xl sm:p-6">
        <DialogHeader className="items-start text-left">
          <DialogTitle className="text-base font-semibold text-foreground">
            Share Invite
          </DialogTitle>

          <DialogDescription className="mt-1 text-sm leading-5 text-muted-foreground">
            Share your Union Code with your partner through any method you like.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {shareMethods.map((method) => {
            const Icon = method.icon;

            return (
              <button
                key={method.label}
                type="button"
                onClick={() => {
                  method.onClick();
                  onOpenChange(false);
                }}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-4 text-center transition-colors hover:bg-secondary"
              >
                <Icon
                  className={`h-6 w-6 ${method.iconColor} transition-transform group-hover:scale-105`}
                  strokeWidth={2}
                />

                <span className="text-sm font-medium text-foreground">
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}