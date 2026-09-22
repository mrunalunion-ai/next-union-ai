"use client";

import AuthLayout from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otpInput";
import { APP_URL } from "@/constant/static";
import { useAppDispatch } from "@/redux/hooks";
import { setAuthData, setLogin } from "@/redux/modules/common/user_data/action";
import { AuthReq } from "@/services/rest/fetchData";
import { otpSchema, type OtpFormValues } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function EmailVerificationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const dispatch = useAppDispatch();
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
    const signupEmail =
      sessionStorage.getItem("unionai_signup_email")?.trim() ?? "";
    setEmail(signupEmail);
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
      const response = await AuthReq(APP_URL.ENDPOINT_URL.VERIFY_EMAIL, {
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
      const rawPayload = sessionStorage.getItem("unionai_signup_payload");
      if (!rawPayload) {
        toast.error(
          "Your signup session has expired. Please create your account again.",
        );
        return;
      }
      const { termsAccepted: _termsAccepted, ...signupPayload } =
        JSON.parse(rawPayload);
      const signupResponse = await AuthReq(
        APP_URL.ENDPOINT_URL.SIGNUP,
        signupPayload,
      );
      if (!signupResponse?.success) {
        toast.error(
          signupResponse?.message ||
          "We could not finish creating your account.",
        );
        return;
      }
      const accessToken = signupResponse.data?.accessToken;
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        dispatch(setLogin(true));
        dispatch(
          setAuthData({
            user: signupResponse.data.user,
            access_token: accessToken,
            is_Login: true,
            status: "",
          }),
        );
      }
      sessionStorage.removeItem("unionai_signup_payload");
      sessionStorage.removeItem("unionai_signup_email");
      router.push(APP_URL.LINKS.RELATIONSHIP_DETAILS);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const resendCode = async () => {
    if (secondsRemaining > 0 || !email) return;
    setIsResending(true);
    try {
      const response = await AuthReq(
        APP_URL.ENDPOINT_URL.REQUEST_EMAIL_VERIFY,
        { email },
      );
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
      <div className="h-full overflow-y-auto scrollbar-hidden">
        <div className="mx-auto flex w-full flex-col items-center px-1 py-8 sm:px-4 sm:py-10 lg:py-12">
          {/* ─── Header ─── */}
          <header className="mb-5 text-center">
            <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
              Verify Email Address
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
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
          <div className="w-full max-w-[450px] bg-surface p-5 shadow-sm sm:p-7 lg:p-9">
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
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
