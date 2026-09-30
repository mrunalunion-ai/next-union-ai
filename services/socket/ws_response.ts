import {
  IAccountSubscription,
  IAccountTransaction,
  setAccountError,
  setAccountPartner,
  setAccountPlans,
  setAccountPlanFeatures,
  setAccountSaving,
  setAccountTransactions,
  setActiveSubscription,
} from "@/redux/modules/account";
import {
  setCheckinData,
  setCheckinError,
  setCheckinSubmitting,
} from "@/redux/modules/checkin";
import { updateUserData } from "@/redux/modules/common/user_data/action";
import { IUserRes } from "@/redux/modules/common/user_data/types";
import {
  setInsightsAnalyses,
  setInsightsDashboard,
  setInsightsError,
} from "@/redux/modules/insights";
import {
  type IAnalysisItem,
  type IInsightDashboard,
  type IInsightTrendPoint
} from "@/redux/modules/insights/types";
import {
  setCheckInQuesList,
  setLoveLanguageList,
  setRelationStatusList
} from "@/redux/modules/main/action";
import {
  addNotification,
  markAllNotificationsRead,
  markNotificationRead,
  setNotifications,
  setNotificationsError,
  setUnreadNotificationCount,
} from "@/redux/modules/notifications";
import { type INotification } from "@/redux/modules/notifications/types";
import {
  setTaskList,
  setTasksError,
  setTasksSaving,
  type TaskFilter,
} from "@/redux/modules/tasks";

import { toast } from "react-toastify";

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
    if ([
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
    ].includes(String(directType))) {
      const notificationData = ws_onmessage?.data;
      const notification =
        notificationData &&
          typeof notificationData === "object" &&
          (notificationData as INotification).id
          ? (notificationData as INotification)
          : null;

      if (
        ws_onmessage?.status !== false &&
        directType === "notification" &&
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
            const data = (ws_onmessage?.data?.data || {}) as Record<string, any>;
            const user = data?.user ?? data;
            dispatch(updateUserData(user));
            const subscription = (user?.relationships?.[0]?.subscription || {}) as IAccountSubscription;
            dispatch(setActiveSubscription(
              subscription.id || subscription.planId ? subscription : null,
            ));
          } else {
            const message = ws_onmessage?.msg ?? "Unable to update your profile.";
            dispatch(setAccountError(message));
            toast.error(message);
          }
        }

        if (ws_onmessage?.request?.action === "get") {
          const data = (ws_onmessage?.data?.data || {}) as Record<string, any>;
          const relationship = data?.user?.relationships?.[0] ?? data?.relationships?.[0];
          if (relationship?.partner) dispatch(setAccountPartner(relationship.partner));
          if (ws_onmessage?.status === true) {
            const user = data?.user ?? data;
            dispatch(updateUserData(user));
            const subscription = (user?.relationships?.[0]?.subscription || {}) as IAccountSubscription;
            dispatch(setActiveSubscription(
              subscription.id || subscription.planId ? subscription : null,
            ));
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
            const data = (ws_onmessage?.data?.data || {}) as Record<string, any>;
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
        if (ws_onmessage?.request?.action === "list") {
          const response = ws_onmessage?.data?.data;
          const plans = Array.isArray(response?.data) ? response?.data : [];
          const features = Array.isArray(response?.planFeatures) ? response.planFeatures : [];
          dispatch(setAccountPlans(plans.map((plan: any) => ({
            id: String(plan.id ?? ""),
            name: String(plan.name ?? ""),
            code: String(plan.code ?? ""),
            duration: Number(plan.duration ?? 0),
            durationUnit: String(plan.durationUnit ?? "MONTH"),
            priceUSD: Number(plan.priceUSD ?? 0),
            priceGBP: Number(plan.priceGBP ?? 0),
            trialDays: Number(plan.trialDays ?? 0),
            isPopular: String(plan.tag ?? "").toLowerCase() === "most popular",
            isBestValue: String(plan.tag ?? "").toLowerCase() === "best value",
          }))));
          dispatch(setAccountPlanFeatures(features.map((feature: any) => ({
            id: String(feature.id ?? ""),
            code: String(feature.code ?? ""),
            name: String(feature.name ?? ""),
          }))));
        }
        break;
      }

      case "subscriptionService": {
        if (ws_onmessage?.status === false) {
          dispatch(setAccountError(ws_onmessage?.msg ?? "Unable to load subscription."));
          break;
        }
        if (ws_onmessage?.request?.action === "getActive") {
          dispatch(setActiveSubscription(
            ws_onmessage?.data?.data?.id || ws_onmessage?.data?.data?.planId ? ws_onmessage?.data?.data : null,
          ));
        }
        if (ws_onmessage?.request?.action === "getPlans") {
          const data = ws_onmessage?.data;
          const plans = Array.isArray(data) ? data : [];
          dispatch(setAccountPlans(plans));
        }
        if (ws_onmessage?.request?.action === "recordPayment" && ws_onmessage?.status === true) {
          if (ws_onmessage?.data?.data) dispatch(setActiveSubscription(ws_onmessage?.data?.data));
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
          const response = ws_onmessage?.data?.data;
          const transactions = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : [];
          dispatch(setAccountTransactions(transactions));
        }
        if (ws_onmessage?.request?.action === "recordPayment" && ws_onmessage?.status === true) {
          dispatch(setActiveSubscription(ws_onmessage?.data?.data));
          toast.success(ws_onmessage?.msg ?? "Payment recorded successfully.");
        }
        break;
      }

      case "checkinService":
        if (ws_onmessage?.request?.action === "list") {
          if (ws_onmessage?.status === true) {
            const response = (ws_onmessage?.data || {}) as Record<string, any>;
            const checkin = (response?.data || response) as Record<string, any>;

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

        const data = (ws_onmessage?.data?.data || {}) as Record<string, any>;

        if (action === "list") {
          const analyses = (data.analyses || []) as IAnalysisItem[];
          const trend = (data.trend || []) as IInsightTrendPoint[];

          dispatch(setInsightsAnalyses({ analyses, trend }));
        }

        if (action === "dashboard") {
          const dashboard = data as IInsightDashboard;

          dispatch(
            setInsightsDashboard({
              overallScore: dashboard.overallScore,
              relationshipStatus: dashboard.relationshipStatus,
              user1: dashboard.user1,
              user2: dashboard.user2,
              recommendations: dashboard.recommendations || [],
              recommendationCount: dashboard.recommendationCount,
              pendingTaskCount: dashboard.pendingTaskCount,
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

        const data = (ws_onmessage?.data?.data || {}) as Record<string, any>;

        if (action === "list") {
          const items = (data.data || []) as INotification[];
          dispatch(setNotifications({ items }));
        }

        if (action === "markRead") {
          const id = ws_onmessage?.request?.payload?.id;
          if (id) dispatch(markNotificationRead(String(id)));
        }

        if (action === "markAllRead") {
          dispatch(markAllNotificationsRead());
        }

        if (action === "unreadCount") {
          const unreadCount = ws_onmessage?.data?.unreadCount ?? ws_onmessage?.unreadCount;
          if (typeof unreadCount === "number") {
            dispatch(setUnreadNotificationCount(unreadCount));
          }
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





