"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { PUBLIC_ROUTES } from "@/constant/routeConfig";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { APP_URL } from "@/constant/static";
import { onboardingRoutes } from "@/utils/common";

// Connection onboarding flow in forward order. Browser back-navigation may
// never move a user to an earlier step than the one they are currently on.
const CONNECTION_FLOW = [
  APP_URL.LINKS.REGISTER,
  APP_URL.LINKS.EMAIL_VERIFICATION,
  APP_URL.LINKS.RELATIONSHIP_DETAILS,
  APP_URL.LINKS.CREATE_UNION,
  APP_URL.LINKS.CODE_CREATED,
  APP_URL.LINKS.JOIN_UNION,
  APP_URL.LINKS.CONNECTED,
  APP_URL.LINKS.DASHBOARD,
];

// Public pages that an authenticated user must never see.
const AUTH_BLOCKED_PUBLIC = [
  APP_URL.LINKS.LOGIN,
  APP_URL.LINKS.REGISTER,
  APP_URL.LINKS.EMAIL_VERIFICATION,
  APP_URL.LINKS.FORGOT_PASSWORD,
  APP_URL.LINKS.OTP_VERIFICATION,
  APP_URL.LINKS.RESET_PASSWORD,
];

// Routes that are only accessible once the user is fully connected.
const CONNECTED_ONLY_ROUTES = [
  APP_URL.LINKS.DASHBOARD,
  APP_URL.LINKS.TASKS,
  APP_URL.LINKS.INSIGHTS,
  APP_URL.LINKS.ACCOUNT,
];

// Forgot-password flow in forward order.
const FORGOT_FLOW = [
  APP_URL.LINKS.FORGOT_PASSWORD,
  APP_URL.LINKS.OTP_VERIFICATION,
  APP_URL.LINKS.RESET_PASSWORD,
];
const FORGOT_MAX_STEP_KEY = "unionai_forgot_max_step";

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user_data, access_token, hydrated } = usePosterReducers();
  const backDestinationRef = useRef<string | null>(null);

  const persistedToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("access_token")
      : null;

  // A session is only valid when BOTH a token and hydrated user context exist.
  // An orphan token (token present but no user data) indicates a stale/corrupt
  // session from switching accounts; treat it as logged out.
  const hasToken = Boolean(persistedToken || access_token);
  const hasUserContext = Boolean(user_data?.user?.id);
  const invalidSession = hydrated && hasToken && !hasUserContext;

  const isAuthenticated = Boolean(
    hasToken && (hasUserContext || !hydrated),
  );

  const onboardingStep = user_data?.user?.onboardingStep as
    | keyof typeof onboardingRoutes
    | undefined;

  // The page the user is currently allowed to be on, according to their step.
  const currentStepRoute = useMemo(() => {
    const route =
      (onboardingStep && onboardingRoutes[onboardingStep]) ||
      APP_URL.LINKS.RELATIONSHIP_DETAILS;
    return route;
  }, [onboardingStep]);

  const currentConnectionIndex = CONNECTION_FLOW.indexOf(currentStepRoute);

  // Remember where browser back/forward is headed, and record forgot-password
  // progress so those steps can never be re-entered via the back button.
  useEffect(() => {
    const onPopState = () => {
      backDestinationRef.current = window.location.pathname;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Track the furthest forgot-password step reached in this session.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const idx = FORGOT_FLOW.indexOf(pathname);
    if (idx === -1) return;
    const stored = Number(window.sessionStorage.getItem(FORGOT_MAX_STEP_KEY) ?? -1);
    if (idx > stored) {
      window.sessionStorage.setItem(FORGOT_MAX_STEP_KEY, String(idx));
    }
  }, [pathname]);

  const isPublic = useMemo(
    () =>
      PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      ),
    [pathname],
  );

  const isAuthBlockedPublic = AUTH_BLOCKED_PUBLIC.some((route) =>
    matchesRoute(pathname, route),
  );

  const isConnectionRoute =
    CONNECTION_FLOW.indexOf(pathname) !== -1 ||
    CONNECTION_FLOW.some(
      (route) => route !== pathname && pathname.startsWith(`${route}/`),
    );

  const isConnectionFlowBackRoute =
    isConnectionRoute &&
    currentConnectionIndex !== -1 &&
    CONNECTION_FLOW.indexOf(pathname) < currentConnectionIndex;

  // Connected-only routes are reachable only when the user is fully connected.
  const isConnected = onboardingStep === "connected";
  const isConnectedSuccessRoute =
    pathname === APP_URL.LINKS.CONNECTED && isConnected;
  const isConnectedOnlyRoute = CONNECTED_ONLY_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  let redirectTo: string | null = null;

  if (hydrated && invalidSession) {
    // Orphan token with no user context: clear the stale token and force a
    // clean login so a refresh does not recreate the broken session.
    redirectTo = APP_URL.LINKS.LOGIN;
  } else if (hydrated) {
    if (isAuthenticated) {
      // Connected-only routes are accessible only when fully connected.
      if (isConnectedOnlyRoute && !isConnected) {
        redirectTo = currentStepRoute;
      }
      // Authenticated users never see public auth pages.
      else if (isAuthBlockedPublic) {
        redirectTo = currentStepRoute;
      }
      // Never go backward through the connection flow.
      else if (isConnectionFlowBackRoute && !isConnectedSuccessRoute) {
        redirectTo = currentStepRoute;
      }
      // Blocked unauthorized back-navigation into forgot-password steps.
      else if (backDestinationRef.current) {
        const dest = backDestinationRef.current;
        const destIdx = FORGOT_FLOW.indexOf(dest);
        const maxIdx = Number(
          window.sessionStorage.getItem(FORGOT_MAX_STEP_KEY) ?? -1,
        );
        if (destIdx !== -1 && maxIdx !== -1 && destIdx < maxIdx) {
          redirectTo = FORGOT_FLOW[maxIdx];
        }
      }
    } else {
      // Unauthenticated users cannot open protected routes.
      if (!isPublic) {
        redirectTo = APP_URL.LINKS.LOGIN;
      }
      // Forgot-password flow: no back-navigation to earlier steps.
      else if (backDestinationRef.current) {
        const dest = backDestinationRef.current;
        const destIdx = FORGOT_FLOW.indexOf(dest);
        const maxIdx = Number(
          window.sessionStorage.getItem(FORGOT_MAX_STEP_KEY) ?? -1,
        );
        if (destIdx !== -1 && maxIdx !== -1 && destIdx < maxIdx) {
          redirectTo = FORGOT_FLOW[maxIdx];
        }
      }
    }
  }
  if (redirectTo === pathname) redirectTo = null;

  useEffect(() => {
    if (!redirectTo) return;
    if (invalidSession) {
      window.localStorage.removeItem("access_token");
    }
    router.replace(redirectTo);
  }, [redirectTo, router, invalidSession]);

  // Clear the recorded back-destination once navigation settles.
  useEffect(() => {
    backDestinationRef.current = null;
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
