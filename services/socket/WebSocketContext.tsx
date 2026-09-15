"use client";

import { APP_URL } from "@/constant/static";
import { usePosterReducers } from "@/redux/getdata/usePostReducer";
import { setAuthData } from "@/redux/modules/common/user_data/action";
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

  const buildAuthPayload = () => {
    if (accessToken) {
      return { token: accessToken };
    }
    return {};
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

    const url = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!url) {
      console.log("⚠️ NEXT_PUBLIC_ENDPOINT_API_URL is not set");
      return;
    }
    singletonSocket = io(url, {
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
        err.message?.toLowerCase().includes("unauthorized")
      ) {
        // dispatch(setLogout());
        localStorage.clear();
        dispatch(setAuthData({} as any));
        dispatch(setReduxClear());
        router.replace(APP_URL.LINKS.HOME);
      }
    });

    singletonSocket.onAny((event, data) => {
      console.log("📥 Received event:", event, data);

      if (event === "unauthorized") {
        // dispatch(setLogout());
        localStorage.clear();
        dispatch(setAuthData({} as any));
        dispatch(setReduxClear());
        router.push(APP_URL.LINKS.HOME);
        return;
      }
      setLastEvent({ event, data });
      dispatch(
        ws_response(
          { evt: { event, data } },
          router,
          (d: any) => sendMessage(event, d),
          user_data,
        ) as any,
      );
    });

    isSocketInitialized = true;
  }, [accessToken, guestAccessToken, dispatch, router, sendMessage]);

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
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
