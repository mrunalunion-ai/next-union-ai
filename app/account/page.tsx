"use client";

import {
  Bell,
  CreditCard,
  FileText,
  HeartHandshake,
  LockKeyhole,
  LogOut,
  Moon,
  ReceiptText,
  Sun,
  Trash2,
  UserRound
} from "lucide-react";
import { useRouter } from "next/navigation";

import { AccountPageHeader, AccountRow, AccountSection, SettingRow, Toggle } from "@/components/account/account-ui";
import { Popup } from "@/components/common/popup";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card } from "@/components/ui/card";
import { API_BASE_URL, APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import { setAccountSaving } from "@/redux/modules/account";
import { logoutUser } from "@/redux/modules/common/user_data/action";
import { setReduxClear } from "@/redux/modules/main/action";
import { postData } from "@/services/rest/fetchData";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

export default function AccountPage() {
  const router = useRouter();
  const { user_data } = usePosterReducers();
  const user = user_data?.user;
  const relationship = user?.relationships?.[0];
  const partner = relationship?.partner;
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { isConnected, lastEvent, sendMessage } = useWebSocket();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const hasObservedSocketEvent = useRef(false);

  useEffect(() => {
    setMounted(true);
    setNotificationsEnabled(
      localStorage.getItem("unionai_notifications_enabled") !== "false",
    );
  }, []);


  useEffect(() => {
    if (!hasObservedSocketEvent.current) {
      hasObservedSocketEvent.current = true;
      return;
    }

    if (
      lastEvent?.data?.request?.type === "userService" &&
      lastEvent?.data?.request?.action === "deleteAccount" &&
      lastEvent?.data?.status === true
    ) {
      sessionStorage.clear();
      localStorage.clear();
      dispatch(logoutUser());
      dispatch(setReduxClear());
      router.replace(APP_URL.LINKS.LOGIN);
    }
  }, [dispatch, lastEvent, router]);

  const handleLogout = async () => {
    try {
      await postData(APP_URL.ENDPOINT_URL.LOGOUT, {}, user_data?.access_token);
    } finally {
      sessionStorage.clear();
      localStorage.clear();
      dispatch(logoutUser());
      dispatch(setReduxClear());
      router.replace(APP_URL.LINKS.LOGIN);
    }
  };

  const deleteAccount = () => {
    if (!isConnected) return;
    dispatch(setAccountSaving(true));
    sendMessage("action", {
      type: "userService",
      action: "deleteAccount",
      payload: {},
    });
  };


  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <AccountPageHeader title="Account" description="Manage your profile, relationship, plans, and preferences." />

          <Card className="mb-6 rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center overflow-hidden rounded-full justify-center bg-primary/10 text-3xl font-semibold text-primary">
                {user?.profileImage ? (
                  <img
                    src={API_BASE_URL + user.profileImage}
                    alt={`${user?.firstName ?? ""}${user?.lastName ?? ""}`.toUpperCase() || "U"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "U"
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-extrabold">{`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Your account"}</h2>
                <p className="truncate text-sm text-muted-foreground">{user?.email || "Manage your account details"}</p>
                {partner && <p className="mt-1 text-sm font-semibold text-primary">Connected with {`${partner.firstName ?? ""} ${partner.lastName ?? ""}`.trim()}</p>}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <AccountSection title="Account">
              <AccountRow icon={UserRound} label="My Account" onClick={() => router.push(APP_URL.LINKS.MY_ACCOUNT)} />
              <AccountRow icon={HeartHandshake} label="Connected Partner" onClick={() => router.push(APP_URL.LINKS.CONNECTED_PARTNER)} />
              <AccountRow icon={CreditCard} label="Explore Plans" onClick={() => router.push(APP_URL.LINKS.EXPLORE_PLANS)} />
              <AccountRow icon={ReceiptText} label="Transaction History" onClick={() => router.push(APP_URL.LINKS.TRANSACTIONS)} />
            </AccountSection>

            <AccountSection title="Legal">
              <AccountRow icon={FileText} label="Terms & Conditions" onClick={() => router.push(`${APP_URL.LINKS.LEGAL}/terms`)} />
              <AccountRow icon={LockKeyhole} label="Privacy Policy" onClick={() => router.push(`${APP_URL.LINKS.LEGAL}/privacy`)} />
              <AccountRow icon={ReceiptText} label="Subscription Policy" onClick={() => router.push(`${APP_URL.LINKS.LEGAL}/subscription`)} />
            </AccountSection>

            <AccountSection title="App Settings">
              <div>
                {mounted && (
                  <SettingRow
                    icon={theme === "dark" ? Moon : Sun}
                    label="Dark mode"
                  >
                    <Toggle
                      checked={theme === "dark"}
                      onChange={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    />
                  </SettingRow>
                )}

                <SettingRow
                  icon={Bell}
                  label="Notifications"
                >
                  <Toggle
                    checked={notificationsEnabled}
                    onChange={() => {
                      const nextValue = !notificationsEnabled;

                      setNotificationsEnabled(nextValue);

                      localStorage.setItem(
                        "unionai_notifications_enabled",
                        String(nextValue),
                      );
                    }}
                  />
                </SettingRow>
              </div>
            </AccountSection>

            <AccountSection title="Account Management">
              <AccountRow className="text-red-600" icon={Trash2} label="Permanently Delete Account" onClick={() => setDeleteOpen(true)} />
              <AccountRow icon={LogOut} label="Log Out of Account" onClick={() => setIsLogoutOpen(true)} />
            </AccountSection>
          </div>
        </div>
      </main>
      <Popup
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant="danger"
        title="Delete account?"
        description={
          <div className="space-y-3 text-left">
            <p>Deleting your account will:</p>

            <ul className="list-disc space-y-1 pl-4">
              <li>Cancel your active subscription immediately</li>
              <li>
                No refund will be issued for the remaining billing period
              </li>
              <li>
                All your data (check-ins, insights, scores) will be permanently
                erased
              </li>
              <li>
                Your subscription cannot be restored or transferred to a new
                account
              </li>
            </ul>

            <p className="pt-1">This action cannot be undone.</p>
          </div>
        }
        confirmText="Delete account"
        onConfirm={deleteAccount}
      />
      <Popup
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        variant="logout"
        title="Logout?"
        description="Are you sure you want to log out of your account?"
        confirmText="Logout"
        onConfirm={handleLogout}
      />
    </DashboardLayout>
  );
}
