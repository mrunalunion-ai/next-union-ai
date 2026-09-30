"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PUBLIC_ROUTES } from "@/constant/routeConfig";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { APP_URL } from "@/constant/static";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user_data } = usePosterReducers();
  const [isChecking, setIsChecking] = useState(true);
  const isAuthenticated = user_data?.is_Login;

  useEffect(() => {
    setIsChecking(false);
  }, [user_data]);

  useEffect(() => {
    if (isChecking) return;
    const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);
    if (!isPublic && !isAuthenticated) {
      router.replace(APP_URL.LINKS.LOGIN);
    }
  }, [pathname, isAuthenticated, router, isChecking]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
