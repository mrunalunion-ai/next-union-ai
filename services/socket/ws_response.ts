import { IUserRes } from "@/redux/modules/common/user_data/types";
import { updateUserData } from "@/redux/modules/common/user_data/action";
import {
  setCheckInQuesList,
  setLoveLanguageList,
  setRelationStatusList
} from "@/redux/modules/main/action";
import {
  setCheckinData,
  setCheckinError,
  setCheckinSubmitting,
} from "@/redux/modules/checkin";
import {
  setTaskList,
  setTasksError,
  setTasksSaving,
  type TaskFilter,
} from "@/redux/modules/tasks";
import {
  setInsightsAnalyses,
  setInsightsDashboard,
  setInsightsError,
} from "@/redux/modules/insights";
import {
  addNotification,
  markAllNotificationsRead,
  markNotificationRead,
  setNotifications,
  setNotificationsError,
  setUnreadNotificationCount,
} from "@/redux/modules/notifications";
import {
  setAccountError,
  setAccountPartner,
  setAccountPlans,
  setAccountSaving,
  setAccountTransactions,
  setActiveSubscription,
  setAccountLegal,
  type LegalPageType,
} from "@/redux/modules/account";
import { toast } from "react-toastify";

function getInsightPayload(message: Record<string, any>) {
  const responseData = message?.data;

  if (
    responseData?.data &&
    typeof responseData.data === "object" &&
    !Array.isArray(responseData.data)
  ) {
    return responseData.data;
  }

  return responseData && typeof responseData === "object"
    ? responseData
    : {};
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toInsightText(value: unknown) {
  if (!value || typeof value !== "object") {
    return { title: "", description: "" };
  }

  const text = value as Record<string, any>;
  return {
    title: String(text.title ?? ""),
    description: String(text.description ?? ""),
  };
}

function toRecommendation(value: unknown) {
  if (!value || typeof value !== "object") return null;

  const recommendation = value as Record<string, any>;
  return {
    id: String(recommendation.id ?? recommendation._id ?? ""),
    title: String(recommendation.title ?? recommendation.headline ?? ""),
    description: String(
      recommendation.description ?? recommendation.body ?? "",
    ),
    priority: String(
      recommendation.priority ?? recommendation.severity ?? "medium",
    ),
    category: String(recommendation.category ?? recommendation.type ?? ""),
  };
}

function notificationType(rawType: unknown) {
  const type = String(rawType ?? "").toLowerCase();

  if (type.startsWith("task")) return "task" as const;
  if (type.includes("checkin") || type.includes("check_in")) return "checkin" as const;
  if (type.includes("insight") || type.includes("score")) return "insight" as const;
  if (type.includes("sync") || type.includes("partner")) return "sync" as const;
  return "system" as const;
}

function toNotification(value: unknown, fallbackType?: unknown) {
  if (!value || typeof value !== "object") return null;

  const raw = value as Record<string, any>;
  return {
    id: String(raw.id ?? raw._id ?? `${String(fallbackType ?? "notification")}-${Date.now()}`),
    userId: raw.userId ? String(raw.userId) : undefined,
    title: String(raw.title ?? raw.headline ?? "Notification"),
    description: String(raw.description ?? raw.body ?? raw.message ?? ""),
    type: notificationType(raw.notificationType ?? raw.type ?? fallbackType),
    referenceId: raw.referenceId ? String(raw.referenceId) : undefined,
    isRead: raw.isRead === true,
    createdAt: raw.createdAt ? String(raw.createdAt) : new Date().toISOString(),
  };
}

function directNotificationType(type: unknown) {
  return [
    "notification",
    "task_assigned",
    "task_completed",
    "ws_send_request_event",
    "ws_accept_request_event",
    "ws_cancel_request_event",
    "send_request",
    "accept_request",
    "cancel_request",
    "connection_deleted",
    "checkin_completed",
    "package_buy",
  ].includes(String(type));
}

function responseData(message: Record<string, any>) {
  const data = message?.data;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data.data ?? data;
  }

  return data;
}

