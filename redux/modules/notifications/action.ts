import { INotification } from "./types";

export const NotificationActionTypes = {
  SET_LOADING: "NOTIFICATIONS_SET_LOADING",
  SET_ITEMS: "NOTIFICATIONS_SET_ITEMS",
  ADD_ITEM: "NOTIFICATIONS_ADD_ITEM",
  SET_UNREAD_COUNT: "NOTIFICATIONS_SET_UNREAD_COUNT",
  MARK_READ: "NOTIFICATIONS_MARK_READ",
  MARK_ALL_READ: "NOTIFICATIONS_MARK_ALL_READ",
  SET_ERROR: "NOTIFICATIONS_SET_ERROR",
  CLEAR: "NOTIFICATIONS_CLEAR",
};

export const setNotificationsLoading = (payload: boolean) => ({
  type: NotificationActionTypes.SET_LOADING,
  payload,
});

export const setNotifications = (payload: {
  items: INotification[];
  unreadCount?: number;
}) => ({ type: NotificationActionTypes.SET_ITEMS, payload });

export const addNotification = (payload: INotification) => ({
  type: NotificationActionTypes.ADD_ITEM,
  payload,
});

export const setUnreadNotificationCount = (payload: number) => ({
  type: NotificationActionTypes.SET_UNREAD_COUNT,
  payload,
});

export const markNotificationRead = (payload: string) => ({
  type: NotificationActionTypes.MARK_READ,
  payload,
});

export const markAllNotificationsRead = () => ({
  type: NotificationActionTypes.MARK_ALL_READ,
});

export const setNotificationsError = (payload: string) => ({
  type: NotificationActionTypes.SET_ERROR,
  payload,
});

export const clearNotifications = () => ({
  type: NotificationActionTypes.CLEAR,
});
