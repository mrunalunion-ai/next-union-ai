"use client";

import { Suspense, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { makeStore } from "@/redux/store";
import { ThemeProvider } from "@/components/theme-provider";
import { WebSocketProvider } from "@/services/socket/WebSocketContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [{ store, persistor }] = useState(() => makeStore());

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <WebSocketProvider>
            <Suspense>{children}</Suspense>
            <ToastContainer position="top-center" autoClose={3000} theme="light" />
          </WebSocketProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
