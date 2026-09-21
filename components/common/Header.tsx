"use client";

import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { setReduxClear } from "@/redux/modules/main/action";
import { postData } from "@/services/rest/fetchData";
import { LogOut, Moon, Sun, User, UserCircle } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Popup } from "../common/popup";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user_data, mainReducer } = usePosterReducers();
  const [profileOpen, setProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  const profileRef = useRef<HTMLDivElement>(null);

  const isDark = mounted && resolvedTheme === "dark";
  const isAuthenticated = Boolean(user_data?.access_token);
  console.log("mainReducer", mainReducer)
  console.log("user_data", user_data)


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const response = await postData(
      APP_URL.ENDPOINT_URL.LOGOUT,
      {},
      user_data?.access_token
    );
    toast.success(
      response.data.message || "Logged out successfully",
    );
    sessionStorage.clear();
    localStorage.clear();
    dispatch(setReduxClear());
    setProfileOpen(false);
    router.push(APP_URL.LINKS.HOME);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href={APP_URL.LINKS.HOME}
            aria-label="UnionAI home"
            className="group inline-flex items-center"
          >
            <img
              src={isDark ? APP_URL.IMAGES.LIGHT_LOGO : APP_URL.IMAGES.LOGO}
              alt="UnionAI"
              className="h-9 w-auto sm:h-10"
            />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground
                       transition-all duration-300 ease-out
                       hover:border-transparent hover:text-foreground hover:shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_4px_14px_-2px_rgba(139,92,246,0.35)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
            >
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-pink-400/15 via-purple-400/15 to-indigo-400/15
                         opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <span className="relative h-5 w-5">
                <Sun
                  className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-out
                  ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
                />
                <Moon
                  className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-out
                  ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
                />
              </span>
            </button>
            {isAuthenticated && (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-foreground hover:shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_4px_14px_-2px_rgba(139,92,246,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                >
                  <UserCircle className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95">
                    <Link
                      href={APP_URL.LINKS.PROFILE}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setIsLogoutOpen(true)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
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