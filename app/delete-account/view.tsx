"use client";

import { APP_URL } from "@/constant/static";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

const DeleteAccount = () => {
  const [step, setStep] = useState<"email" | "otp" | "confirm" | "success">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const otpString = useMemo(() => otp.join(""), [otp]);

  const isValidOtp = otpString.length === 4 && /^\d{4}$/.test(otpString);

  const handleSendOtp = () => {
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setStep("otp");
      setOtp(Array(4).fill(""));
      setOtpError("");
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError("");
    if (digit && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted) {
      const next = Array(4).fill("");
      pasted.split("").forEach((d, i) => (next[i] = d));
      setOtp(next);
      inputsRef.current[Math.min(pasted.length, 3)]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (!isValidOtp) {
      setOtpError("OTP must be 4 digits");
      return;
    }
    setOtpError("");
    setStep("confirm");
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1200);
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setStep("success");
    }, 1500);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full min-w-0 items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href={APP_URL.LINKS.HOME}
            aria-label="UnionAI home"
            className="inline-flex min-w-0 shrink items-center"
          >
            <Image
              width={160}
              height={40}
              src={APP_URL.IMAGES.LOGO}
              alt="UnionAI"
              className="h-7 w-auto max-w-[120px] sm:h-9 sm:max-w-none"
            />
          </Link>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </header>

      <main className="min-h-[calc(100vh-74px)] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-100 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Delete Account
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              This action will permanently delete your account.
            </p>
          </div>

          {/* Step indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {["email", "otp", "confirm"].map((s, idx) => {
              const currentIdx =
                step === "success" ? 2 : ["email", "otp", "confirm"].indexOf(step);
              return (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentIdx
                    ? "w-8 bg-purple-600"
                    : idx < currentIdx
                      ? "w-2 bg-purple-600"
                      : "w-2 bg-gray-200"
                    }`}
                />
              );
            })}
          </div>

          {/* Step 1: Email */}
          {step === "email" && (
            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  placeholder="Enter your email address"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
                {emailError && (
                  <p className="mt-2 text-sm text-purple-500">{emailError}</p>
                )}
              </div>
              <button
                onClick={handleSendOtp}
                disabled={isSending}
                className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white shadow-md transition hover:bg-purple-700 disabled:opacity-60"
              >
                {isSending ? "Sending OTP..." : "Send OTP"}
              </button>
              <p className="text-center text-xs text-gray-400">
                We&apos;ll send a verification code to your email address.
              </p>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Enter OTP
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the 4-digit code sent to{" "}
                  <span className="font-medium text-gray-700">{email}</span>
                </p>
                <div
                  className="mt-4 flex justify-center gap-5"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputsRef.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={2}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`h-14 w-14 rounded-xl border bg-white text-center text-2xl font-semibold text-gray-900 outline-none transition focus:ring-2 ${otpError
                        ? "border-purple-400 focus:border-purple-400 focus:ring-purple-100"
                        : "border-gray-300 focus:border-purple-400 focus:ring-purple-100"
                        }`}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="mt-2 text-sm text-purple-500">{otpError}</p>
                )}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={!isValidOtp}
                className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white shadow-md transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Verify OTP
              </button>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep("email")}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Change email
                </button>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-sm font-medium text-purple-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isResending
                    ? "Sending..."
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <p className="text-sm font-semibold text-purple-800">
                  Are you sure you want to delete your account?
                </p>
                <p className="mt-1 text-sm text-purple-600">
                  Account: <span className="font-medium">{email}</span>
                </p>
              </div>
              <ul className="space-y-1 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Cancel your active subscription immediately
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-purple-500" />
                  No refund will be issued for the remaining billing period
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-purple-500" />
                  All your data (check-ins, insights, scores) will be permanently
                  erased
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Your subscription cannot be restored or transferred to a new
                  account
                </li>
              </ul>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white shadow-md transition hover:bg-purple-700 disabled:opacity-60"
              >
                {isDeleting ? "Deleting Account..." : "Yes, Delete My Account"}
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="mt-8">
              <div className="overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg shadow-green-200/60 ring-4 ring-green-100">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Account Deleted
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Your account has been permanently deleted
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );

};

export default DeleteAccount;