"use client";

import { Check, ClipboardCheck, Heart } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WelcomeDialogProps {
  open: boolean;
  name: string;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeDialog({
  open,
  name,
  onOpenChange,
}: WelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[360px] rounded-2xl border-border/70 bg-surface p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-200 motion-reduce:animate-none sm:p-7 [&>button:last-child]:hidden"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="items-center text-center">
          <div className="relative mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 animate-in zoom-in-50 duration-500 motion-reduce:animate-none">
            <Heart className="h-16 w-16 fill-rose-300 text-primary" strokeWidth={1.5} />
            <span className="absolute bottom-2 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-emerald-400 text-white shadow-md animate-in zoom-in-50 delay-150 duration-500 motion-reduce:animate-none">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
          </div>
          <DialogTitle className="text-lg font-extrabold text-foreground sm:text-xl">
            Welcome Back, {name}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Hope you are doing great today!
          </DialogDescription>
        </DialogHeader>

        <Button
          type="button"
          className="mx-auto mt-4 h-10 rounded-full px-7 font-semibold shadow-md shadow-primary/20 animate-in fade-in-0 slide-in-from-bottom-2 delay-150 duration-300 motion-reduce:animate-none"
          onClick={() => onOpenChange(false)}
        >
          Let&apos;s go
        </Button>
      </DialogContent>
    </Dialog>
  );
}

interface CheckinReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function CheckinReminderDialog({
  open,
  onOpenChange,
  onComplete,
}: CheckinReminderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] rounded-2xl border-border/70 bg-surface p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-200 motion-reduce:animate-none sm:p-7">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-amber-500 bg-amber-50 text-amber-600 shadow-inner animate-in zoom-in-75 duration-500 motion-reduce:animate-none dark:bg-amber-950/30">
            <ClipboardCheck className="h-14 w-14" strokeWidth={1.7} />
          </div>
          <DialogTitle className="text-lg font-extrabold text-foreground sm:text-xl">
            Complete your Check-in
          </DialogTitle>
          <DialogDescription className="mt-1 max-w-[310px] text-center text-sm leading-5 text-muted-foreground">
            Your check-in is still pending. Complete it now so your Union Score and insights stay up to date.
          </DialogDescription>
        </DialogHeader>

        <Button
          type="button"
          className="mt-4 h-11 w-full rounded-full font-semibold shadow-md shadow-primary/20 animate-in fade-in-0 slide-in-from-bottom-2 delay-150 duration-300 motion-reduce:animate-none"
          onClick={onComplete}
        >
          Complete Weekly Check-in
        </Button>
      </DialogContent>
    </Dialog>
  );
}
