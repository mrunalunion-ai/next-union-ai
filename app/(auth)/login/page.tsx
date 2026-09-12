"use client";

import { AuthInfoPanel } from "@/components/auth/auth-info-panel";
import AuthLayout from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";
import { APP_URL } from "@/constant/static";
import { useAppDispatch } from "@/redux/hooks";
import { setAuthData, setLogin } from "@/redux/modules/common/user_data/action";
import { AuthReq } from "@/services/rest/fetchData";
import { loginSchema, type LoginFormValues } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

type OnboardingStep =
  | "notStarted"
  | "accountCreated"
  | "relationshipDetailsCompleted"
  | "unionCodeCreated"
  | "unionCodeJoining"
  | "partnerVerified"
  | "connectionRequestSent"
  | "connectionRequestReceived"
  | "connected";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = form;

  const onboardingRoutes: Record<OnboardingStep, string> = {
    notStarted: APP_URL.LINKS.REGISTER,
    accountCreated: APP_URL.LINKS.RELATIONSHIP_DETAILS,
    relationshipDetailsCompleted: APP_URL.LINKS.CREATE_UNION,
    unionCodeCreated: APP_URL.LINKS.CODE_CREATED,
    unionCodeJoining: APP_URL.LINKS.REGISTER,
    partnerVerified: APP_URL.LINKS.JOIN_UNION,
    connectionRequestSent: APP_URL.LINKS.REGISTER,
    connectionRequestReceived: APP_URL.LINKS.REGISTER,
    connected: APP_URL.LINKS.DASHBOARD,
  };

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await AuthReq(APP_URL.ENDPOINT_URL.LOGIN, values);
      if (!response?.success) {
        toast.error(response?.message || "Login failed.");
        return;
      }
      const { accessToken, user } = response.data;
      localStorage.setItem("access_token", accessToken);
      dispatch(setLogin(true));
      dispatch(
        setAuthData({
          user,
          access_token: accessToken,
          is_Login: true,
          status: "",
        }),
      );
      toast.success(response.message || "Welcome back.");
      const route = onboardingRoutes[user?.onboardingStep as OnboardingStep];
      if (route) {
        router.push(route);
      } else {
        router.push(APP_URL.LINKS.DASHBOARD);
      }
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
                Welcome Back
              </h1>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
                Sign in to explore your relationship insights
              </p>
            </header>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 anim-fade-in-delay"
              noValidate
            >
              <InputField<LoginFormValues>
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
              <InputField<LoginFormValues>
                name="password"
                label="Password"
                type="password"
                placeholder="••••••"
                register={register}
                error={errors.password?.message}
                required
                autoComplete="current-password"
                labelClassName="auth-field-label"
                inputClassName="auth-input"
                leftAdornment={<LockKeyhole className="h-5 w-5" />}
                rightLabel={
                  <Link
                    href={APP_URL.LINKS.FORGOT_PASSWORD}
                    className="font-semibold text-primary hover:underline"
                  >
                    Forgot Password
                  </Link>
                }
              />
              <Button
                type="submit"
                className="auth-submit"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Log In"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground sm:text-base">
              Don&apos;t have an account yet?{" "}
              <Link
                href={APP_URL.LINKS.REGISTER}
                className="font-semibold text-primary hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
        <AuthInfoPanel />
      </div>
    </AuthLayout>
  );
}
