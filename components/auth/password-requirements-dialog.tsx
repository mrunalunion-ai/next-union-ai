"use client";

import { Check, Info } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { passwordRequirements } from "@/utils/schema";

interface PasswordRequirementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordRequirementsDialog({
  open,
  onOpenChange,
}: PasswordRequirementsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[380px] rounded-2xl border-border/70 bg-surface p-5 shadow-xl sm:p-6">
        <DialogHeader className="items-start pr-6 text-left">
          <DialogTitle className="text-base font-semibold text-foreground">
            Password must contain
          </DialogTitle>
          <DialogDescription className="sr-only">
            Password requirements for creating your account.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-3 space-y-3 text-sm leading-5 text-muted-foreground">
          {passwordRequirements.map((requirement) => (
            <li key={requirement} className="flex items-start gap-2.5">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              <span>{requirement}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="text-primary hover:bg-primary/10 hover:text-primary"
            >
              Got it
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