export const ws_response = (
  { evt }: { evt: { event: string; data: any } },
  navigate: any,
  sendMessage: (
    event: string,
    data?: Record<string, any>,
  ) => void,
  user_data: IUserRes,
) => {
  return async (
    dispatch: any,
    getState: () => {
      (): any;
      new(): any;
      adminReducers: { device_id: string; access_token: string };
    },
  ) => {
    let ws_onmessage: Record<string, any>;
    try {
      ws_onmessage =
        typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data;
    } catch {
      return;
    }

    if (!ws_onmessage?.type && evt.event) {
      ws_onmessage = { ...ws_onmessage, type: evt.event, data: ws_onmessage };
    }

    const directType = ws_onmessage?.type;
    if (directNotificationType(directType)) {
      const notification = toNotification(ws_onmessage?.data, directType);

      if (
        ws_onmessage?.status !== false &&
        directType !== "connection_deleted" &&
        directType !== "checkin_completed" &&
        notification
      ) {
        dispatch(addNotification(notification));
      }
      return;
    }

    switch (ws_onmessage?.request?.type) {

      case "userService":
        if (ws_onmessage?.request?.action === "update") {
          dispatch(setAccountSaving(false));
          if (ws_onmessage?.status === true) {
            const data = getInsightPayload(ws_onmessage);
            dispatch(updateUserData(data?.user ?? data));
            toast.success(ws_onmessage?.msg ?? "Profile updated successfully.");
          } else {
            const message = ws_onmessage?.msg ?? "Unable to update your profile.";
            dispatch(setAccountError(message));
            toast.error(message);
          }
        }

        if (ws_onmessage?.request?.action === "get") {
          const data = getInsightPayload(ws_onmessage);
          const relationship = data?.user?.relationships?.[0] ?? data?.relationships?.[0];
          if (relationship?.partner) dispatch(setAccountPartner(relationship.partner));
          if (ws_onmessage?.status === true) {
            dispatch(updateUserData(data?.user ?? data));
          } else {
            toast.error(ws_onmessage?.msg ?? "Unable to load your account.");
          }
        }

        if (
          [
            "createUnion",
            "delete",
            "sendRequest",
            "acceptConnection",
            "cancelConnection",
            "deleteAccount",
            "deleteConnection",
          ].includes(ws_onmessage?.request?.action)
        ) {
          dispatch(setAccountSaving(false));
          if (ws_onmessage?.status === true) {
            toast.success(ws_onmessage?.msg);
          }
          else if (ws_onmessage?.status === false) {
            const message = ws_onmessage?.msg ?? "Unable to complete account action.";
            dispatch(setAccountError(message));
            toast.error(message);
          } else if (ws_onmessage?.request?.action === "deleteConnection") {
            dispatch(setAccountPartner(null));
          }
        }
        break;

      case "profileService":
        if (["get", "update"].includes(ws_onmessage?.request?.action)) {
          dispatch(setAccountSaving(false));
          if (ws_onmessage?.status === true) {
            const data = getInsightPayload(ws_onmessage);
            dispatch(updateUserData(data?.user ?? data));
          } else {
            const message = ws_onmessage?.msg ?? "Unable to update your profile.";
            dispatch(setAccountError(message));
            toast.error(message);
          }
        }
        break;

      case "loveLanguageService":
        if (ws_onmessage?.request?.action === "list") {
          if (ws_onmessage?.status === true) {
            dispatch(setLoveLanguageList(ws_onmessage?.data));
          } else {
            dispatch(setLoveLanguageList(ws_onmessage?.data));
          }
        }
        break;

      case "relationStatusService":
        if (ws_onmessage?.request?.action === "list") {
          if (ws_onmessage?.status === true) {
            dispatch(setRelationStatusList(ws_onmessage?.data));
          } else {
            dispatch(setRelationStatusList(ws_onmessage?.data));
          }
        }
        break;

      case "checkinQuesService":
        if (ws_onmessage?.request?.action === "list") {
          if (ws_onmessage?.status === true) {
            dispatch(setCheckInQuesList(ws_onmessage?.data));
          } else {
            dispatch(setCheckInQuesList(ws_onmessage?.data));
          }
        }
        break;

      case "subscriptionPlanService": {
        if (ws_onmessage?.status === false) {
          dispatch(setAccountError(ws_onmessage?.msg ?? "Unable to load plans."));
          break;
        }
        const data = getInsightPayload(ws_onmessage);
        if (ws_onmessage?.request?.action === "list") {
          const plans = Array.isArray(data.data) ? data.data : [];
          dispatch(
            setAccountPlans(
              plans.map((plan: Record<string, any>) => ({
                id: String(plan.id ?? ""),
                name: String(plan.name ?? ""),
                code: String(plan.code ?? ""),
                duration: toNumber(plan.duration),
                durationUnit: String(plan.durationUnit ?? "MONTH"),
                priceUSD: toNumber(plan.priceUSD),
                priceGBP: toNumber(plan.priceGBP),
                trialDays: toNumber(plan.trialDays),
                isPopular: String(plan.tag ?? "").toLowerCase() === "most popular",
                isBestValue: String(plan.tag ?? "").toLowerCase() === "best value",
              })),
            ),
          );
        }
        break;
      }

      case "subscriptionService": {
        if (ws_onmessage?.status === false) {
          dispatch(setAccountError(ws_onmessage?.msg ?? "Unable to load subscription."));
          break;
        }
        if (ws_onmessage?.request?.action === "getActive") {
          const data = getInsightPayload(ws_onmessage);
          const subscription = data && typeof data === "object" ? data : null;
          dispatch(
            setActiveSubscription(
              subscription && (subscription.id || subscription.planId)
                ? {
                  id: String(subscription.id ?? ""),
                  planId: String(subscription.planId ?? ""),
                  planName: String(subscription.planName ?? ""),
                  planCode: String(subscription.planCode ?? ""),
                  status: String(subscription.status ?? ""),
                  ownerUserId: String(subscription.ownerUserId ?? ""),
                  startDate: subscription.startDate,
                  endDate: subscription.endDate,
                  isTrial: subscription.isTrial === true,
                  autoRenew: subscription.autoRenew !== false,
                  isActive: subscription.isActive,
                }
                : null,
            ),
          );
        }
        if (ws_onmessage?.request?.action === "getPlans") {
          const data = getInsightPayload(ws_onmessage);
          const plans = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
          dispatch(
            setAccountPlans(
              plans.map((plan: Record<string, any>) => ({
                id: String(plan.id ?? ""),
                name: String(plan.name ?? ""),
                code: String(plan.code ?? ""),
                duration: toNumber(plan.duration),
                durationUnit: String(plan.durationUnit ?? "MONTH"),
                priceUSD: toNumber(plan.priceUSD ?? plan.priceUsd),
                priceGBP: toNumber(plan.priceGBP ?? plan.priceGbp),
                trialDays: toNumber(plan.trialDays),
                isPopular: String(plan.tag ?? "").toLowerCase() === "most popular",
                isBestValue: String(plan.tag ?? "").toLowerCase() === "best value",
              })),
            ),
          );
        }
        if (ws_onmessage?.request?.action === "recordPayment" && ws_onmessage?.status === true) {
          toast.success(ws_onmessage?.msg ?? "Payment recorded successfully.");
        }
        break;
      }

      case "paymentService": {
        if (ws_onmessage?.status === false) {
          dispatch(setAccountError(ws_onmessage?.msg ?? "Unable to load transactions."));
          break;
        }
        if (ws_onmessage?.request?.action === "getTransactions") {
          const data = getInsightPayload(ws_onmessage);
          const transactions = Array.isArray(data.data) ? data.data : [];
          dispatch(
            setAccountTransactions(
              transactions.map((transaction: Record<string, any>) => ({
                id: String(transaction.id ?? ""),
                transactionId: String(transaction.transactionId ?? transaction.transaction_id ?? ""),
                planName: String(transaction.planName ?? ""),
                amount: toNumber(transaction.amount),
                currency: String(transaction.currency ?? ""),
                date: transaction.date,
                status: String(transaction.status ?? ""),
                paymentMethod: String(transaction.paymentMethod ?? ""),
                platform: String(transaction.platform ?? transaction.Platform ?? ""),
                paymentCreatedBy: String(transaction.paymentCreatedBy ?? ""),
              })),
            ),
          );
        }
        if (ws_onmessage?.request?.action === "recordPayment" && ws_onmessage?.status === true) {
          toast.success(ws_onmessage?.msg ?? "Payment recorded successfully.");
        }
        break;
      }

      case "legalPageService": {
        if (ws_onmessage?.status === false) {
          dispatch(setAccountError(ws_onmessage?.msg ?? "Unable to load legal page."));
          break;
        }
        if (ws_onmessage?.request?.action === "get") {
          const data = getInsightPayload(ws_onmessage);
          const type = String(data.type ?? ws_onmessage?.request?.payload?.type) as LegalPageType;
          if (["terms", "privacy", "subscription"].includes(type)) {
            dispatch(
              setAccountLegal({
                type,
                page: {
                  id: String(data.id ?? ""),
                  type,
                  pageContent: String(data.pageContent ?? ""),
                  active: data.active === true,
                },
              }),
            );
          }
        }
        break;
      }

      case "checkinService":
        if (ws_onmessage?.request?.action === "list") {
          if (ws_onmessage?.status === true) {
            const data = responseData(ws_onmessage) ?? {};
            const checkin = Array.isArray(data?.questions)
              ? data
              : Array.isArray(data?.data)
                ? data.data[0]
                : data;

            dispatch(
              setCheckinData({
                relationshipId: checkin?.relationshipId,
                checkinId: checkin?.checkinId ?? checkin?.id,
                questions: Array.isArray(checkin?.questions)
                  ? checkin.questions
                  : [],
              }),
            );
          } else {
            dispatch(
              setCheckinError(
                ws_onmessage?.msg ??
                ws_onmessage?.message ??
                "Unable to load your weekly check-in.",
              ),
            );
          }
        }

        if (ws_onmessage?.request?.action === "submit") {
          dispatch(setCheckinSubmitting(false));

          if (ws_onmessage?.status === false) {
            dispatch(
              setCheckinError(
                ws_onmessage?.msg ??
                ws_onmessage?.message ??
                "Unable to save your check-in.",
              ),
            );
          }
        }
        break;

      case "relationshipAnalysisService": {
        const action = ws_onmessage?.request?.action;

        if (ws_onmessage?.status === false) {
          dispatch(
            setInsightsError(
              ws_onmessage?.msg ??
              ws_onmessage?.message ??
              "Unable to load relationship insights.",
            ),
          );
          break;
        }

        const data = getInsightPayload(ws_onmessage);

        if (action === "list") {
          const analyses = Array.isArray(data.analyses)
            ? data.analyses
              .filter((item: unknown) => item && typeof item === "object")
              .map((item: Record<string, any>) => ({
                id: String(item.id ?? item._id ?? ""),
                weekNumber: toNumber(item.weekNumber),
                overallScore: toNumber(item.overallScore),
                relationshipStatus: String(item.relationshipStatus ?? ""),
                emotionalConnection: toNumber(item.emotionalConnection),
                communicationSatisfaction: toNumber(
                  item.communicationSatisfaction,
                ),
                pacingAndReciprocity: toNumber(item.pacingAndReciprocity),
                coreTrustIndex: toNumber(item.coreTrustIndex),
                coreStrengths: Array.isArray(item.coreStrengths)
                  ? item.coreStrengths.map(toInsightText)
                  : [],
                gapsAndRisks: Array.isArray(item.gapsAndRisks)
                  ? item.gapsAndRisks.map(toInsightText)
                  : [],
                recommendations: Array.isArray(item.recommendations)
                  ? item.recommendations
                    .map(toRecommendation)
                    .filter(Boolean)
                  : [],
              }))
            : [];
          const trend = Array.isArray(data.trend)
            ? data.trend
              .filter((item: unknown) => item && typeof item === "object")
              .map((item: Record<string, any>) => ({
                label: String(item.label ?? ""),
                weekNumber: toNumber(item.weekNumber),
                periodStart: String(item.periodStart ?? ""),
                overallScore: toNumber(item.overallScore),
              }))
            : [];

          dispatch(setInsightsAnalyses({ analyses, trend }));
        }

        if (action === "dashboard") {
          const toUser = (value: unknown) => {
            if (!value || typeof value !== "object") return null;
            const user = value as Record<string, any>;
            return {
              id: String(user.id ?? ""),
              name: String(user.name ?? ""),
              checkedIn: user.checkedIn === true,
            };
          };

          dispatch(
            setInsightsDashboard({
              overallScore: toNumber(data.overallScore),
              relationshipStatus: String(data.relationshipStatus ?? ""),
              user1: toUser(data.user1),
              user2: toUser(data.user2),
              recommendations: Array.isArray(data.recommendations)
                ? data.recommendations
                  .map(toRecommendation)
                  .filter(Boolean)
                : [],
              recommendationCount: toNumber(data.recommendationCount),
              pendingTaskCount: toNumber(data.pendingTaskCount),
            }),
          );
        }
        break;
      }

      case "notificationService": {
        const action = ws_onmessage?.request?.action;

        if (ws_onmessage?.status === false) {
          dispatch(
            setNotificationsError(
              ws_onmessage?.msg ??
              ws_onmessage?.message ??
              "Unable to load notifications.",
            ),
          );
          break;
        }

        const data = getInsightPayload(ws_onmessage);

        if (action === "list") {
          const rawItems = Array.isArray(data.data) ? data.data : [];
          const items = rawItems
            .map((item: unknown) => toNotification(item))
            .filter(Boolean);
          const unreadCount =
            typeof data.unreadCount === "number" ? data.unreadCount : undefined;
          dispatch(setNotifications({ items, unreadCount }));
        }

        if (action === "unreadCount") {
          dispatch(
            setUnreadNotificationCount(
              Number(data.count ?? data.unreadCount ?? 0),
            ),
          );
        }

        if (action === "markRead") {
          const id = ws_onmessage?.request?.payload?.id;
          if (id) dispatch(markNotificationRead(String(id)));
        }

        if (action === "markAllRead") {
          dispatch(markAllNotificationsRead());
        }
        break;
      }

      case "tasksService": {
        const action =
          ws_onmessage?.request?.action ??
          ws_onmessage?.data?.request?.action;
        const success =
          ws_onmessage?.status === true || ws_onmessage?.data?.status === true;

        if (action === "list") {
          // Task list responses can arrive either as the normal WebSocket
          // envelope or with request/status/data nested one level deeper.
          const response =
            ws_onmessage?.data &&
              typeof ws_onmessage.data === "object" &&
              !Array.isArray(ws_onmessage.data)
              ? ws_onmessage.data
              : ws_onmessage;
          const request = ws_onmessage?.request ?? response?.request;
          const filter = request?.payload?.filter as
            | TaskFilter
            | undefined;
          const payload = response?.data ?? response ?? {};
          const items = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : [];
          const count =
            typeof response?.pagination?.totalCount === "number"
              ? response.pagination.totalCount
              : typeof payload?.pagination?.totalCount === "number"
                ? payload.pagination.totalCount
              : items.length;
          const success =
            ws_onmessage?.status !== false && response?.status !== false;

          if (
            filter &&
            ["me", "partner", "completed", "overdue"].includes(filter)
          ) {
            if (!success) {
              dispatch(setTasksError(ws_onmessage?.msg ?? "Unable to load tasks."));
            } else {
              dispatch(setTaskList({ filter, tasks: items, count }));
            }
          }
        }

        if (["create", "update", "delete"].includes(action)) {
          dispatch(setTasksSaving(false));

          if (!success) {
            dispatch(
              setTasksError(
                ws_onmessage?.msg ??
                ws_onmessage?.message ??
                "Unable to update tasks.",
              ),
            );
          }
        }
        break;
      }

      default:
        return;
    }
  };
};
