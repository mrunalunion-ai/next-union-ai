"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";

interface HomeCtaProps {
  className?: string;
  variant?: "default" | "outline" | "secondary";
  signedOutLabel?: string;
}

export function HomeCta({ className, variant, signedOutLabel = "Create your Union" }: HomeCtaProps) {
  const { user_data } = usePosterReducers();
  const isAuthenticated = Boolean(user_data?.access_token);

  return (
    <Button asChild variant={variant} className={className}>
      <Link href={isAuthenticated ? APP_URL.LINKS.DASHBOARD : APP_URL.LINKS.REGISTER}>
        {isAuthenticated ? "Go to Dashboard" : signedOutLabel}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
