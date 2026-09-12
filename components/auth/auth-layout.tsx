import type { ReactNode } from "react";
import { Header } from "../common/Header";


export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <main className="min-h-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}