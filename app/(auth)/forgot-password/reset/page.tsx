"use client";

import { AuthInfoPanel } from "@/components/auth/auth-info-panel";
import AuthLayout from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";
import { APP_URL } from "@/constant/static";
import { AuthReq } from "@/services/rest/fetchData";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function ResetPasswordContent() {
  const router = useRouter();
  const [recovery, setRecovery] = useState({ email: "", code: "" });
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = form;

  useEffect(() => {
    setRecovery({
      email: sessionStorage.getItem("unionai_recovery_email")?.trim() ?? "",
      code: sessionStorage.getItem("unionai_recovery_code")?.trim() ?? "",
    });
  }, []);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!recovery.email || !recovery.code) {
      toast.error(
        "Your reset session is missing or expired. Please request a new code.",
      );
      return;
    }
    try {
      const response = await AuthReq(APP_URL.ENDPOINT_URL.RESET_PASSWORD, {
        email: recovery.email,
        code: recovery.code,
        ...values,
      });
      if (!response?.success) {
        toast.error(response?.message || "We could not reset your password.");
        return;
      }
      toast.success(
        response.message || "Password reset successfully. You can now sign in.",
      );
      sessionStorage.removeItem("unionai_recovery_email");
      sessionStorage.removeItem("unionai_recovery_code");
      router.replace(APP_URL.LINKS.LOGIN);
    } catch (error) {
      toast.error(errorMessage(error));
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
                Reset Password
              </h1>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
                Create a new password for your account
              </p>
            </header>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 anim-fade-in-delay"
              noValidate
            >
              <InputField<ResetPasswordFormValues>
                name="password"
                label="New Password"
                type="password"
                placeholder="••••••••"
                register={register}
                error={errors.password?.message}
                required
                autoComplete="new-password"
                labelClassName="auth-field-label"
                inputClassName="auth-input"
                leftAdornment={<LockKeyhole className="h-5 w-5" />}
              />
              <InputField<ResetPasswordFormValues>
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                register={register}
                error={errors.confirmPassword?.message}
                required
                autoComplete="new-password"
                labelClassName="auth-field-label"
                inputClassName="auth-input"
                leftAdornment={<LockKeyhole className="h-5 w-5" />}
              />
              <Button
                type="submit"
                className="auth-submit"
                disabled={
                  !isValid || isSubmitting || !recovery.email || !recovery.code
                }
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground sm:text-base">
              Return to{" "}
              <Link
                href={APP_URL.LINKS.LOGIN}
                className="font-semibold text-primary hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
        <AuthInfoPanel />
      </div>
    </AuthLayout>
  );
}
