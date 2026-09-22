"use client";

import {
  CheckCircle2,
  HeartHandshake,
  LockKeyhole,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

import { AccountPageHeader } from "@/components/account/account-ui";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Popup } from "@/components/common/popup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import {
  initialAccountState,
  setAccountLoading,
  setAccountSaving,
} from "@/redux/modules/account";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import { formatDateDDMMYYYY } from "@/utils/common";
import { ILoveLanguage } from "@/redux/modules/main/types";
import { API_BASE_URL } from "@/constant/static";

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="grid grid-cols-[minmax(8.5rem,1fr)_minmax(0,1.7fr)] gap-4 text-sm sm:grid-cols-[11.5rem_minmax(0,1fr)]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-foreground">
        {value === undefined || value === null || value === "" ? "—" : value}
      </dd>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full rounded-3xl border-border/70 bg-surface p-6 shadow-sm sm:p-7">
      <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </Card>
  );
}

export default function ConnectedPartnerPage() {
  const dispatch = useAppDispatch();
  const { user_data, account } = usePosterReducers();
  const { isConnected, sendMessage } = useWebSocket();
  const accountState = account ?? initialAccountState;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const relationship = user_data?.user?.relationships?.[0];
  const partner = accountState.partner ?? relationship?.partner;

  useEffect(() => {
    if (!isConnected) return;

    dispatch(setAccountLoading(true));
    sendMessage("action", {
      type: "userService",
      action: "get",
      payload: {},
    });
  }, [dispatch, isConnected, sendMessage]);

  const deleteConnection = () => {
    if (!isConnected || !relationship?.unionCode) {
      toast.error("No active connection was found.");
      return;
    }

    dispatch(setAccountSaving(true));
    sendMessage("action", {
      type: "userService",
      action: "deleteConnection",
      payload: { unionCode: relationship.unionCode },
    });
    setConfirmOpen(false);
  };

  const partnerName = `${partner?.firstName ?? ""} ${partner?.lastName ?? ""}`.trim();
  const initials = partnerName
    .split(" ")
    .map((name) => name[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const loveLanguages = partner?.loveLanguages ?? [];
  const phoneNumber = partner?.mobileNumber
    ? `${partner.phoneDialingCode ?? ""}${partner.mobileNumber}`
    : undefined;
  const hasChildren = Boolean(relationship?.children);
  const relationType = relationship?.relationStatus?.title;

  const relationshipSummary = useMemo(
    () => partner?.summary?.trim() || "—",
    [partner?.summary],
  );

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto">
          <AccountPageHeader
            title="Connected Partner"
            description="View the details of your connected partner and relationship."
            showBack
          />

          {accountState.loading && !partner ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2" aria-busy="true">
              {["hero", "personal", "relationship", "status", "union"].map(
                (section) => (
                  <div
                    key={section}
                    className="h-56 animate-pulse rounded-3xl bg-muted"
                  />
                ),
              )}
            </div>
          ) : !partner ? (
            <Card className="rounded-3xl border-border/70 bg-surface p-10 text-center shadow-sm">
              <HeartHandshake className="mx-auto h-10 w-10 text-primary/50" />
              <h2 className="mt-4 text-lg font-extrabold">
                No connected partner
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect with your partner to share check-ins and insights.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1.35fr_1fr]">
              <Card className="h-full rounded-3xl border-border/70 bg-surface px-6 py-7 shadow-sm sm:px-8 lg:col-span-2">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
                  <div className="flex h-20 w-20 items-center overflow-hidden rounded-full justify-center bg-primary/10 text-3xl font-semibold text-primary">
                    {partner?.profileImage ? (
                      <Image
                        width={80}
                        height={80}
                        src={API_BASE_URL + partner.profileImage}
                        alt={partnerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials || "P"
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Connected partner
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight">
                      {partnerName || "Connected partner"}
                    </h2>

                    <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2
                        className="h-4 w-4 fill-emerald-500 text-white"
                        strokeWidth={2}
                      />
                      <span>Connected</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div>
                <SectionCard title="Personal Information">
                  <dl className="space-y-4">
                    <InfoRow label="First Name" value={partnerName} />
                    <InfoRow label="Email Address" value={partner.email} />
                    <InfoRow label="Gender" value={partner.gender} />
                    <InfoRow label="DOB" value={formatDateDDMMYYYY(partner.dob)} />
                    <InfoRow label="Country" value={partner.country} />
                    <InfoRow label="Phone Number" value={phoneNumber} />
                  </dl>
                </SectionCard>
              </div>

              <div>
                <SectionCard title="Relationship Status">
                  <dl className="space-y-4">
                    <InfoRow label="Relation Type" value={relationType} />
                    <InfoRow label="Relationship date" value={formatDateDDMMYYYY(relationship?.date)} />
                    <InfoRow label="Children" value={hasChildren ? relationship?.children : "-"} />
                  </dl>
                </SectionCard>
              </div>

              <div>
                <SectionCard title="Relationship Details">
                  <div className="space-y-5 text-sm">
                    <div>
                      <p className="mb-2 text-muted-foreground">Summary</p>
                      <p className="font-medium leading-7">{relationshipSummary}</p>
                    </div>
                    <div>
                      <p className="mb-3 text-muted-foreground">Love Languages</p>
                      <div className="flex flex-wrap gap-3">
                        {loveLanguages.length ? (
                          loveLanguages.map((language: ILoveLanguage) => (
                            <span
                              key={language.id ?? language.title}
                              className="rounded-full border-2 border-primary/70 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
                            >
                              {language.icon ? `${language.icon} ` : ""}
                              {language.title}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>

              <div>
                <Card className="flex h-full flex-col justify-center gap-7 rounded-3xl border-border/70 bg-surface p-6 text-center shadow-sm sm:p-8">
                  {/* Header */}
                  <div className="relative flex min-h-[48px] items-center justify-center">
                    <LockKeyhole className="absolute left-0 h-5 w-5 text-primary" />

                    <h2 className="max-w-[180px] text-sm font-medium uppercase leading-5 tracking-wide text-foreground">
                      Your Union Code
                      <br />
                      Connection
                    </h2>
                  </div>

                  {/* Union Code */}
                  <p className="break-words text-[24px] font-bold leading-8 tracking-wide text-foreground">
                    {relationship?.unionCode || "—"}
                  </p>

                  {/* Delete Connection */}
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-lg border-destructive/30 bg-destructive/10 text-sm font-semibold text-destructive hover:bg-destructive/15 hover:text-destructive"
                    onClick={() => setConfirmOpen(true)}
                    disabled={accountState.saving}
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
                    Delete connection
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Popup
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="danger"
        title="Are you sure you want to delete this connection?"
        description={
          <div className="space-y-4 text-left">
            <p>Deleting this connection will:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Terminate your union relationship immediately with your partner
              </li>
              <li>
                Cancel your subscription at the end of the current billing period
                (no new renewal)
              </li>
              <li>
                No refund will be issued for the remaining billing period
              </li>
              <li>
                Both you and your partner will lose access to relationship scores
              </li>
              <li>
                Your subscription will not transfer to any new connection
              </li>
              <li>
                You will need a new subscription for any future relationship
              </li>
            </ul>
            <p>This action cannot be undone.</p>
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={deleteConnection}
      />
    </DashboardLayout>
  );
}
