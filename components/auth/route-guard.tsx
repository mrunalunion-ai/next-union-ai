"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { PUBLIC_ROUTES } from "@/constant/routeConfig";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { APP_URL } from "@/constant/static";
import { onboardingRoutes } from "@/utils/common";

const ONBOARDING_FLOW_ROUTES = new Set(Object.values(onboardingRoutes));
const SHARED_ROUTES = [APP_URL.LINKS.LEGAL];
const CONNECTED_ONLY_ROUTES = [
  APP_URL.LINKS.DASHBOARD,
  APP_URL.LINKS.WEEKLY_CHECK_IN,
  APP_URL.LINKS.CHECK_IN_COMPLETED,
  APP_URL.LINKS.TASKS,
  APP_URL.LINKS.INSIGHTS,
  APP_URL.LINKS.NOTIFICATIONS,
  APP_URL.LINKS.ACCOUNT,
];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user_data, access_token, hydrated } = usePosterReducers();
  const isBackNavRef = useRef(false);
  const onboardingStep = user_data?.user?.onboardingStep;

  const persistedToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("access_token")
      : null;

  useEffect(() => {
    const onPopState = () => {
      isBackNavRef.current = true;
      console.debug("[RouteGuard] Browser back/forward detected", {
        destination: window.location.pathname,
        guardedPath: pathname,
        onboardingStep: user_data?.user?.onboardingStep ?? null,
        hasAccessToken: Boolean(
          window.localStorage.getItem("access_token") || access_token,
        ),
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [access_token, pathname, user_data?.user?.onboardingStep]);

  const isAuthenticated = Boolean(
    !hydrated ? persistedToken : access_token || user_data?.is_Login,
  );

  const onboardingRoute = useMemo(() => {
    const step = user_data?.user?.onboardingStep as
      | keyof typeof onboardingRoutes
      | undefined;
    const route = (step && onboardingRoutes[step]) || APP_URL.LINKS.RELATIONSHIP_DETAILS;
    // A malformed or stale onboarding value must never strand an authenticated
    // user on a public page such as login or registration.
    return PUBLIC_ROUTES.some(
      (publicRoute) => route === publicRoute || route.startsWith(`${publicRoute}/`),
    )
      ? APP_URL.LINKS.RELATIONSHIP_DETAILS
      : route;
  }, [onboardingStep]);

  const isPublic = useMemo(
    () =>
      PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      ),
    [pathname],
  );
  const isShared = SHARED_ROUTES.some(
    (route) => matchesRoute(pathname, route),
  );
  const isConnectedOnlyRoute = CONNECTED_ONLY_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  let redirectTo: string | null = null;
  if (hydrated) {
    if (isPublic && isAuthenticated) {
      redirectTo = onboardingRoute;
    } else if (!isPublic && !isShared && !isAuthenticated) {
      redirectTo = APP_URL.LINKS.LOGIN;
    } else if (
      isAuthenticated &&
      !isShared &&
      isConnectedOnlyRoute &&
      onboardingStep !== "connected"
    ) {
      redirectTo = onboardingRoute;
    } else if (
      isAuthenticated &&
      isBackNavRef.current &&
      onboardingStep === "connected" &&
      ONBOARDING_FLOW_ROUTES.has(pathname) &&
      pathname !== APP_URL.LINKS.DASHBOARD
    ) {
      redirectTo = APP_URL.LINKS.DASHBOARD;
    }
  }
  if (redirectTo === pathname) redirectTo = null;

  useEffect(() => {
    if (!redirectTo) return;
    console.debug("[RouteGuard] Redirecting route", {
      from: pathname,
      to: redirectTo,
      onboardingStep: onboardingStep ?? null,
      isAuthenticated,
      isBackNavigation: isBackNavRef.current,
      reason: isPublic && isAuthenticated
        ? "authenticated-user-on-public-route"
        : !isPublic && !isShared && !isAuthenticated
          ? "unauthenticated-user-on-protected-route"
          : isConnectedOnlyRoute && onboardingStep !== "connected"
            ? "onboarding-not-connected"
          : onboardingStep === "connected"
            ? "connected-user-back-navigation"
            : "other-route-guard-rule",
    });
    router.replace(redirectTo);
  }, [redirectTo, router, pathname, onboardingStep, isAuthenticated, isPublic, isShared]);

  useEffect(() => {
    isBackNavRef.current = false;
  }, [pathname]);

  if (!hydrated || redirectTo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
