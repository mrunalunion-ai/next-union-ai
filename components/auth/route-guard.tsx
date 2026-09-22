"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PUBLIC_ROUTES } from "@/constant/routeConfig";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { APP_URL } from "@/constant/static";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user_data } = usePosterReducers();
  const isAuthenticated = user_data?.is_Login;

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);
    if (!isPublic && !isAuthenticated) {
      router.replace(APP_URL.LINKS.LOGIN);
    }
  }, [pathname, isAuthenticated, router]);

  return <>{children}</>;
}
