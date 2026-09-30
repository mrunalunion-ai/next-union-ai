"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Heart, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";

import { countryOptions, genderOptions, phoneCodeOptions } from "@/app/(auth)/register/page";
import { AccountPageHeader } from "@/components/account/account-ui";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DatePicker from "@/components/ui/datePicker";
import DropdownSelect from "@/components/ui/dropdown";
import InputField from "@/components/ui/InputField";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import {
  initialAccountState,
  setAccountSaving,
} from "@/redux/modules/account";
import { ILoveLanguage, IRelationshipStatus } from "@/redux/modules/main/types";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import { formatDateDDMMYYYY } from "@/utils/common";
import {
  accountPersonalSchema,
  accountRelationshipSchema,
  type AccountPersonalFormValues,
  type AccountRelationshipFormValues,
} from "@/utils/schema";
import { API_BASE_URL } from "@/constant/static";

type AccountTab = "personal" | "relationship";

function isNotSureLanguage(language: ILoveLanguage) {
  return (
    language?.id?.toLowerCase()?.includes("not-sure") ||
    language?.title?.toLowerCase()?.includes("not sure")
  );
}

export default function MyAccountPage() {
  const dispatch = useAppDispatch();
  const { user_data, mainReducer, account } = usePosterReducers();
  const { isConnected, sendMessage, lastEvent } = useWebSocket();
  const accountState = account ?? initialAccountState;
  const [activeTab, setActiveTab] = useState<AccountTab>("personal");
  const user = user_data?.user;
  const relationship = user?.relationships?.[0];
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      profileImage: "",
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
      profileImage: user?.profileImage ?? "",
    });
    if (user?.profileImage) {
      setUploadedImageUrl(user.profileImage);
    }
    relationshipForm.reset({
      summary: user?.summary ?? "",
      loveLanguages: user?.loveLanguages?.map((language: ILoveLanguage) => language?.id) ?? [],
      relationStatusId: relationship?.relationStatusId ?? ""
    });
  }, [personalForm, relationshipForm, user, relationship]);

  const resolveImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return null;
    return /^(https?:|blob:|data:)/i.test(imageUrl) ? imageUrl : `${API_BASE_URL}${imageUrl}`;
  };

  const displayImage =
    resolveImageUrl(uploadedImageUrl) ||
    imagePreview ||
    resolveImageUrl(user?.profileImage);

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    const token = user_data?.access_token;
    if (!token) {
      toast.error("Authentication required");
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseData = await response.json();

      return (
        responseData?.data?.fileUrl ??
        (responseData?.success ? responseData?.data?.fileUrl : null) ??
        responseData?.fileUrl ??
        null
      );
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setIsUploadingImage(true);

    const uploadedUrl = await uploadProfileImage(file);
    setIsUploadingImage(false);

    if (!uploadedUrl) {
      toast.error("Failed to upload image");
      return;
    }

    setUploadedImageUrl(uploadedUrl);
    personalForm.setValue("profileImage", uploadedUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success("Profile image uploaded");
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setUploadedImageUrl(null);
    setImagePreview(null);
    personalForm.setValue("profileImage", "", { shouldDirty: true, shouldValidate: true });
  };

  const toggleLanguage = (id: string) => {
    const language = languages?.find((item: ILoveLanguage) => item?.id === id);
    if (!language) return;

    if (selectedLanguages.includes(id)) {
      relationshipForm.setValue(
        "loveLanguages",
        selectedLanguages?.filter((item) => item !== id),
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
        !languages?.some(
          (item: ILoveLanguage) => item?.id === selectedId && isNotSureLanguage(item),
        ),
    );

    if (selectedWithoutNotSure?.length >= 3) {
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
    const dobDate = values.dob ? new Date(values.dob).toISOString() : "";
    sendMessage("action", {
      type: "userService",
      action: "update",
      payload: {
        id: user?.id,
        firstName: values?.firstName.trim(),
        lastName: values?.lastName.trim(),
        gender: values?.gender,
        dob: dobDate,
        country: values?.country?.trim(),
        mobileNumber: values?.mobileNumber?.trim(),
        phoneDialingCode: values?.phoneDialingCode?.trim(),
        phoneCountry: values?.phoneCountry?.trim(),
        profileImage: values?.profileImage || "",
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
        id: user?.id,
        summary: values?.summary?.trim(),
        loveLanguages: values?.loveLanguages,
        ...(values?.relationStatusId
          ? { relationStatusId: values?.relationStatusId }
          : {}),
      },
    });
  };

  useEffect(() => {
    if (
      lastEvent?.data?.status &&
      lastEvent?.data?.request?.type === "userService" &&
      lastEvent?.data?.request?.action === "update" &&
      lastEvent?.data?.data?.onboardingStep === "connected"
    ) {
      toast.success(lastEvent?.data?.msg ?? "Profile updated successfully.");
    }
  }, [lastEvent]);

  return (
    <DashboardLayout>
      <main className="min-h-full px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <AccountPageHeader
            title="My Account"
            description="Keep your personal details and relationship profile up to date"
            showBack
          />

          <div className="mx-auto mb-6 flex w-full rounded-lg bg-secondary p-1">
            {(["personal", "relationship"] as AccountTab[])?.map((tab) => (
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
                <div className="relative rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative shrink-0 self-center sm:self-auto">
                      <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary/15 bg-primary/10 shadow-sm">
                        {displayImage ? (
                          <Image
                            src={displayImage}
                            alt="Profile"
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-primary">
                            {(user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")}
                          </div>
                        )}
                      </div>
                      {displayImage && !isUploadingImage && (
                        <button
                          type="button"
                          onClick={removeImage}
                          aria-label="Remove profile image"
                          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-destructive text-destructive-foreground shadow-sm transition hover:scale-105"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <p className="text-sm font-semibold text-foreground">
                        Add a profile image <span className="font-normal text-muted-foreground">(optional)</span>
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        JPG, JPEG, or PNG up to 5MB.
                      </p>
                      <label
                        htmlFor="profile-image-input"
                        className={`mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 ${isUploadingImage ? "pointer-events-none opacity-60" : ""}`}
                      >
                        <ImagePlus className="h-4 w-4" />
                        {isUploadingImage ? "Uploading…" : displayImage ? "Change image" : "Choose image"}
                      </label>
                      <input
                        id="profile-image-input"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageChange}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </div>
                  </div>
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
                    formClassName="mt-1 h-11 rounded-[10px] border-input"
                    placeholder="Select country"
                    onSelect={(option) => {
                      const country = countryOptions?.find(
                        (item) => item?.value === option?.value,
                      );
                      if (country) {
                        personalForm.setValue("phoneCountry", country?.value, {
                          shouldValidate: true,
                        });
                        personalForm.setValue("phoneDialingCode", country?.dialCode, {
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
                        const selectedCountry = countryOptions?.find(
                          (country) => country?.key === option?.key,
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
                      {selectedLanguages?.length}/3
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {languages
                      ?.slice()
                      ?.sort(
                        (first: any, second: any) =>
                          Number(isNotSureLanguage(first)) -
                          Number(isNotSureLanguage(second)),
                      )
                      ?.map((language: ILoveLanguage) => {
                        const selected = selectedLanguages?.includes(language?.id);
                        return (
                          <button
                            key={language?.id}
                            type="button"
                            onClick={() => toggleLanguage(language?.id)}
                            aria-pressed={selected}
                            className={`relative flex gap-3 rounded-2xl border p-4 text-left transition-colors ${selected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background hover:border-primary/40"
                              }`}
                          >
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                              {language?.icon || <Heart className="h-5 w-5" />}
                            </span>
                            <span className="min-w-0 pr-5">
                              <span className="block text-sm font-semibold">{language?.title}</span>
                              {language?.description && (
                                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                  {language?.description}
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
                      {relationshipForm.formState.errors.loveLanguages?.message}
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








