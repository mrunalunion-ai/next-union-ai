"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Check, Heart, ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";

import AuthLayout from "@/components/auth/auth-layout";
import { RegistrationStepIndicator } from "@/components/auth/registration-step-indicator";
import RouteGuard from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";
import { API_BASE_URL, APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { ILoveLanguage } from "@/redux/modules/main/types";
import { postData } from "@/services/rest/fetchData";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import {
  relationshipDetailsSchema,
  type RelationshipDetailsFormValues,
} from "@/utils/schema";
import { toast } from "react-toastify";

function isNotSureLanguage(language: Pick<ILoveLanguage, "id" | "title">) {
  return (
    language.id.toLowerCase().includes("not-sure") ||
    language.title.toLowerCase().includes("not sure")
  );
}

export default function RelationshipDetailsContent() {
  const router = useRouter();
  const currentStep = 2;
  const { user_data, mainReducer } = usePosterReducers();
  const { isConnected, lastEvent, sendMessage } = useWebSocket();
  const [isFetching, setIsFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const pendingUpdate = useRef(false);
  const form = useForm<RelationshipDetailsFormValues>({
    resolver: zodResolver(relationshipDetailsSchema),
    defaultValues: { summary: "", loveLanguages: [], profileImage: "" },
    mode: "onChange",
  });
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = form;
  const watchedLanguages = useWatch({ control, name: "loveLanguages" });
  const selectedLanguages = Array.isArray(watchedLanguages)
    ? watchedLanguages
    : [];
  const currentUser = user_data?.user;

  const resolveImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return null;
    return /^(https?:|blob:|data:)/i.test(imageUrl)
      ? imageUrl
      : `${API_BASE_URL}${imageUrl}`;
  };

  const displayImage =
    resolveImageUrl(uploadedImageUrl) ||
    imagePreview ||
    resolveImageUrl(currentUser?.profileImage);

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    const token = user_data?.access_token;
    if (!token) {
      toast.error("Authentication required");
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const response = await postData(
        APP_URL.ENDPOINT_URL.UPLOAD_FILE,
        formData,
        token,
        "multipart/form-data",
      );
      const responseData = response?.data as any;

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

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
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
    setValue("profileImage", uploadedUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success("Profile image uploaded");
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setUploadedImageUrl(null);
    setImagePreview(null);
    setValue("profileImage", "", { shouldDirty: true, shouldValidate: true });
  };

  useEffect(() => {
    if (!isConnected) return;
    sendMessage("action", { type: "userService", action: "get", payload: {} });
    sendMessage("action", {
      type: "loveLanguageService",
      action: "list",
      payload: { page: 1, limit: 10, search: "", active: true },
    });
  }, [isConnected]);

  useEffect(() => {
    const data = user_data?.user ?? {};
    if (data && typeof data === "object") {
      const selected = Array.isArray(data.loveLanguages)
        ? data?.loveLanguages?.map((item: any) =>
          String(item.id ?? item._id ?? item),
        )
        : [];
      const selectedNotSure = selected.find((item: string) =>
        item.toLowerCase().includes("not-sure"),
      );
      reset({
        summary: String(data.summary ?? ""),
        loveLanguages: selectedNotSure ? [selectedNotSure] : selected,
        profileImage: String(data.profileImage ?? ""),
      });
      setUploadedImageUrl(data.profileImage ?? null);
    }
    setIsFetching(false);
  }, [isConnected, reset, user_data?.user]);

  const toggleLanguage = (id: string) => {
    const languages = Array.isArray(mainReducer?.loveLanguageList?.data)
      ? mainReducer.loveLanguageList.data
      : [];

    const selectedLanguage = languages.find(
      (language: ILoveLanguage) => language.id === id,
    );

    if (!selectedLanguage) return;

    const isNotSure = isNotSureLanguage(selectedLanguage);
    const isAlreadySelected = selectedLanguages.includes(id);
    if (isAlreadySelected) {
      setValue(
        "loveLanguages",
        selectedLanguages.filter((item) => item !== id),
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
      return;
    }
    if (isNotSure) {
      setValue("loveLanguages", [id], {
        shouldDirty: true,
        shouldValidate: true,
      });

      return;
    }
    const withoutNotSure = selectedLanguages.filter(
      (item) =>
        !languages.some(
          (language: ILoveLanguage) =>
            language.id === item && isNotSureLanguage(language),
        ),
    );
    if (withoutNotSure.length >= 3) {
      toast.error("You can select up to 3 love languages.");
      return;
    }
    setValue("loveLanguages", [...withoutNotSure, id], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = (values: RelationshipDetailsFormValues) => {
    pendingUpdate.current = true;
    sendMessage("action", {
      type: "userService",
      action: "update",
      payload: {
        id: user_data?.user?.id,
        summary: values.summary.trim(),
        loveLanguages: values.loveLanguages,
        profileImage: values.profileImage || "",
        onboardingStep: "relationshipDetailsCompleted",
      },
    });
  };

  useEffect(() => {
    if (
      lastEvent?.data?.status &&
      lastEvent?.data?.request?.type === "userService" &&
      lastEvent?.data?.request?.action === "update" &&
      lastEvent?.data?.data?.onboardingStep === "relationshipDetailsCompleted"
    ) {
      router.push(APP_URL.LINKS.CREATE_UNION);
    }
  }, [lastEvent]);

  return (
    <RouteGuard>
      <AuthLayout>
        <div className="h-full overflow-y-auto scrollbar-hidden">
          <div className="mx-auto w-full max-w-[900px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <header className="mb-7 text-center">
              <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
                Relationship Details
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Tell us what makes your relationship unique.
              </p>
            </header>
            <RegistrationStepIndicator
              currentStep={currentStep}
              className="mb-8 w-full max-w-[600px]"
            />

            <div className="mx-auto rounded-2xl border border-border/60 bg-surface p-5 shadow-sm sm:p-8">
              {isFetching ? (
                <div className="space-y-4" aria-busy="true">
                  <div className="h-24 animate-pulse rounded-xl bg-secondary" />
                  <div className="h-28 animate-pulse rounded-xl bg-secondary" />
                  <div className="h-28 animate-pulse rounded-xl bg-secondary" />
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-7"
                  noValidate
                >
                  <div className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-4 sm:p-5">
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
                              {(currentUser?.firstName?.[0] || "") +
                                (currentUser?.lastName?.[0] || "")}
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
                  <InputField<RelationshipDetailsFormValues>
                    name="summary"
                    label="Provide a Short Summary of Your Relationship"
                    required
                    useFor="textarea"
                    rows={4}
                    placeholder="Tell us a bit about yourself..."
                    register={register}
                    error={errors.summary?.message}
                    labelClassName="auth-field-label"
                    inputClassName="auth-input"
                  />
                  <input type="hidden" {...register("loveLanguages")} />
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h2 className="auth-field-label">
                        Love Language
                        <span className="ml-1 text-red-500">*</span>
                      </h2>
                    </div>

                    <p className="mb-4 text-sm text-muted-foreground">
                      Choose from one to three:
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                      {[
                        ...(Array.isArray(mainReducer?.loveLanguageList?.data)
                          ? mainReducer.loveLanguageList.data
                          : []),
                      ]
                        .sort(
                          (a: ILoveLanguage, b: ILoveLanguage) =>
                            Number(isNotSureLanguage(a)) -
                            Number(isNotSureLanguage(b)),
                        )
                        .map((language: ILoveLanguage) => {
                          const isSelected = selectedLanguages.includes(
                            language.id,
                          );

                          return (
                            <button
                              key={language.id}
                              type="button"
                              onClick={() => toggleLanguage(language.id)}
                              aria-pressed={isSelected}
                              className={`
              group relative flex min-w-0 gap-3 rounded-xl border
              p-4 text-left transition-all duration-200
              hover:-translate-y-0.5
              ${isSelected
                                  ? `
                    border-primary
                    bg-primary/10
                    shadow-[0_10px_22px_rgb(124_58_237_/_0.10)]
                  `
                                  : `
                    border-border
                    bg-card
                    hover:border-primary/30
                    hover:bg-secondary/30
                  `
                                }
            `}
                            >
                              {/* Selected Check */}
                              {isSelected && (
                                <span
                                  className="
                  absolute right-3 top-3
                  flex h-5 w-5 items-center justify-center
                  rounded-full
                  bg-primary
                  text-primary-foreground
                "
                                >
                                  <Check
                                    className="h-3.5 w-3.5"
                                    strokeWidth={3}
                                  />
                                </span>
                              )}

                              {/* Language Icon */}
                              <div
                                className={`
                flex h-11 w-11 shrink-0 items-center justify-center
                rounded-xl text-xl
                transition-all duration-200

                ${isSelected
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-primary/10 text-foreground group-hover:scale-105 group-hover:bg-primary/15"
                                  }
              `}
                              >
                                {language.icon || (
                                  <Heart
                                    size={20}
                                    className={
                                      isSelected
                                        ? "text-primary-foreground"
                                        : "text-primary"
                                    }
                                  />
                                )}
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1 pr-5">
                                <h4
                                  className={`
                  text-sm font-semibold
                  ${isSelected ? "text-primary" : "text-foreground"}
                `}
                                >
                                  {language.title}
                                </h4>

                                {language.description && (
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                    {language.description}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>

                    {errors.loveLanguages?.message && (
                      <p className="mt-2 text-sm text-destructive">
                        {errors.loveLanguages.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="auth-submit"
                    disabled={!isValid || isSubmitting || isUploadingImage}
                  >
                    {isSubmitting ? "Saving..." : "Continue"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </AuthLayout>
    </RouteGuard>
  );
}
