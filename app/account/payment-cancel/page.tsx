"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_URL } from "@/constant/static";
import { RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function PaymentCancelPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push(APP_URL.LINKS.EXPLORE_PLANS);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card
        className="
          w-full
          max-w-sm
          rounded-3xl
          border
          border-border/60
          bg-card
          px-7
          py-8
          text-center
          shadow-lg
          shadow-black/5
          animate-in
          fade-in
          zoom-in-95
          duration-500
        "
      >
        {/* Cancelled Icon */}
        <div
          className="
            relative
            mx-auto
            mb-6
            flex
            h-20
            w-20
            items-center
            justify-center
            animate-in
            zoom-in
            duration-700
          "
        >
          {/* Soft background */}
          <div
            className="
              absolute
              inset-0
              rounded-full
              bg-red-500/10
              animate-pulse
            "
          />

          {/* Icon */}
          <div
            className="
              relative
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-red-500
              text-white
              shadow-lg
              shadow-red-500/20
              animate-in
              zoom-in
              duration-500
            "
          >
            <X className="h-8 w-8 stroke-[2.5]" />
          </div>
        </div>

        {/* Content */}
        <div
          className="
            animate-in
            fade-in
            slide-in-from-bottom-2
            duration-700
          "
        >
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Payment Cancelled
          </h1>

          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Your subscription was not completed. You can try again whenever
            you're ready.
          </p>
        </div>

        {/* Status */}
        <div
          className="
            mt-6
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-red-50
            px-4
            py-3
            dark:bg-red-500/10
            animate-in
            fade-in
            duration-700
          "
        >
          <span className="h-2 w-2 rounded-full bg-red-500" />

          <span className="text-xs font-medium text-red-700 dark:text-red-400">
            Subscription was not activated
          </span>
        </div>

        {/* CTA */}
        <Button
          type="button"
          onClick={handleBack}
          className="
            mt-5
            w-full
            rounded-xl
            bg-primary
            py-6
            font-semibold
            text-primary-foreground
            shadow-md
            shadow-primary/20
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:bg-primary/90
            hover:shadow-lg
            active:translate-y-0
          "
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Back to Plans
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          You can subscribe whenever you're ready.
        </p>
      </Card>
    </main>
  );
}