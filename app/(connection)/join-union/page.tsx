"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Key, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import AuthLayout from "@/components/auth/auth-layout";
import { RegistrationStepIndicator } from "@/components/auth/registration-step-indicator";
import RouteGuard from "@/components/auth/route-guard";
import { Popup } from "@/components/common/popup";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";
import { API_BASE_URL, APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import { joinUnionSchema, type JoinUnionFormValues } from "@/utils/schema";

function JoinUnionContent() {
  const router = useRouter();
  const { user_data } = usePosterReducers();
  const { isConnected, lastEvent, sendMessage } = useWebSocket();
  const [mode, setMode] = useState<"send" | "info">("info");
  const [confirmation, setConfirmation] = useState<"send" | "cancel" | "notPartner" | null>(null);
  const form = useForm<JoinUnionFormValues>({
    resolver: zodResolver(joinUnionSchema),
    defaultValues: { unionCode: "" },
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = form;

  const currentUser = user_data?.user;
  const relationship = currentUser?.relationship;
  const partner = relationship?.partner;
  const partnerName = partner
    ? `${partner.firstName ?? ""} ${partner.lastName ?? ""}`.trim()
    : "";
  const partnerInitial = partnerName
    ? partnerName.charAt(0).toUpperCase()
    : "?";
  const unionCode = relationship?.unionCode ?? "";
  const unionCodeDigits = unionCode.replace(/^UNION-/, "");

  const sendRequest = () => {
    setMode("send");
    sendMessage("action", {
      type: "userService",
      action: "sendRequest",
      payload: { unionCode: unionCode },
    });
  };

  const cancelRequest = () => {
    sendMessage("action", {
      type: "userService",
      action: "cancelConnection",
      payload: { unionCode: unionCode },
    });
  };

  useEffect(() => {
    if (
      lastEvent?.data?.status &&
      lastEvent?.data?.request?.type === "userService"
    ) {
      if (lastEvent?.data?.request?.action === "cancelConnection") {
        router.push(APP_URL.LINKS.CREATE_UNION);
      }
      if (lastEvent?.data?.request?.action === "sendRequest") {
        sendMessage("action", { type: "userService", action: "get", payload: {} });
      }
    }
    if (lastEvent?.event === "accept_request") {
      router.push(APP_URL.LINKS.CONNECTED)
    }
  }, [lastEvent]);

  return (
    <RouteGuard>
      <AuthLayout>
        <div className="h-full overflow-y-auto scrollbar-hidden">
          <div className="mx-auto w-full max-w-[600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <header className="mb-7 text-center">
              <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
                Join Union
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Verify partner details
              </p>
            </header>
            <RegistrationStepIndicator
              currentStep={3}
              className="mb-8 w-full max-w-[600px]"
            />
            <div className="mx-auto max-w-[600px] space-y-4">
              <section className="rounded-2xl border border-border/70 bg-surface p-5 text-center shadow-sm sm:p-6">
                <InputField
                  name="unionCode"
                  label="Partner's Relationship Code"
                  value={unionCodeDigits}
                  disabled
                  autoComplete="off"
                  labelClassName="auth-field-label"
                  inputClassName="auth-input tracking-[0.18em] pl-[120px]"
                  leftAdornment={
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      <span className="font-medium tracking-[0.18em]">
                        UNION-
                      </span>
                    </div>
                  }
                />
                {user_data?.user?.onboardingStep === "connectionRequestSent" ? (
                  <>
                    <div className="space-y-5">
                      <div className="mt-5 rounded-2xl border border-border/60 p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-xl font-medium text-primary">
                            {partner?.profileImage ? (
                              <Image
                                width={48}
                                height={48}
                                src={API_BASE_URL + partner.profileImage}
                                alt={partnerName}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              partnerInitial
                            )}
                          </div>
                          <h2 className="mt-5 text-sm font-semibold text-foreground">
                            Partner Profile Found!
                          </h2>
                          <p className="text-[13px] text-muted-foreground">
                            {partnerName}
                            {partner?.email ? ` (${partner.email})` : ""}
                          </p>
                        </div>
                      </div>
                      <section className="rounded-2xl border border-primary/25 bg-primary/10 p-5 shadow-sm sm:p-6">
                        <div className="flex items-start gap-3">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center text-primary">
                            <RefreshCw
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="text-base font-medium text-primary">
                            Awaiting Partner...
                          </p>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-justify leading-[1.45] text-muted-foreground">
                            Waiting for Your Partner <br /> Your connection request has been sent to your partner. Once they accept your request, your Union will be established and you can start using the app together.
                          </p>
                        </div>
                        <Button
                          type="button"
                          className="auth-submit !mt-5"
                          disabled={true}
                        >
                          Let&apos;s Start
                        </Button>

                      </section>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full rounded-lg shadow-sm"
                            onClick={() => setConfirmation("cancel")}
                      >
                        Cancel Connection
                      </Button></div>
                  </>
                ) : (
                  <>
                    <div className="mt-4 rounded-2xl border border-border/60 p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-xl font-medium text-primary">
                          {partner?.profileImage ? (
                            <Image
                              width={48}
                              height={48}
                              src={API_BASE_URL + partner.profileImage}
                              alt={partnerName}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            partnerInitial
                          )}
                        </div>
                        <h2 className="mt-5 text-sm font-semibold text-foreground">
                          Partner Profile Found!
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {partnerName}
                          {partner?.email ? ` (${partner.email})` : ""}
                        </p>
                        <div className="space-y-4 mt-3">
                          <Button
                            type="button"
                            className="auth-submit"
                            onClick={() => setConfirmation("send")}
                          >
                            Send Connection Request
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            className="!h-11 w-full rounded-lg shadow-sm"
                            onClick={() => setConfirmation("notPartner")}
                          >
                            No, This Is Not My Partner
                          </Button>
                        </div>
                      </div>
                    </div></>
                )}
              </section>
            </div>
          </div>
        </div >
        <Popup
          open={confirmation !== null}
          onOpenChange={(open) => !open && setConfirmation(null)}
          variant={confirmation === "send" ? "info" : "warning"}
          title={
            confirmation === "send"
              ? "Send connection request?"
              : confirmation === "cancel"
                ? "Cancel connection request?"
                : "This is not my partner?"
          }
          description={
            confirmation === "send"
              ? `Send a request to ${partnerName || "this partner"}? They will need to accept before your accounts are connected.`
              : confirmation === "cancel"
                ? "This will cancel your pending connection request. You can join again later with a Union Code."
                : "You will leave this partner match and return to the Union connection setup."
          }
          confirmText={
            confirmation === "send"
              ? "Yes, send request"
              : confirmation === "cancel"
                ? "Yes, cancel request"
                : "Yes, continue"
          }
          onConfirm={() => {
            if (confirmation === "send") sendRequest();
            if (confirmation === "cancel") cancelRequest();
            if (confirmation === "notPartner") router.push(APP_URL.LINKS.CREATE_UNION);
            setConfirmation(null);
          }}
        />
      </AuthLayout >
    </RouteGuard >
  );
}

export default JoinUnionContent;
