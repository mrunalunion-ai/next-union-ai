"use client";

import { APP_URL } from "@/constant/static";
import { Popup } from "@/components/common/popup";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { logoutUser, setAuthData } from "@/redux/modules/common/user_data/action";
import { setReduxClear } from "@/redux/modules/main/action";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { ws_response } from "./ws_response";

// Singleton socket reference
let singletonSocket: Socket | null = null;
let isSocketInitialized = false;

type WebSocketContextType = {
  socket: Socket | null;
  sendMessage: (event: string, data?: Record<string, any>) => void;
  isConnected: boolean;
  lastEvent?: { event: string; data: any } | null;
};

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  sendMessage: () => { },
  isConnected: false,
  lastEvent: null,
});

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user_data } = usePosterReducers();
  const accessToken = user_data?.access_token;
  const guestAccessToken = process.env.NEXT_PUBLIC_GUEST_ACCESS_TOKEN;
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{
    event: string;
    data: any;
  } | null>(null);
  const [isConnectionDeletedPopupOpen, setIsConnectionDeletedPopupOpen] =
    useState(false);

  const buildAuthPayload = () => {
    const token = accessToken || guestAccessToken;
    return token ? { token } : {};
  };

  const sendMessage = useCallback((event: string, data?: any) => {
    if (singletonSocket && singletonSocket.connected) {
      console.log('Send:', event, data);
      singletonSocket.emit(event, data);
    } else {
      console.log("⚠️ Socket not connected. Cannot send:", event, data);
    }
  }, []);

  const initializeSocket = useCallback(() => {
    if (isSocketInitialized) return;

    // const tokenToUse = accessToken || guestAccessToken;
    // if (!tokenToUse) {
    //   console.warn('⚠️ No token available for WebSocket connection');
    //   return;
    // }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      console.log("⚠️ NEXT_PUBLIC_ENDPOINT_API_URL is not set");
      return;
    }
    const socketUrl = accessToken
      ? baseUrl
      : `${baseUrl.replace(/\/$/, "")}/guest`;

    singletonSocket = io(socketUrl, {
      auth: buildAuthPayload(),
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    singletonSocket.on("connect", () => {
      console.log("✅ Socket.IO connected");
      setIsConnected(true);
    });

    singletonSocket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO disconnected:", reason);
      setIsConnected(false);
    });

    singletonSocket.on("connect_error", (err) => {
      console.error("🚨 Socket.IO connection error:", err);
      setIsConnected(false);
      if (
        err.message === "Unauthorized token" ||
        err.message?.toLowerCase().includes("unauthorized") ||
        err.message === "Authentication failed"
      ) {
        dispatch(logoutUser());
        localStorage.clear();
        dispatch(setAuthData({} as any));
        dispatch(setReduxClear());
        router.replace(APP_URL.LINKS.LOGIN);
      }
    });

    singletonSocket.onAny((event, data) => {
      console.log("📥 Received event:", event, data);

      if (event === "unauthorized" || data?.type === "unauthorized") {
        dispatch(logoutUser());
        localStorage.clear();
        sessionStorage.clear();
        dispatch(setAuthData({} as any));
        dispatch(setReduxClear());
        router.replace(APP_URL.LINKS.LOGIN);
        return;
      }

      setLastEvent({ event, data });
      dispatch(
        ws_response(
          { evt: { event, data } },
          router,
          sendMessage,
          user_data,
        ) as any,
      );
    });

    isSocketInitialized = true;
  }, [accessToken, guestAccessToken, dispatch, router, sendMessage]);

  useEffect(() => {
    // Do not process stale socket events after the authenticated session has
    // been cleared. This prevents logout from triggering another userService
    // get request while the guest socket is being initialized.
    if (!lastEvent || !isConnected || !accessToken) return;

    const relationship = user_data?.user?.relationships?.[0];
    const relationshipId = relationship?.id;
    const eventType =
      lastEvent.event === "data" ? lastEvent.data?.type : lastEvent.event;
    const request = lastEvent.data?.request;
    const directAccountEvents = new Set([
      "ws_send_request_event",
      "ws_accept_request_event",
      "ws_cancel_request_event",
      "send_request",
      "accept_request",
      "cancel_request",
      "connection_deleted",
    ]);
    const unionActions = new Set([
      "createUnion",
      "delete",
      "sendRequest",
      "acceptConnection",
      "cancelConnection",
      "deleteConnection",
    ]);

    if (directAccountEvents.has(eventType) || (request?.type === "userService" && unionActions.has(request.action))) {
      sendMessage("action", { type: "userService", action: "get", payload: {} });
    }

    if (eventType === "cancel_request") {
      console.log("user_data.onboarding", user_data)
      if (user_data.user.onboardingStep === "connectionRequestSent" || user_data.user.onboardingStep === "relationshipDetailsCompleted") {
        router.replace(APP_URL.LINKS.CREATE_UNION);
      } else {
        router.replace(APP_URL.LINKS.CODE_CREATED);
      }
    }

    if (eventType === "connection_deleted") {
      setIsConnectionDeletedPopupOpen(true);
      router.replace(APP_URL.LINKS.CREATE_UNION);
    }

    if (eventType === "checkin_completed") {
      if (relationshipId) {
        sendMessage("action", {
          type: "checkinService",
          action: "list",
          payload: { relationshipId },
        });
        sendMessage("action", {
          type: "relationshipAnalysisService",
          action: "dashboard",
          payload: { relationshipId },
        });
      }
    }

    if (eventType === "task_assigned" || eventType === "task_completed") {
      ["me", "partner", "completed", "overdue"].forEach((filter) => {
        sendMessage("action", {
          type: "tasksService",
          action: "list",
          payload: { filter, page: 1, limit: 100, relationshipId },
        });
      });
    }

    if (eventType === "ws_error") {
      toast.error("Unable to synchronize with the server. Please try again.");
    }
  }, [accessToken, isConnected, lastEvent, sendMessage, user_data]);

  // Re-initialize socket whenever token changes
  useEffect(() => {
    if (!accessToken && !guestAccessToken) return;

    if (singletonSocket) {
      console.log("♻️ Reconnecting socket due to token change...");
      singletonSocket.disconnect();
      singletonSocket = null;
      isSocketInitialized = false;
    }

    initializeSocket();
  }, [accessToken, guestAccessToken, initializeSocket]);

  return (
    <WebSocketContext.Provider
      value={{
        socket: singletonSocket,
        sendMessage,
        isConnected,
        lastEvent,
      }}
    >
      {children}
      <Popup
        open={isConnectionDeletedPopupOpen}
        onOpenChange={setIsConnectionDeletedPopupOpen}
        variant="info"
        title="Connection deleted"
        description="Your partner deleted their account."
        confirmText="OK"
        hideCancel
        onConfirm={() => {
          router.replace(APP_URL.LINKS.CREATE_UNION);
        }}
      />
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
