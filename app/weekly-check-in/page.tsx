"use client";

import { ArrowLeft, ArrowRight, MessageCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type ChangeEvent } from "react";
import { toast } from "react-toastify";

import RouteGuard from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { useAppDispatch } from "@/redux/hooks";
import {
  setCheckinAnswer,
  setCheckinCurrentQuestion,
  setCheckinLoading,
  setCheckinSubmitting,
} from "@/redux/modules/checkin";
import { useWebSocket } from "@/services/socket/WebSocketContext";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
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

function isCheckinResponse(
  message: Record<string, any> | null,
  action: string,
) {
  const request = message?.request ?? message;

  return request?.type === "checkinService" && request?.action === action;
}

export default function WeeklyCheckInPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user_data, checkin } = usePosterReducers();
  const { isConnected, lastEvent, sendMessage } = useWebSocket();
  const pendingAction = useRef<"next" | "review" | null>(null);

  const relationshipId = user_data?.user?.relationships?.[0]?.id ?? "";
  const question = checkin.questions[checkin.currentQuestion];
  const answer = checkin.answers[checkin.currentQuestion];

  useEffect(() => {
    if (!relationshipId || !isConnected || checkin.questions.length > 0) {
      return;
    }
    dispatch(setCheckinLoading(true));
    sendMessage("action", {
      type: "checkinService",
      action: "list",
      payload: { relationshipId },
    });
  }, [
    checkin.questions.length,
    dispatch,
    isConnected,
    relationshipId,
    sendMessage,
  ]);

  useEffect(() => {
    const message = parseMessage(lastEvent?.data);

    if (!isCheckinResponse(message, "submit")) return;

    dispatch(setCheckinSubmitting(false));

    if (message?.status === false) {
      pendingAction.current = null;
      toast.error(
        message.msg ?? message.message ?? "Could not save this answer.",
      );
      return;
    }

    if (pendingAction.current === "review") {
      pendingAction.current = null;
      router.push(APP_URL.LINKS.CHECK_IN_COMPLETED);
      return;
    }

    if (pendingAction.current === "next") {
      pendingAction.current = null;
      dispatch(
        setCheckinCurrentQuestion(
          Math.min(
            checkin.currentQuestion + 1,
            checkin.questions.length - 1,
          ),
        ),
      );
    }
  }, [
    checkin.currentQuestion,
    checkin.questions.length,
    dispatch,
    lastEvent,
    router,
  ]);

  const selectAnswer = (score: number) => {
    if (!question) return;

    dispatch(
      setCheckinAnswer({
        index: checkin.currentQuestion,
        answer: {
          id: answer?.id,
          questionId: question.questionId,
          score,
          comment: answer?.comment ?? "",
        },
      }),
    );
  };

  const updateComment = (comment: string) => {
    if (!question || !answer) return;

    dispatch(
      setCheckinAnswer({
        index: checkin.currentQuestion,
        answer: { ...answer, comment },
      }),
    );
  };

  const saveAndContinue = () => {
    if (!question || !answer?.score || !isConnected || checkin.submitting) {
      return;
    }

    pendingAction.current =
      checkin.currentQuestion === checkin.questions.length - 1
        ? "review"
        : "next";

    dispatch(setCheckinSubmitting(true));
    sendMessage("action", {
      type: "checkinService",
      action: "submit",
      payload: {
        relationshipId: checkin.relationshipId || relationshipId,
        answers: [
          {
            ...(answer.id ? { id: answer.id } : {}),
            questionId: answer.questionId,
            score: answer.score,
            ...(answer.comment?.trim()
              ? { comment: answer.comment.trim() }
              : {}),
          },
        ],
        finalSubmit: false,
      },
    });
  };

  const isLoading =
    checkin.loading || (!checkin.questions.length && isConnected);

  return (
    <DashboardLayout>
      <main className="min-h-[calc(100vh-4rem)] bg-background px-10 py-8 text-foreground">
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] flex-col">
          <header className="mb-8">
            <h1 className="text-xl font-extrabold tracking-tight">
              Weekly check-in
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Share how this week felt in your relationship.
            </p>
          </header>

          {isLoading ? (
            <Card
              aria-busy="true"
              aria-label="Loading weekly check-in"
              className="animate-pulse rounded-3xl bg-surface p-7"
            >
              <div className="h-4 w-36 rounded bg-muted" />
              <div className="mt-8 h-8 w-4/5 rounded bg-muted" />
              <div className="mt-3 h-4 w-full rounded bg-muted" />
              <div className="mt-10 h-14 rounded bg-muted" />
              <div className="mt-7 h-28 rounded bg-muted" />
            </Card>
          ) : !question ? (
            <Card className="rounded-3xl bg-surface p-8 text-center">
              <p className="text-sm text-muted-foreground" role="status">
                {checkin.error ||
                  (!isConnected
                    ? "Connecting to your check-in…"
                    : "No check-in questions are available right now.")}
              </p>
              <Button
                className="mt-5"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                <span>
                  Question {checkin.currentQuestion + 1} of {checkin.questions.length}
                </span>
                <span>
                  {Math.round(
                    ((checkin.currentQuestion + 1) /
                      checkin.questions.length) *
                    100,
                  )}% complete
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${((checkin.currentQuestion + 1) / checkin.questions.length) * 100}%`,
                  }}
                />
              </div>

              <Card className="mt-8 rounded-3xl border-border/70 bg-surface p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-extrabold text-foreground leading-tight">
                  {question.title}
                </h2>

                <div className="mt-8 flex justify-between text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  <span>Disagree (1)</span>
                  <span>Neutral (5)</span>
                  <span>Agree (10)</span>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
                  {Array.from({ length: 10 }, (_, index) => {
                    const score = index + 1;
                    const selected = answer?.score === score;

                    return (
                      <button
                        key={score}
                        type="button"
                        aria-label={`Rate ${score} out of 10`}
                        aria-pressed={selected}
                        className={`h-12 rounded-xl border text-sm font-extrabold transition-all ${selected
                          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "border-border bg-background hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        onClick={() => selectAnswer(score)}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8">
                  <InputField<any>
                    name="question-comment"
                    label="Optional comment / explanation"
                    useFor="textarea"
                    rows={5}
                    placeholder="Explain your rating (optional)…"
                    value={answer?.comment ?? ""}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      updateComment(event.target.value)}
                    labelClassName="auth-field-label"
                    inputClassName="auth-input"
                  />
                </div>
                <div className="mt-5 flex gap-5">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={
                      checkin.currentQuestion === 0 || checkin.submitting
                    }
                    onClick={() =>
                      dispatch(
                        setCheckinCurrentQuestion(
                          checkin.currentQuestion - 1,
                        ),
                      )
                    }
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!answer?.score || checkin.submitting || !isConnected}
                    onClick={saveAndContinue}
                  >
                    {checkin.submitting
                      ? "Saving…"
                      : checkin.currentQuestion === checkin.questions.length - 1
                        ? "Review answers"
                        : "Next question"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>

            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
