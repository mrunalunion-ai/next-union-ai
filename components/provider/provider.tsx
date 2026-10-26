"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { makeStore } from "@/redux/store";
import { ThemeProvider } from "@/components/theme-provider";
import { WebSocketProvider } from "@/services/socket/WebSocketContext";
import RouteGuard from "@/components/auth/route-guard";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [{ store }] = useState(() => makeStore());

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <WebSocketProvider>
          <RouteGuard>{children}</RouteGuard>
          <ToastContainer position="top-center" autoClose={3000} theme="light" />
        </WebSocketProvider>
      </ThemeProvider>
    </Provider>
  );
}
