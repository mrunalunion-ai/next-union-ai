import { NotificationActionTypes } from "./action";
import { INotificationsState, initialNotificationsState } from "./types";

const notificationsReducer = (
  state: INotificationsState = initialNotificationsState,
  action: any,
): INotificationsState => {
  switch (action.type) {
    case NotificationActionTypes.SET_LOADING:
      return { ...state, loading: action.payload, error: "" };
    case NotificationActionTypes.SET_ITEMS:
      return {
        ...state,
        items: action.payload.items,
        unreadCount: action.payload.unreadCount ?? action.payload.items.filter((item: any) => !item.isRead).length,
        loading: false,
        error: "",
      };
    case NotificationActionTypes.ADD_ITEM:
      return {
        ...state,
        items: [action.payload, ...state.items.filter((item) => item.id !== action.payload.id)],
        unreadCount: action.payload.isRead ? state.unreadCount : state.unreadCount + 1,
      };
    case NotificationActionTypes.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload, loading: false };
    case NotificationActionTypes.MARK_READ: {
      const item = state.items.find((notification) => notification.id === action.payload);
      return {
        ...state,
        items: state.items.map((notification) =>
          notification.id === action.payload ? { ...notification, isRead: true } : notification,
        ),
        unreadCount: item && !item.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }
    case NotificationActionTypes.MARK_ALL_READ:
      return { ...state, items: state.items.map((item) => ({ ...item, isRead: true })), unreadCount: 0 };
    case NotificationActionTypes.SET_ERROR:
      return { ...state, loading: false, error: action.payload };
    case NotificationActionTypes.CLEAR:
      return initialNotificationsState;
    default:
      return state;
  }
};

export default notificationsReducer;
