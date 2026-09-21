"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

import RouteGuard from "@/components/auth/route-guard";
import { Popup } from "@/components/common/popup";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import { logoutUser } from "@/redux/modules/common/user_data/action";
import { setReduxClear } from "@/redux/modules/main/action";
import { postData } from "@/services/rest/fetchData";

import { DashboardHeader } from "./dashboard-header";
import { DashboardMobileNav, DashboardSidebar } from "./dashboard-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user_data } = usePosterReducers();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await postData(
        APP_URL.ENDPOINT_URL.LOGOUT,
        {},
        user_data?.access_token,
      );

      toast.success(response?.data?.message || "Logged out successfully.");
    } catch {
      toast.error("Could not complete logout. Please try again.");
    } finally {
      sessionStorage.clear();
      localStorage.clear();
      dispatch(logoutUser());
      dispatch(setReduxClear());
      router.push(APP_URL.LINKS.HOME);
    }
  };

  return (
    <RouteGuard>
      <div className="flex h-screen overflow-hidden text-foreground">
        <div className="h-full shrink-0">
          <DashboardSidebar onLogout={() => setIsLogoutOpen(true)} />
        </div>

        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <DashboardHeader />
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hidden">
            {children}
          </div>
          <DashboardMobileNav />
        </div>
      </div>

      <Popup
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        variant="logout"
        title="Logout?"
        description="Are you sure you want to log out of your account?"
        confirmText="Logout"
        onConfirm={handleLogout}
      />
    </RouteGuard>
  );
}
