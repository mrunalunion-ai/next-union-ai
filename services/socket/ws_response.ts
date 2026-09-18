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
    "package_buy",
  ].includes(String(type));
}

export const ws_response = (
  { evt }: { evt: { event: string; data: any } },
  navigate: any,
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
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
    const ws_onmessage = typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data;

    const directType = ws_onmessage?.type;
    if (directNotificationType(directType)) {
      const notification = toNotification(ws_onmessage?.data, directType);

      if (ws_onmessage?.status !== false && notification) {
        dispatch(addNotification(notification));
      }
      return;
    }

    switch (ws_onmessage?.request?.type) {

      case "userService":
        if (ws_onmessage?.request?.action === "update") {
          if (ws_onmessage?.status === true) {
            toast.success(ws_onmessage?.msg)
          } else {
            toast.error(ws_onmessage?.msg)
          }
        }

        if (ws_onmessage?.request?.action === "get") {
          if (ws_onmessage?.status === true) {
            dispatch(updateUserData(ws_onmessage?.data));
          } else {
            toast.error(ws_onmessage?.msg);
            dispatch(updateUserData(ws_onmessage?.data));
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

      case "checkinService":
        if (ws_onmessage?.request?.action === "list") {
          if (ws_onmessage?.status === true) {
            const data = ws_onmessage?.data ?? {};
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
              user1: toUser(data.user1),
              user2: toUser(data.user2),
              recommendations: Array.isArray(data.recommendations)
                ? data.recommendations
                    .map(toRecommendation)
                    .filter(Boolean)
                : [],
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
        const action = ws_onmessage?.request?.action;
        const success = ws_onmessage?.status === true;

        if (action === "list") {
          const filter = ws_onmessage?.request?.payload?.filter as
            | TaskFilter
            | undefined;
          const data = ws_onmessage?.data ?? {};
          const items = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
              ? data.data
              : [];
          const count =
            typeof data?.pagination?.totalCount === "number"
              ? data.pagination.totalCount
              : items.length;

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
