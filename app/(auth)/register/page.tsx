"use client";

import AuthLayout from "@/components/auth/auth-layout";
import { RegistrationStepIndicator } from "@/components/auth/registration-step-indicator";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/datePicker";
import DropdownSelect from "@/components/ui/dropdown";
import InputField from "@/components/ui/InputField";
import { APP_URL } from "@/constant/static";
import { AuthReq } from "@/services/rest/fetchData";
import { registerSchema, type RegisterFormValues } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as CountryFlags from "country-flag-icons/react/3x2";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const countryFlag = (country: CountryCode): ReactNode => {
  const Flag = CountryFlags[country] as
    | ComponentType<{ className?: string; title?: string }>
    | undefined;
  return Flag ? (
    <Flag
      className="h-4 w-6 shrink-0 rounded-none object-cover"
      title={regionNames.of(country) ?? country}
    />
  ) : null;
};

const countryOptions = getCountries().map((country) => ({
  value: regionNames.of(country) ?? country,
  label: (
    <span className="flex items-center gap-4">
      {countryFlag(country)}
      <span>{regionNames.of(country) ?? country}</span>
    </span>
  ),
  key: country,
  dialCode: `+${getCountryCallingCode(country)}`,
}));

const phoneCodeOptions = getCountries().map((country) => ({
  value: `+${getCountryCallingCode(country)}`,
  label: (
    <span className="flex items-center gap-3">
      {countryFlag(country)}
      <span className="flex items-center gap-2">
        <span>{`+${getCountryCallingCode(country)}`}</span>
        <span>{regionNames.of(country) ?? country}</span>
      </span>
    </span>
  ),
  key: country,
}));

