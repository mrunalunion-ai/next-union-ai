"use client";

import { AuthInfoPanel } from "@/components/auth/auth-info-panel";
import AuthLayout from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otpInput";
import { APP_URL } from "@/constant/static";
import { AuthReq } from "@/services/rest/fetchData";
import { otpSchema, type OtpFormValues } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function OtpVerificationContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
    mode: "onChange",
  });
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = form;

  useEffect(() => {
    setEmail(sessionStorage.getItem("unionai_recovery_email")?.trim() ?? "");
  }, []);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = window.setInterval(
      () => setSecondsRemaining((seconds) => seconds - 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [secondsRemaining]);

  const onSubmit = async (values: OtpFormValues) => {
    if (!email) {
      toast.error(
        "Your verification email is missing. Please request a new code.",
      );
      return;
    }
    try {
      const response = await AuthReq(APP_URL.ENDPOINT_URL.VERIFY_OTP, {
        email,
        code: values.code,
      });
      if (!response?.success) {
        toast.error(
          response?.message || "That verification code is invalid or expired.",
        );
        return;
      }
      toast.success(response.message || "Code verified.");
      sessionStorage.setItem("unionai_recovery_code", values.code);
      router.push(APP_URL.LINKS.RESET_PASSWORD);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const resendCode = async () => {
    if (secondsRemaining > 0 || !email) return;
    setIsResending(true);
    try {
      const response = await AuthReq(APP_URL.ENDPOINT_URL.FORGOT_PASSWORD, {
        email,
      });
      if (!response?.success) {
        toast.error(response?.message || "We could not resend the code.");
        return;
      }
      reset({ code: "" });
      setSecondsRemaining(60);
      toast.success(
        response.message || "A new code has been sent to your email.",
      );
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
        <div className="relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-5 py-5 sm:px-8 sm:py-6 lg:w-1/2 lg:px-12 lg:py-8 xl:px-16">
          <div className="relative mx-auto w-full max-w-[390px]">
            <header className="mb-5 anim-slide-right sm:mb-6">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#9b75f4] shadow-lg shadow-purple-500/20">
                <Heart
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  aria-hidden="true"
                />
              </div>
              <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2rem]">
                Verify Code
              </h1>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
                {
                  <>
                    We&apos;ve sent a code to your email
                    <br />
                    <span className="break-all">
                      {email || "your email address"}
                    </span>
                  </>
                }
              </p>
            </header>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 anim-fade-in-delay"
              noValidate
            >
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <OtpInput
                    length={4}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.code?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
              {secondsRemaining > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Code expires in{" "}
                  <span className="font-semibold text-base text-destructive">
                    00:{String(secondsRemaining).padStart(2, "0")}
                  </span>
                </p>
              )}
              <button
                type="button"
                onClick={resendCode}
                disabled={secondsRemaining > 0 || isResending}
                className="mx-auto block text-sm font-semibold text-primary transition-colors hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </button>
              <Button
                type="submit"
                className="auth-submit"
                disabled={!isValid || isSubmitting || !email}
              >
                {isSubmitting ? "Verifying..." : "Verify"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground sm:text-base">
              Want to use a different email?{" "}
              <Link
                href={APP_URL.LINKS.FORGOT_PASSWORD}
                className="font-semibold text-primary hover:underline"
              >
                Change email
              </Link>
            </p>
          </div>
        </div>
        <AuthInfoPanel mode="recovery" />
      </div>
    </AuthLayout>
  );
}
