"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AuthInfoPanel } from "@/components/auth/auth-info-panel";
import AuthLayout from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";
import { APP_URL } from "@/constant/static";
import { AuthReq } from "@/services/rest/fetchData";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/utils/schema";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = form;

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const response = await AuthReq(APP_URL.ENDPOINT_URL.FORGOT_PASSWORD, {
        email: values.email.trim(),
      });
      if (!response?.success) {
        toast.error(response?.message || "We could not send a reset code.");
        return;
      }
      toast.success(
        response.message || "A reset code has been sent to your email.",
      );
      sessionStorage.setItem("unionai_recovery_email", values.email.trim());
      router.push(APP_URL.LINKS.OTP_VERIFICATION);
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
                Forgot Password
              </h1>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
                Enter your email to receive a reset code
              </p>
            </header>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 anim-fade-in-delay"
              noValidate
            >
              <InputField<ForgotPasswordFormValues>
                name="email"
                label="Email Address"
                type="email"
                placeholder="email@example.com"
                register={register}
                error={errors.email?.message}
                required
                autoComplete="email"
                labelClassName="auth-field-label"
                inputClassName="auth-input"
                leftAdornment={<Mail className="h-5 w-5" />}
              />
              <Button
                type="submit"
                className="auth-submit"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground sm:text-base">
              Remember your password?{" "}
              <Link
                href={APP_URL.LINKS.LOGIN}
                className="font-semibold text-primary hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
        <AuthInfoPanel mode="recovery" />
      </div>
    </AuthLayout>
  );
}