const genderOptions = [
  { value: "male", label: "Male", key: "male" },
  { value: "female", label: "Female", key: "female" },
  { value: "others", label: "Others", key: "others" },
];

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export default function RegisterPage() {
  const currentStep = 1;
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: "India",
      phoneDialingCode: "+91",
      phoneCountry: "India",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      gender: "",
      dob: "",
      termsAccepted: false,
    },
    mode: "onChange",
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = form;

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const signupPayload = {
        ...values,
        mobileNumber: values.mobileNumber.trim(),
        dob: values.dob instanceof Date ? values.dob.toISOString() : values.dob,
        gender: values.gender.toLowerCase(),
        active: true,
        userType: "USER",
      };
      const response = await AuthReq(
        APP_URL.ENDPOINT_URL.REQUEST_EMAIL_VERIFY,
        { email: values.email.trim() },
      );
      if (!response?.success) {
        toast.error(response?.message || "Could not create account.");
        return;
      }
      sessionStorage.setItem(
        "unionai_signup_payload",
        JSON.stringify(signupPayload),
      );
      sessionStorage.setItem("unionai_signup_email", values.email.trim());
      toast.success(
        response.message || "A verification code has been sent to your email.",
      );
      router.push(APP_URL.LINKS.EMAIL_VERIFICATION);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <AuthLayout>
      <div className="h-full overflow-y-auto scrollbar-hidden">
        <div className="mx-auto flex w-full max-w-[900px] flex-col items-center px-1 py-8 sm:px-4 sm:py-10 lg:py-12">
          <header className="mb-7 text-center">
            <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
              Create Account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Start building stronger relationships today.
            </p>
          </header>
          <RegistrationStepIndicator
            currentStep={currentStep}
            className="mb-8 w-full max-w-[600px]"
          />
          <div className="w-full rounded-2xl border border-border/60 bg-surface p-5 shadow-sm sm:p-7 lg:p-9">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <div className="grid gap-5 lg:grid-cols-2">
                <InputField<RegisterFormValues>
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  register={register}
                  error={errors.firstName?.message}
                  required
                  autoComplete="given-name"
                  labelClassName="auth-field-label"
                  inputClassName="auth-input"
                  leftAdornment={<UserRound className="h-5 w-5" />}
                />
                <InputField<RegisterFormValues>
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  register={register}
                  error={errors.lastName?.message}
                  required
                  autoComplete="family-name"
                  labelClassName="auth-field-label"
                  inputClassName="auth-input"
                  leftAdornment={<UserRound className="h-5 w-5" />}
                />
              </div>
              <InputField<RegisterFormValues>
                name="email"
                label="Email Address"
                type="email"
                placeholder="john.doe@example.com"
                register={register}
                error={errors.email?.message}
                required
                autoComplete="email"
                labelClassName="auth-field-label"
                inputClassName="auth-input"
                leftAdornment={<Mail className="h-5 w-5" />}
              />
              <div>
                <DropdownSelect
                  label="Country"
                  name="country"
                  control={control}
                  options={countryOptions}
                  required
                  isClearable={false}
                  labelClassName="auth-field-label"
                  formClassName="mt-1 h-11 rounded-[10px] border-input bg-background"
                  placeholder="Select country"
                  onSelect={(option) => {
                    const country = countryOptions.find(
                      (item) => item.value === option?.value,
                    );
                    if (country) {
                      form.setValue("phoneCountry", country.value, {
                        shouldValidate: true,
                      });
                      form.setValue("phoneDialingCode", country.dialCode, {
                        shouldValidate: true,
                      });
                    }
                  }}
                  errors={errors.country?.message && errors.country.message}
                />
              </div>
              <div>
                <div className="mt-1 grid grid-cols-[minmax(9rem,0.9fr)_minmax(0,1.8fr)] sm:grid-cols-[minmax(11rem,1fr)_minmax(0,2fr)]">
                  <DropdownSelect
                    label="Phone Number"
                    name="phoneDialingCode"
                    control={control}
                    options={phoneCodeOptions}
                    isClearable={false}
                    labelClassName="auth-field-label"
                    formClassName="mt-1 h-11 rounded-[10px] border-input bg-background"
                    placeholder="Code"
                    onSelect={(option) =>
                      form.setValue(
                        "phoneDialingCode",
                        String(option?.value ?? ""),
                        { shouldValidate: true, shouldDirty: true },
                      )
                    }
                  />
                  <InputField<RegisterFormValues>
                    name="mobileNumber"
                    type="tel"
                    placeholder="Phone number"
                    register={register}
                    error={errors.mobileNumber?.message}
                    required
                    className="!mt-7"
                    autoComplete="tel-national"
                    labelClassName="sr-only"
                    inputClassName="auth-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <InputField<RegisterFormValues>
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="••••••"
                  register={register}
                  error={errors.password?.message}
                  required
                  autoComplete="new-password"
                  labelClassName="auth-field-label"
                  inputClassName="auth-input"
                  leftAdornment={<LockKeyhole className="h-5 w-5" />}
                />
                <InputField<RegisterFormValues>
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••"
                  register={register}
                  error={errors.confirmPassword?.message}
                  required
                  autoComplete="new-password"
                  labelClassName="auth-field-label"
                  inputClassName="auth-input"
                  leftAdornment={<LockKeyhole className="h-5 w-5" />}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <DropdownSelect
                    label="Gender"
                    name="gender"
                    control={control}
                    required
                    options={genderOptions}
                    placeholder="Select Gender"
                    labelClassName="auth-field-label"
                    formClassName="mt-1 h-11 rounded-[10px] border-input bg-background"
                    errors={errors.gender?.message && errors.gender.message}
                  />
                </div>
                <DatePicker<RegisterFormValues>
                  name="dob"
                  control={control}
                  label="DOB"
                  placeholder="Select date"
                  minDate={new Date(1950, 0, 1)}
                  maxDate={new Date()}
                  required
                  error={errors.dob?.message}
                  labelClassName="auth-field-label"
                  inputClassName="auth-input"
                />
              </div>
              <label className="flex items-start gap-3 text-base leading-6 text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-foreground accent-primary"
                  {...register("termsAccepted")}
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline"
                    onClick={() =>
                      toast.info(
                        "Terms & Conditions page is not included in this conversion.",
                      )
                    }
                  >
                    Terms &amp; Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline"
                    onClick={() =>
                      toast.info(
                        "Privacy Policy page is not included in this conversion.",
                      )
                    }
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.termsAccepted?.message && (
                <p className="-mt-3 text-sm text-destructive">
                  {errors.termsAccepted.message}
                </p>
              )}
              <Button
                type="submit"
                className="auth-submit mt-2 w-full"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </div>
          <p className="mt-5 text-center text-base text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={APP_URL.LINKS.LOGIN}
              className="font-semibold text-primary hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
