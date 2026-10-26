"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { APP_URL } from "@/constant/static";

export default function InviteRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user_data } = usePosterReducers();
  const [missingCode, setMissingCode] = useState(false);
  const code = (searchParams.get("code") ?? "").trim();

  useEffect(() => {
    if (!code) {
      setMissingCode(true);
      return;
    }

    const joinUrl = `/join-union?code=${encodeURIComponent(code)}`;
    window.sessionStorage.setItem("unionai_invite_return_to", joinUrl);
    const isAuthenticated = Boolean(
      window.localStorage.getItem("access_token") || user_data?.is_Login,
    );
    const destination = isAuthenticated
      ? joinUrl
      : `/login?returnTo=${encodeURIComponent(joinUrl)}`;

    router.replace(destination);
  }, [code, router, user_data?.is_Login]);

  if (missingCode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Invite code missing</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Ask your partner to share the invite link again.
          </p>
          <Link className="mt-5 inline-block font-semibold text-primary hover:underline" href={APP_URL.LINKS.HOME}>
            Go to Union AI
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <p className="text-sm text-muted-foreground">Taking you to website…</p>
    </main>
  );
}
