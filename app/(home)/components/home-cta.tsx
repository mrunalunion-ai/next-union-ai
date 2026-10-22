"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { onboardingRoutes, type OnboardingStep } from "@/utils/common";

interface HomeCtaProps {
  className?: string;
  variant?: "default" | "outline" | "secondary";
  signedOutLabel?: string;
}

export function HomeCta({ className, variant, signedOutLabel = "Create your Union" }: HomeCtaProps) {
  const { user_data } = usePosterReducers();
  const isAuthenticated = Boolean(user_data?.access_token);
  const onboardingStep = user_data?.user?.onboardingStep as OnboardingStep | undefined;
  const isConnected = onboardingStep === "connected";
  const href = isAuthenticated
    ? isConnected
      ? APP_URL.LINKS.DASHBOARD
      : onboardingRoutes[onboardingStep as OnboardingStep] || APP_URL.LINKS.DASHBOARD
    : APP_URL.LINKS.REGISTER;

  return (
    <Button asChild variant={variant} className={className}>
      <Link href={href}>
        {isAuthenticated ? (isConnected ? "Go to Dashboard" : "Complete Connection") : signedOutLabel}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
