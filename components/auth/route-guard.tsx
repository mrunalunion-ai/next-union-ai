"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { PUBLIC_ROUTES } from "@/constant/routeConfig";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { APP_URL } from "@/constant/static";
import { onboardingRoutes } from "@/utils/common";

const ONBOARDING_FLOW_ROUTES = new Set(Object.values(onboardingRoutes));
const SHARED_ROUTES = [APP_URL.LINKS.LEGAL];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user_data, access_token, hydrated } = usePosterReducers();
  const isBackNavRef = useRef(false);

  const persistedToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("access_token")
      : null;

  useEffect(() => {
    const onPopState = () => {
      isBackNavRef.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const isAuthenticated = Boolean(
    !hydrated ? persistedToken : access_token || user_data?.is_Login,
  );

  const onboardingRoute = useMemo(() => {
    const step = user_data?.user?.onboardingStep as
      | keyof typeof onboardingRoutes
      | undefined;
    const route = (step && onboardingRoutes[step]) || APP_URL.LINKS.DASHBOARD;
    // A malformed or stale onboarding value must never strand an authenticated
    // user on a public page such as login or registration.
    return PUBLIC_ROUTES.some(
      (publicRoute) => route === publicRoute || route.startsWith(`${publicRoute}/`),
    )
      ? APP_URL.LINKS.RELATIONSHIP_DETAILS
      : route;
  }, [user_data?.user?.onboardingStep]);

  const isPublic = useMemo(
    () =>
      PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      ),
    [pathname],
  );
  const isShared = SHARED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  let redirectTo: string | null = null;
  if (hydrated) {
    if (isPublic && isAuthenticated) {
      redirectTo = onboardingRoute;
    } else if (!isPublic && !isShared && !isAuthenticated) {
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
