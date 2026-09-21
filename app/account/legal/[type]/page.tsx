"use client";

import { FileText, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";

import { AccountPageHeader } from "@/components/account/account-ui";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  initialAccountState,
  setAccountLoading,
  type LegalPageType,
} from "@/redux/modules/account";
import { useWebSocket } from "@/services/socket/WebSocketContext";

const legalTitles: Record<LegalPageType, string> = {
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
  subscription: "Subscription Policy",
};

const legalTypes: LegalPageType[] = ["terms", "privacy", "subscription"];

function removeDuplicateTitle(html: string, title: string) {
  return html.replace(
    /^\s*<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>\s*/i,
    (heading, content) => {
      const headingText = String(content)
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/gi, "&")
        .replace(/\band\b/gi, "&")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      return headingText === title.toLowerCase() ? "" : heading;
    },
  );
}

export default function LegalPage() {
  const params = useParams<{ type: string }>();
  const type = params.type as LegalPageType;
  const validType = legalTypes.includes(type);
  const dispatch = useAppDispatch();
  const { isConnected, sendMessage } = useWebSocket();
  const account = useAppSelector(
    (state) => state.combinedReducer.account ?? initialAccountState,
  );
  const page = validType ? account.legal[type] : undefined;
  const pageContent =
    page?.pageContent && validType
      ? removeDuplicateTitle(page.pageContent, legalTitles[type])
      : "";

  const loadPage = useCallback(() => {
    if (!isConnected || !validType) return;

    dispatch(setAccountLoading(true));
    sendMessage("action", {
      type: "legalPageService",
      action: "get",
      payload: { type },
    });
  }, [dispatch, isConnected, sendMessage, type, validType]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  return (
    <DashboardLayout>
      <main className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start justify-between gap-4">
            <AccountPageHeader
              title={validType ? legalTitles[type] : "Legal page"}
              description="Review the latest UnionAI policy information."
              showBack
            />
            {validType && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Refresh legal page"
                onClick={loadPage}
                disabled={!isConnected || account.loading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {account.loading && !page ? (
            <div className="h-96 animate-pulse rounded-3xl bg-muted" />
          ) : pageContent ? (
            <Card className="rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-8">
              <article
                className="text-sm leading-7 text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:mb-2 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: pageContent }}
              />
            </Card>
          ) : (
            <Card className="rounded-3xl p-10 text-center shadow-sm">
              <FileText className="mx-auto h-10 w-10 text-primary/50" />
              <h2 className="mt-4 font-extrabold">Content unavailable</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This policy could not be loaded right now.
              </p>
            </Card>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
