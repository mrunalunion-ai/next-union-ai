"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { PUBLIC_ROUTES } from "@/constant/routeConfig";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { APP_URL } from "@/constant/static";
import { onboardingRoutes } from "@/utils/common";

const ONBOARDING_FLOW_ROUTES = new Set(Object.values(onboardingRoutes));

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user_data, access_token, hydrated } = usePosterReducers();
  const isBackNavRef = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      isBackNavRef.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const isAuthenticated =
    typeof window !== "undefined" &&
    Boolean(
      window.localStorage.getItem("access_token") || access_token || user_data?.is_Login,
    );

  const onboardingStep = user_data?.user?.onboardingStep as
    | keyof typeof onboardingRoutes
    | undefined;
  const onboardingRoute =
    (onboardingStep && onboardingRoutes[onboardingStep]) ||
    APP_URL.LINKS.DASHBOARD;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);

  let redirectTo: string | null = null;
  if (hydrated) {
    if (isPublic && isAuthenticated) {
      redirectTo = onboardingRoute;
    } else if (!isPublic && !isAuthenticated) {
      redirectTo = APP_URL.LINKS.LOGIN;
    } else if (
      isAuthenticated &&
      isBackNavRef.current &&
      ONBOARDING_FLOW_ROUTES.has(pathname) &&
      pathname !== onboardingRoute
    ) {
      redirectTo = onboardingRoute;
    }
  }
  if (redirectTo === pathname) redirectTo = null;

  useEffect(() => {
    if (!redirectTo) return;
    router.replace(redirectTo);
  }, [redirectTo, router]);

  useEffect(() => {
    isBackNavRef.current = false;
  });

  if (!hydrated || redirectTo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
