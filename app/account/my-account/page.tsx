"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Heart, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";

import { AccountPageHeader } from "@/components/account/account-ui";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import DatePicker from "@/components/ui/datePicker";
import DropdownSelect from "@/components/ui/dropdown";
import InputField from "@/components/ui/InputField";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import {
  initialAccountState,
  setAccountSaving,
} from "@/redux/modules/account";
import { ILoveLanguage, IRelationshipStatus } from "@/redux/modules/main/types";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import {
  accountPersonalSchema,
  accountRelationshipSchema,
  type AccountPersonalFormValues,
  type AccountRelationshipFormValues,
} from "@/utils/schema";
import { countryOptions, genderOptions, phoneCodeOptions } from "@/app/(auth)/register/page";
import { formatDateDDMMYYYY } from "@/utils/common";

type AccountTab = "personal" | "relationship";

function isNotSureLanguage(language: ILoveLanguage) {
  return (
    language.id.toLowerCase().includes("not-sure") ||
    language.title.toLowerCase().includes("not sure")
  );
}

export default function MyAccountPage() {
  const dispatch = useAppDispatch();
  const { user_data, mainReducer, account } = usePosterReducers();
  const { isConnected, sendMessage } = useWebSocket();
  const accountState = account ?? initialAccountState;
  const [activeTab, setActiveTab] = useState<AccountTab>("personal");
  const user = user_data?.user;
  const relationship = user?.relationships?.[0];

  const personalForm = useForm<AccountPersonalFormValues>({
    resolver: zodResolver(accountPersonalSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      dob: "",
      country: "",
      phoneDialingCode: "",
      phoneCountry: "",
      mobileNumber: "",
      email: "",
    },
    mode: "onChange",
  });

  const relationshipForm = useForm<AccountRelationshipFormValues>({
    resolver: zodResolver(accountRelationshipSchema),
    defaultValues: { summary: "", loveLanguages: [], relationStatusId: "" },
    mode: "onChange",
  });

  const selectedLanguages = useWatch({
    control: relationshipForm.control,
    name: "loveLanguages",
  }) ?? [];
  const languages = mainReducer?.loveLanguageList?.data ?? [];
  const relationStatusOptions = (mainReducer?.relationStatusList?.data ?? []).map(
    (status: IRelationshipStatus) => ({ value: status.id, label: status.title, key: status.id }),
  );

  useEffect(() => {
    if (!isConnected) return;

    sendMessage("action", { type: "userService", action: "get", payload: {} });
    sendMessage("action", {
      type: "loveLanguageService",
      action: "list",
      payload: { page: 1, limit: 100, search: "", active: true },
    });
    sendMessage("action", {
      type: "relationStatusService",
      action: "list",
      payload: { page: 1, limit: 100, search: "", active: true },
    });
  }, [isConnected, sendMessage]);

  useEffect(() => {
    personalForm.reset({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      gender: user?.gender?.toLowerCase() ?? "",
      dob: user?.dob?.slice(0, 10) ?? "",
      country: user?.country ?? "",
      email: user?.email,
      phoneDialingCode: user?.phoneDialingCode ?? "",
      phoneCountry: user?.phoneCountry ?? "",
      mobileNumber: user?.mobileNumber ?? "",
    });
    relationshipForm.reset({
      summary: user?.summary ?? "",
      loveLanguages: user?.loveLanguages?.map((language: ILoveLanguage) => language.id) ?? [],
      relationStatusId: relationship?.relationStatusId ?? ""
    });
  }, [personalForm, relationshipForm, user, relationship]);

  const toggleLanguage = (id: string) => {
    const language = languages.find((item: ILoveLanguage) => item.id === id);
    if (!language) return;

    if (selectedLanguages.includes(id)) {
      relationshipForm.setValue(
        "loveLanguages",
        selectedLanguages.filter((item) => item !== id),
        { shouldDirty: true, shouldValidate: true },
      );
      return;
    }

    if (isNotSureLanguage(language)) {
      relationshipForm.setValue("loveLanguages", [id], {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const selectedWithoutNotSure = selectedLanguages.filter(
      (selectedId) =>
        !languages.some(
          (item: ILoveLanguage) => item.id === selectedId && isNotSureLanguage(item),
        ),
    );

    if (selectedWithoutNotSure.length >= 3) {
      toast.error("You can select up to 3 love languages.");
      return;
    }

    relationshipForm.setValue(
      "loveLanguages",
      [...selectedWithoutNotSure, id],
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const submitPersonal = (values: AccountPersonalFormValues) => {
    if (!isConnected || !user?.id) {
      toast.error("Connect to the server before updating your profile.");
      return;
    }

    dispatch(setAccountSaving(true));
    sendMessage("action", {
      type: "userService",
      action: "update",
      payload: {
        id: user.id,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        gender: values.gender,
        dob: values.dob,
        country: values.country.trim(),
        mobileNumber: values.mobileNumber.trim(),
        phoneDialingCode: values.phoneDialingCode.trim(),
        phoneCountry: values.phoneCountry.trim(),
      },
    });
  };

  const submitRelationship = (values: AccountRelationshipFormValues) => {
    if (!isConnected || !user?.id) {
      toast.error("Connect to the server before updating your relationship.");
      return;
    }

    dispatch(setAccountSaving(true));
    sendMessage("action", {
      type: "userService",
      action: "update",
      payload: {
        id: user.id,
        summary: values.summary.trim(),
        loveLanguages: values.loveLanguages,
        ...(values.relationStatusId
          ? { relationStatusId: values.relationStatusId }
          : {}),
      },
    });
  };

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <AccountPageHeader
            title="My Account"
            description="Keep your personal details and relationship profile up to date."
            showBack
          />

          <div className="mx-auto mb-6 flex w-full rounded-lg bg-secondary p-1">
            {(["personal", "relationship"] as AccountTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
              >
                {tab === "personal" ? "Personal Details" : "Relationship"}
              </button>
            ))}
          </div>

          {activeTab === "personal" ? (
            <Card className="rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-7">
              <form
                className="space-y-5"
                onSubmit={personalForm.handleSubmit(submitPersonal)}
                noValidate
              >
                <div className="uppercase text-sm font-semibold">
                  Personal Information
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <InputField<AccountPersonalFormValues>
                    name="firstName"
                    label="First name"
                    register={personalForm.register}
                    labelClassName="auth-field-label"
                    inputClassName="auth-input"
                  />
                  <InputField<AccountPersonalFormValues>
                    name="lastName"
                    label="Last name"
                    register={personalForm.register}
                    labelClassName="auth-field-label"
                    inputClassName="auth-input"
                  />
                  <InputField<AccountPersonalFormValues>
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="john.doe@example.com"
                    register={personalForm.register}
                    readOnly
                    labelClassName="auth-field-label"
                    inputClassName="auth-input"
                  />
                  <DropdownSelect
                    name="gender"
                    label="Gender"
                    control={personalForm.control}
                    options={genderOptions}
                    placeholder="Select gender"
                    labelClassName="auth-field-label"
                  />
                  <DatePicker<AccountPersonalFormValues>
                    name="dob"
                    label="Date of birth"
                    control={personalForm.control}
                    format="YYYY-MM-DD"
                    labelClassName="auth-field-label"
                    inputClassName="auth-input"
                  />
                  <InputField<AccountPersonalFormValues>
                    name="country"
                    label="Country"
                    register={personalForm.register}
                    labelClassName="auth-field-label"
                    inputClassName="auth-input"
                  />
                  <DropdownSelect
                    label="Country"
                    name="country"
                    control={personalForm.control}
                    options={countryOptions}
                    isClearable={false}
                    labelClassName="auth-field-label"
                    formClassName="mt-1 h-11 rounded-[10px] border-input bg-background"
                    placeholder="Select country"
                    onSelect={(option) => {
                      const country = countryOptions.find(
                        (item) => item.value === option?.value,
                      );
                      if (country) {
                        personalForm.setValue("phoneCountry", country.value, {
                          shouldValidate: true,
                        });
                        personalForm.setValue("phoneDialingCode", country.dialCode, {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                  <div className="grid grid-cols-[minmax(9rem,0.9fr)_minmax(0,1.8fr)] sm:grid-cols-[minmax(11rem,1fr)_minmax(0,2fr)]">
                    <DropdownSelect
                      name="phoneDialingCode"
                      label="Phone Number"
                      control={personalForm.control}
                      options={phoneCodeOptions}
                      isClearable={false}
                      placeholder="Code"
                      className="min-w-0"
                      labelClassName="auth-field-label"
                      onSelect={(option) => {
                        const selectedCountry = countryOptions.find(
                          (country) => country.key === option?.key,
                        );
                        personalForm.setValue(
                          "phoneDialingCode",
                          String(option?.value ?? ""),
                          { shouldValidate: true, shouldDirty: true },
                        );
                        if (selectedCountry) {
                          personalForm.setValue(
                            "phoneCountry",
                            selectedCountry.value,
                            { shouldValidate: true, shouldDirty: true },
                          );
                          personalForm.setValue("country", selectedCountry.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                        void personalForm.trigger([
                          "phoneDialingCode",
                          "phoneCountry",
                          "mobileNumber",
                        ]);
                      }}
                    />
                    <InputField<AccountPersonalFormValues>
                      name="mobileNumber"
                      type="tel"
                      placeholder="Phone number"
                      register={personalForm.register}
                      error={personalForm.formState.errors.mobileNumber?.message}
                      required
                      className="!mt-7"
                      autoComplete="tel-national"
                      labelClassName="sr-only"
                      inputClassName="auth-input"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={accountState.saving || !isConnected}
                  >
                    {accountState.saving ? "Saving…" : "Update Personal Details"}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-7">
              <form
                className="space-y-6"
                onSubmit={relationshipForm.handleSubmit(submitRelationship)}
                noValidate
              >
                <InputField<AccountRelationshipFormValues>
                  name="summary"
                  label="Short summary of your relationship"
                  register={relationshipForm.register}
                  error={relationshipForm.formState.errors.summary?.message}
                  useFor="textarea"
                  rows={4}
                  required
                  placeholder="Tell us a little about your relationship"
                />

                <div>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold">
                        Love languages <span className="text-red-500">*</span>
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Choose up to three that describe your relationship.
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedLanguages.length}/3
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {languages
                      .slice()
                      .sort(
                        (first: any, second: any) =>
                          Number(isNotSureLanguage(first)) -
                          Number(isNotSureLanguage(second)),
                      )
                      .map((language: ILoveLanguage) => {
                        const selected = selectedLanguages.includes(language.id);
                        return (
                          <button
                            key={language.id}
                            type="button"
                            onClick={() => toggleLanguage(language.id)}
                            aria-pressed={selected}
                            className={`relative flex gap-3 rounded-2xl border p-4 text-left transition-colors ${selected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background hover:border-primary/40"
                              }`}
                          >
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                              {language.icon || <Heart className="h-5 w-5" />}
                            </span>
                            <span className="min-w-0 pr-5">
                              <span className="block text-sm font-semibold">{language.title}</span>
                              {language.description && (
                                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                  {language.description}
                                </span>
                              )}
                            </span>
                            {selected && (
                              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                  {relationshipForm.formState.errors.loveLanguages?.message && (
                    <p className="mt-2 text-sm text-destructive">
                      {relationshipForm.formState.errors.loveLanguages.message}
                    </p>
                  )}

                </div>
                <div className="mt-3 rounded-2xl bg-background p-4">
                  <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Relationship Status
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Relation Type
                      </span>
                      <span className="font-semibold text-foreground">
                        {relationship?.relationStatus?.title ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Relationship date
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatDateDDMMYYYY(relationship?.date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        Children
                      </span>
                      <span className="font-semibold text-foreground">
                        {relationship?.children ?? ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button type="submit" disabled={accountState.saving || !isConnected}>
                    {accountState.saving ? "Saving…" : "Update Relationship Details"}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
