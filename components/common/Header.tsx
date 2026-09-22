"use client";

import { Popup } from "@/components/common/popup";
import { NotificationDrawer } from "@/components/layouts/notification-drawer";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import { logoutUser } from "@/redux/modules/common/user_data/action";
import { setReduxClear } from "@/redux/modules/main/action";
import { postData } from "@/services/rest/fetchData";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import { onboardingRoutes, type OnboardingStep } from "@/utils/common";
import {
  Bell,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

type HeaderVariant = "marketing" | "auth" | "dashboard";

interface HeaderProps {
  variant?: HeaderVariant;
}

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Methodology", href: "#methodology" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "U";
}

export function Header({ variant = "auth" }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user_data, notifications } = usePosterReducers();
  const { isConnected, lastEvent, sendMessage } = useWebSocket();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const isMarketing = variant === "marketing";
  const isDashboard = variant === "dashboard";
  const isDark = mounted && resolvedTheme === "dark";
  const isAuthenticated = Boolean(user_data?.access_token);
  const showNotifications = isDashboard || (isMarketing && isAuthenticated);
  const user = user_data?.user;
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "My Account";
  const initials = getInitials(user?.firstName, user?.lastName);
  const unreadCount = notifications?.unreadCount ?? 0;
  const notificationUserKey = user?.id || user_data?.access_token || "guest";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!showNotifications || !isConnected || !user_data?.access_token) return;
    const sessionKey = `unionai:notifications:loaded:${notificationUserKey}`;
    if (sessionStorage.getItem(sessionKey) === "true") return;

    sessionStorage.setItem(sessionKey, "true");
    sendMessage("action", {
      type: "notificationService",
      action: "list",
      payload: { page: 1, limit: 10 },
    });
    sendMessage("action", {
      type: "notificationService",
      action: "unreadCount",
      payload: {},
    });
  }, [isConnected, notificationUserKey, sendMessage, showNotifications, user_data?.access_token]);

  useEffect(() => {
    if (!showNotifications || !isConnected || !user_data?.access_token) return;

    const eventName = lastEvent?.event === "data"
      ? lastEvent.data?.type
      : lastEvent?.event;
    if (!String(eventName ?? "").toLowerCase().includes("notification")) return;

    const eventData = lastEvent?.data?.data ?? lastEvent?.data;
    const eventKey = eventData?.id ?? eventData?.notificationId ?? JSON.stringify(eventData ?? eventName);
    const refreshKey = `unionai:notifications:event:${notificationUserKey}:${eventName}:${eventKey}`;
    if (sessionStorage.getItem(refreshKey) === "true") return;

    sessionStorage.setItem(refreshKey, "true");
    sendMessage("action", {
      type: "notificationService",
      action: "list",
      payload: { page: 1, limit: 10 },
    });
    sendMessage("action", {
      type: "notificationService",
      action: "unreadCount",
      payload: {},
    });
  }, [isConnected, lastEvent, notificationUserKey, sendMessage, showNotifications, user_data?.access_token]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await postData(APP_URL.ENDPOINT_URL.LOGOUT, {}, user_data?.access_token);
      toast.success(response?.data?.message || "Logged out successfully.");
    } catch {
      toast.error("Could not complete logout. Please try again.");
    } finally {
      sessionStorage.clear();
      localStorage.clear();
      dispatch(logoutUser());
      dispatch(setReduxClear());
      setProfileOpen(false);
      setMobileOpen(false);
      setIsLogoutOpen(false);
      router.replace(APP_URL.LINKS.HOME);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className={`mx-auto flex min-h-16 w-full items-center gap-4 px-4 py-2 sm:px-6 lg:px-8 ${isDashboard ? "justify-between lg:justify-end" : "justify-between"}`}>
          <Link
            href={APP_URL.LINKS.HOME}
            aria-label="UnionAI home"
            className={`inline-flex shrink-0 items-center ${isDashboard ? "lg:hidden" : ""}`}
          >
            <Image
              width={160}
              height={40}
              src={isDark ? APP_URL.IMAGES.LIGHT_LOGO : APP_URL.IMAGES.LOGO}
              alt="UnionAI"
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          {isMarketing && (
            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="group relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  {link.label}
                  <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-primary via-[#7253e5] to-[#e85d9e] transition-transform group-hover:scale-x-100" />
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {showNotifications && (
              <button type="button" aria-label="Notifications" title="Notifications" onClick={() => setNotificationsOpen(true)} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-primary/5">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
              </button>
            )}

            <button type="button" aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setTheme(isDark ? "light" : "dark")} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-primary/5">
              <span className="relative h-5 w-5">
                <Sun className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
                <Moon className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
              </span>
            </button>

            {isMarketing && !isAuthenticated && (
              <div className="hidden items-center gap-2 md:flex">
                <Link href={APP_URL.LINKS.LOGIN} className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold hover:bg-accent">Log in</Link>
                <Link href={APP_URL.LINKS.REGISTER} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#5741c7] via-[#7253e5] to-[#9b75f4] px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:brightness-110"><Heart className="h-4 w-4 fill-current" />Get Started</Link>
              </div>
            )}

            {isDashboard ? (
              <>
                <div className="hidden h-7 w-px bg-border/70 sm:block" />
                <button type="button" aria-label="Open account" onClick={() => router.push(APP_URL.LINKS.ACCOUNT)} className="group flex h-10 items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-primary/5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#e85d9e] text-xs font-bold text-white">{initials}</span>
                  <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:block">{displayName}</span>
                </button>
              </>
            ) : isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button type="button" aria-label="Open account menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)} className="group flex h-10 items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 shadow-sm hover:border-primary/40">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#e85d9e] text-xs font-bold text-white">{initials}</span>
                  <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:block">{displayName}</span>
                  <ChevronDown className={`hidden h-4 w-4 text-muted-foreground transition-transform sm:block ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                {profileOpen && <ProfileMenu user={user} displayName={displayName} onLogout={() => setIsLogoutOpen(true)} onClose={() => setProfileOpen(false)} />}
              </div>
            ) : null}

            {isMarketing && (
              <button type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-accent lg:hidden">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {isMarketing && mobileOpen && <MobileMarketingMenu onClose={() => setMobileOpen(false)} isAuthenticated={isAuthenticated} onLogout={() => setIsLogoutOpen(true)} />}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </header>

      {showNotifications && <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />}
      <Popup open={isLogoutOpen} onOpenChange={setIsLogoutOpen} variant="logout" title="Logout?" description="Are you sure you want to log out of your account?" confirmText="Logout" onConfirm={handleLogout} />
    </>
  );
}

function ProfileMenu({ user, displayName, onLogout, onClose }: { user?: any; displayName: string; onLogout: () => void; onClose: () => void }) {
  const connected = user?.onboardingStep === "connected";
  const href = connected ? APP_URL.LINKS.ACCOUNT : onboardingRoutes[user?.onboardingStep as OnboardingStep];
  return (
    <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-2xl animate-in fade-in-0 zoom-in-95">
      <div className="mb-1.5 flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{getInitials(user?.firstName, user?.lastName)}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{displayName}</p><p className="truncate text-[11px] text-muted-foreground">{user?.email || "Subscriber"}</p></div></div>
      {connected && <Link href={APP_URL.LINKS.DASHBOARD} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"><LayoutDashboard className="h-4 w-4 text-primary" />Dashboard</Link>}
      <Link href={href || APP_URL.LINKS.ACCOUNT} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">{connected ? <User className="h-4 w-4 text-primary" /> : <LayoutDashboard className="h-4 w-4 text-primary" />}{connected ? "Profile" : "Complete Connection"}</Link>
      <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10"><LogOut className="h-4 w-4" />Logout</button>
    </div>
  );
}

function MobileMarketingMenu({ onClose, isAuthenticated, onLogout }: { onClose: () => void; isAuthenticated: boolean; onLogout: () => void }) {
  return (
    <div className="border-t border-border/60 bg-background px-4 pb-6 pt-4 lg:hidden">
      <nav aria-label="Mobile" className="flex flex-col gap-1">{NAV_LINKS.map((link) => <a key={link.href} href={link.href} onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-accent">{link.label}</a>)}</nav>
      {!isAuthenticated ? <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-4"><Link href={APP_URL.LINKS.LOGIN} onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface text-sm font-semibold">Log in</Link><Link href={APP_URL.LINKS.REGISTER} onClick={onClose} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-white"><Heart className="h-4 w-4 fill-current" />Get Started</Link></div> : <div className="mt-4 space-y-1 border-t border-border/60 pt-4"><Link href={APP_URL.LINKS.DASHBOARD} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent"><LayoutDashboard className="h-4 w-4 text-primary" />Dashboard</Link><Link href={APP_URL.LINKS.ACCOUNT} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent"><User className="h-4 w-4 text-primary" />Profile</Link><button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10"><LogOut className="h-4 w-4" />Logout</button></div>}
    </div>
  );
}
