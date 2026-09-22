"use client";

import { ArrowLeft, Check, ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type ChangeEvent } from "react";
import { toast } from "react-toastify";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import {
  setCheckinPartnerMessage,
  setCheckinSubmitting,
} from "@/redux/modules/checkin";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import InputField from "@/components/ui/InputField";

function parseMessage(rawMessage: unknown): Record<string, any> | null {
  if (!rawMessage) return null;

  if (typeof rawMessage === "string") {
    try {
      return JSON.parse(rawMessage) as Record<string, any>;
    } catch {
      return null;
    }
  }

  return typeof rawMessage === "object"
    ? (rawMessage as Record<string, any>)
    : null;
}

export default function CheckInCompletedPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { checkin } = usePosterReducers();
  const { isConnected, lastEvent, sendMessage } = useWebSocket();
  const submitted = useRef(false);

  useEffect(() => {
    const message = parseMessage(lastEvent?.data);
    const request = message?.request ?? message;

    if (
      !submitted.current ||
      request?.type !== "checkinService" ||
      request?.action !== "submit" ||
      request?.payload?.finalSubmit !== true
    ) {
      return;
    }

    dispatch(setCheckinSubmitting(false));

    if (message?.status === false) {
      submitted.current = false;
      toast.error(message.msg ?? "Could not submit your check-in.");
      return;
    }

    router.push(`${APP_URL.LINKS.DASHBOARD}?checkin=submitted`);
  }, [dispatch, lastEvent, router]);

  const submit = () => {
    if (
      !isConnected ||
      submitted.current ||
      !checkin.relationshipId ||
      checkin.questions.length === 0
    ) {
      return;
    }

    submitted.current = true;
    dispatch(setCheckinSubmitting(true));

    sendMessage("action", {
      type: "checkinService",
      action: "submit",
      payload: {
        relationshipId: checkin.relationshipId,
        answers: checkin.questions.map((question, index) => {
          const answer = checkin.answers[index];

          return {
            ...(answer?.id ? { id: answer.id } : {}),
            questionId: question.questionId,
            score: answer?.score,
            ...(answer?.comment?.trim()
              ? { comment: answer.comment.trim() }
              : {}),
          };
        }),
        ...(checkin.partnerMessage.trim()
          ? { message: checkin.partnerMessage.trim() }
          : {}),
        finalSubmit: true,
      },
    });
  };

  return (
    <DashboardLayout>
      <main className="min-h-[calc(100vh-4rem)] bg-background px-10 py-6 text-foreground">
        <div className="mx-auto">
          <header className="mb-8">
            <h1 className="text-xl font-extrabold tracking-tight">
              Check-in completed
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review your responses before submitting.
            </p>
          </header>
          <Card className="mt-5 overflow-hidden rounded-xl border-border/70 bg-surface">
            <div className="max-h-[360px] overflow-y-auto">
              {checkin.questions.map((question, index) => (
                <div
                  key={question.questionId}
                  className="flex items-center gap-4 border-b border-border/70 px-5 py-4 last:border-0"
                >
                  <p className="flex-1 text-sm font-bold">
                    {question.title}
                  </p>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">
                    {checkin.answers[index]?.score ?? "–"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-6">
            <InputField<any>
              name="partner-message"
              label="Add a message for your partner"
              useFor="textarea"
              rows={5}
              placeholder="Anything else you want to share this week…"
              value={checkin.partnerMessage}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                dispatch(setCheckinPartnerMessage(event.target.value))
              }
              labelClassName="auth-field-label"
              inputClassName="auth-input"
            />
          </div>

          <div className="flex gap-5 mt-5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push(APP_URL.LINKS.WEEKLY_CHECK_IN)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Edit answers
            </Button>
            <Button
              className="submit flex-1"
              disabled={
                !isConnected ||
                checkin.submitting ||
                checkin.questions.length === 0
              }
              onClick={submit}
            >
              {checkin.submitting ? (
                "Submitting…"
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit answers
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
