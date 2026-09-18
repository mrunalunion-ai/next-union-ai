export type NotificationType = "checkin" | "sync" | "task" | "insight" | "system";

export interface INotification {
  id: string;
  userId?: string;
  title: string;
  description: string;
  type: NotificationType;
  referenceId?: string;
  isRead: boolean;
  createdAt?: string;
}

export interface INotificationsState {
  items: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string;
}

export const initialNotificationsState: INotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: "",
};
