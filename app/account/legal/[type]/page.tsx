import { FileText } from "lucide-react";

import { AccountPageHeader } from "@/components/account/account-ui";
import AuthLayout from "@/components/auth/auth-layout";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card } from "@/components/ui/card";
import { API_BASE_URL, APP_URL, LEGAL_PAGE_SOURCE } from "@/constant/static";
import type { LegalPageType } from "@/redux/modules/account";

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

async function getLegalContent(type: LegalPageType) {
  try {
    const response = await fetch(
      `${API_BASE_URL}${APP_URL.ENDPOINT_URL.LEGAL_PAGE}?type=${encodeURIComponent(type)}`,
      { cache: "no-store" },
    );

    if (!response.ok) return "";

    const payload = await response.json();
    const data = payload?.data ?? payload;
    return String(data?.pageContent ?? data?.content ?? "");
  } catch (error) {
    console.error("LegalPage Error:", error);
    return "";
  }
}

type LegalPageProps = {
  params: Promise<{ type: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegalPage({ params, searchParams }: LegalPageProps) {
  const [{ type: rawType }, query] = await Promise.all([params, searchParams]);
  const type = rawType as LegalPageType;
  const validType = legalTypes.includes(type);
  const title = validType ? legalTitles[type] : "Legal page";
  const rawContent = validType ? await getLegalContent(type) : "";
  const pageContent = validType ? removeDuplicateTitle(rawContent, title) : "";
  const from = Array.isArray(query.from) ? query.from[0] : query.from;
  const returnTo = Array.isArray(query.returnTo) ? query.returnTo[0] : query.returnTo;
  const returnToAccount = from === LEGAL_PAGE_SOURCE.ACCOUNT;
  const returnToRegister = !returnToAccount && returnTo === APP_URL.LINKS.REGISTER;

  const legalContent = (
    <main className="h-full min-h-0 overflow-y-auto overscroll-contain bg-background px-4 py-6 text-foreground sm:px-6 sm:py-8 lg:px-10 lg:py-8">
      <div className="mx-auto">
        <div className="flex items-start justify-between gap-4">
          <AccountPageHeader
            title={title}
            description="Review the latest UnionAI policy information."
            showBack
            backHref={
              returnToAccount
                ? APP_URL.LINKS.ACCOUNT
                : returnToRegister
                  ? APP_URL.LINKS.REGISTER
                  : APP_URL.LINKS.HOME
            }
          />
        </div>

        {pageContent ? (
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
  );

  return returnToAccount ? (
    <DashboardLayout>{legalContent}</DashboardLayout>
  ) : (
    <AuthLayout>{legalContent}</AuthLayout>
  );
}
