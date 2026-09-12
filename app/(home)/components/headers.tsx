"use client";

import { Popup } from "@/components/common/popup";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { setReduxClear } from "@/redux/modules/main/action";
import { logoutUser } from "@/redux/modules/common/user_data/action";
import { postData } from "@/services/rest/fetchData";
import {
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
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Methodology", href: "#methodology" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user_data } = usePosterReducers();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const isAuthenticated = Boolean(user_data?.access_token);
  const user = user_data?.user;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const displayName = fullName || "My Account";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "U";

  const handleLogout = async () => {
    try {
      const response = await postData(
        APP_URL.ENDPOINT_URL.LOGOUT,
        {},
        user_data?.access_token
      );
      toast.success(response.data?.message || "Logged out successfully");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      sessionStorage.clear();
      localStorage.clear();
      dispatch(logoutUser());
      dispatch(setReduxClear());
      setProfileOpen(false);
      setMobileOpen(false);
      router.push(APP_URL.LINKS.HOME);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href={APP_URL.LINKS.HOME}
            aria-label="UnionAI home"
            className="group relative z-50 inline-flex shrink-0 items-center"
          >
            <img
              src={isDark ? APP_URL.IMAGES.LIGHT_LOGO : APP_URL.IMAGES.LOGO}
              alt="UnionAI"
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-105 sm:h-9"
            />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
              >
                {link.label}
                <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-primary via-[#7253e5] to-[#e85d9e] transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-300 ease-out hover:border-transparent hover:text-foreground hover:shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_4px_14px_-2px_rgba(139,92,246,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
            >
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-pink-400/15 via-purple-400/15 to-indigo-400/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative h-5 w-5">
                <Sun
                  className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-out ${
                    isDark
                      ? "rotate-90 scale-0 opacity-0"
                      : "rotate-0 scale-100 opacity-100"
                  }`}
                />
                <Moon
                  className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-out ${
                    isDark
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-0 opacity-0"
                  }`}
                />
              </span>
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  aria-label="Open account menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="group flex h-10 items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#e85d9e] text-xs font-bold text-white ring-2 ring-white/40 dark:ring-white/10">
                    {initials}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-sm font-semibold text-foreground sm:block">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`hidden h-4 w-4 text-muted-foreground transition-transform duration-300 sm:block ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-2xl shadow-black/10 animate-in fade-in-0 zoom-in-95 dark:shadow-black/40">
                    <div className="mb-1.5 flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#e85d9e] text-sm font-bold text-white">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {displayName}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {user?.email || "Subscriber"}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={APP_URL.LINKS.DASHBOARD}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      Dashboard
                    </Link>
                    <Link
                      href={APP_URL.LINKS.PROFILE}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <User className="h-4 w-4 text-primary" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsLogoutOpen(true)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href={APP_URL.LINKS.LOGIN}
                  className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-accent"
                >
                  Log in
                </Link>
                <Link
                  href={APP_URL.LINKS.REGISTER}
                  className="group relative inline-flex h-10 items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-[#5741c7] via-[#7253e5] to-[#9b75f4] px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98]"
                >
                  <Heart className="h-4 w-4 fill-current" />
                  Get Started
                </Link>
              </div>
            )}

            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {mobileOpen && (
          <div className="border-t border-border/60 bg-background px-4 pb-6 pt-4 lg:hidden">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 border-t border-border/60 pt-4">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#e85d9e] text-sm font-bold text-white">
                      {initials}
                    </span>
                    <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                      {displayName}
                    </p>
                  </div>
                  <Link
                    href={APP_URL.LINKS.DASHBOARD}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    Dashboard
                  </Link>
                  <Link
                    href={APP_URL.LINKS.PROFILE}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <User className="h-4 w-4 text-primary" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      setIsLogoutOpen(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={APP_URL.LINKS.LOGIN}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                  >
                    Log in
                  </Link>
                  <Link
                    href={APP_URL.LINKS.REGISTER}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5741c7] via-[#7253e5] to-[#9b75f4] text-sm font-semibold text-white shadow-lg shadow-primary/20"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <Popup
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        variant="logout"
        title="Logout?"
        description="Are you sure you want to log out of your account?"
        confirmText="Logout"
        onConfirm={handleLogout}
      />
    </>
  );
}
