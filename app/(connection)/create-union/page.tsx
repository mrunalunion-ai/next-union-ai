"use client";

import AuthLayout from "@/components/auth/auth-layout";
import { RegistrationStepIndicator } from "@/components/auth/registration-step-indicator";
import RouteGuard from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/datePicker";
import DropdownSelect from "@/components/ui/dropdown";
import InputField from "@/components/ui/InputField";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import {
  createUnionSchema,
  joinUnionSchema,
  type CreateUnionFormValues,
  type JoinUnionFormValues,
} from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key, UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

function CreateUnionContent() {
  const router = useRouter();
  const { mainReducer, user_data } = usePosterReducers();
  const { isConnected, lastEvent, sendMessage } = useWebSocket();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [joinState, setJoinState] = useState<"initial" | "verified">("initial");
  const [partner, setPartner] = useState({ name: "", email: "" });
  const pendingAction = useRef<
    | "create"
    | "joinVerify"
    | "partnerVerified"
    | null
  >(null);
  const form = useForm<CreateUnionFormValues>({
    resolver: zodResolver(createUnionSchema),
    defaultValues: {
      relationStatusId: "",
      date: "",
      hasChildren: false,
      children: "",
    },
    mode: "onChange",
  });
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = form;
  const hasChildren = useWatch({ control, name: "hasChildren" });
  const joinForm = useForm<JoinUnionFormValues>({
    resolver: zodResolver(joinUnionSchema),
    defaultValues: { unionCode: "" },
    mode: "onChange",
  });
  const {
    register: registerJoin,
    handleSubmit: handleJoinSubmit,
    watch: watchJoin,
    formState: {
      errors: joinErrors,
      isValid: isJoinValid,
      isSubmitting: isJoinSubmitting,
    },
  } = joinForm;
  const joinCodeDigits = watchJoin("unionCode");
  const fullJoinCode = `UNION-${joinCodeDigits ?? ""}`;

  useEffect(() => {
    if (!isConnected) return;
    sendMessage("action", {
      type: "relationStatusService",
      action: "list",
      payload: { page: 1, limit: 10, search: "", active: true },
    });
    sendMessage("action", { type: "userService", action: "get", payload: {} });
  }, [isConnected]);

  const onSubmit = (values: CreateUnionFormValues) => {
    pendingAction.current = "create";
    sendMessage("action", {
      type: "userService",
      action: "createUnion",
      payload: {
        relationStatusId: values.relationStatusId,
        date: values.date,
        children: values.hasChildren ? Number(values.children) : 0,
      },
    });
  };

  const verifyJoinCode = () => {
    pendingAction.current = "joinVerify";
    sendMessage("action", {
      type: "userService",
      action: "get",
      payload: { unionCode: fullJoinCode },
    });
  };

  useEffect(() => {
    if (
      lastEvent?.data?.status &&
      lastEvent?.data?.request?.type === "userService"
    ) {
      if (lastEvent?.data?.request?.action === "createUnion") {
        router.push(APP_URL.LINKS.CODE_CREATED);
      } else if (mode === 'join' && lastEvent?.data?.request?.action === "get") {
        router.push(APP_URL.LINKS.JOIN_UNION);
      }
    }
  }, [lastEvent]);


  const continueToJoinUnion = () => {
    // pendingAction.current = "partnerVerified";
    // sendMessage("action", {
    //   type: "userService",
    //   action: "update",
    //   payload: {
    //     id: user_data?.user?.id,
    //     onboardingStep: "partnerVerified",
    //   },
    // });
  };

  return (
    <RouteGuard>
      <AuthLayout>
        <div className="h-full overflow-y-auto scrollbar-hidden">
          <div className="mx-auto w-full max-w-[900px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <header className="mb-7 text-center">
              <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
                Union Connection
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {mode === 'create' ? `Select Create Union if you are the first person in your relationship to create an account on the Union app. A unique Union Code will be generated for you to share with your partner.` : `Select Join Union if your partner has already created a Union Code. Enter the code to connect your accounts.`}
              </p>
            </header>
            <RegistrationStepIndicator
              currentStep={3}
              className="mb-8 w-full max-w-[600px]"
            />
            <div className="mx-auto mb-6 flex w-full rounded-lg bg-secondary p-1">
              <button
                type="button"
                onClick={() => setMode("create")}
                className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${mode === "create" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                aria-pressed={mode === "create"}
              >
                Create Union
              </button>
              <button
                type="button"
                onClick={() => setMode("join")}
                className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${mode === "join" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                aria-pressed={mode === "join"}
              >
                Join Union
              </button>
            </div>
            {mode === "create" ? (
              <div className="mx-auto rounded-2xl border border-border/60 bg-surface p-5 shadow-sm sm:p-8">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                  noValidate
                >
                  <DropdownSelect
                    label="Relationship Type"
                    name="relationStatusId"
                    control={control}
                    options={
                      mainReducer?.relationStatusList?.data?.map((item: any) => ({
                        value: item.id,
                        label: item.title,
                        key: item.id,
                      })) || []
                    }
                    required
                    placeholder={
                      "Select relationship type"
                    }
                    labelClassName="auth-field-label"
                    formClassName="mt-1 h-11 rounded-[10px] border-input"
                  />
                  {errors.relationStatusId?.message && (
                    <p className="-mt-4 text-sm text-destructive">
                      {errors.relationStatusId.message}
                    </p>
                  )}
                  <DatePicker<CreateUnionFormValues>
                    name="date"
                    control={control}
                    label="Relationship Anniversary / Start Date"
                    error={errors.date?.message}
                    required
                    labelClassName="auth-field-label"
                    inputClassName="auth-input"
                    format="YYYY-MM-DD"
                    maxDate={new Date()}
                  />
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          Do you have children?
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          This helps personalize your relationship experience.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setValue("hasChildren", true, {
                              shouldValidate: true,
                            });
                            setValue("children", "1", { shouldValidate: true });
                          }}
                          className={`rounded-lg border px-5 py-2 text-sm font-semibold ${hasChildren ? "border-primary bg-primary text-white" : "border-border bg-surface"}`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setValue("hasChildren", false, {
                              shouldValidate: true,
                            });
                            setValue("children", "", { shouldValidate: true });
                          }}
                          className={`rounded-lg border px-5 py-2 text-sm font-semibold ${!hasChildren ? "border-primary bg-primary text-white" : "border-border bg-surface"}`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    {hasChildren && (
                      <div className="mt-4">
                        <InputField<CreateUnionFormValues>
                          name="children"
                          label="Number of Children"
                          type="number"
                          maxLength={2}
                          register={register}
                          error={errors.children?.message}
                          required
                          labelClassName="auth-field-label"
                          inputClassName="auth-input"
                          leftAdornment={<Users className="h-5 w-5" />}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="auth-submit"
                    disabled={!isValid || isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Union Code"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="mx-auto rounded-2xl border border-border/60 bg-surface p-5 shadow-sm sm:p-8">
                <form
                  onSubmit={handleJoinSubmit(verifyJoinCode)}
                  className="space-y-6"
                  noValidate
                >
                  <InputField<JoinUnionFormValues>
                    name="unionCode"
                    label="Enter Partner's Relationship Code"
                    placeholder="123456"
                    register={registerJoin}
                    error={joinErrors.unionCode?.message}
                    required
                    autoComplete="off"
                    labelClassName="auth-field-label"
                    inputClassName="auth-input tracking-[0.18em] pl-[120px]"
                    leftAdornment={
                      <div className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        <span className="font-medium tracking-[0.18em]">UNION-</span>
                      </div>
                    }
                  />
                  <Button
                    type="submit"
                    className="auth-submit"
                    disabled={
                      !isJoinValid || isJoinSubmitting || !isConnected
                    }
                  >
                    {isJoinSubmitting ? "Verifying..." : "Verify Code"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </AuthLayout>
    </RouteGuard>
  );
}

export default CreateUnionContent;
