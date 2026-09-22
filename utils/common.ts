import { APP_URL } from "@/constant/static";

export function formatDate(date: string | number | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function formatDateDDMMYYYY(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export type OnboardingStep =
  | "notStarted"
  | "accountCreated"
  | "relationshipDetailsCompleted"
  | "unionCodeCreated"
  | "unionCodeJoining"
  | "partnerVerified"
  | "connectionRequestSent"
  | "connectionRequestReceived"
  | "connected";


export const onboardingRoutes: Record<OnboardingStep, string> = {
  notStarted: APP_URL.LINKS.REGISTER,
  accountCreated: APP_URL.LINKS.RELATIONSHIP_DETAILS,
  relationshipDetailsCompleted: APP_URL.LINKS.CREATE_UNION,
  unionCodeCreated: APP_URL.LINKS.CODE_CREATED,
  unionCodeJoining: APP_URL.LINKS.REGISTER,
  partnerVerified: APP_URL.LINKS.JOIN_UNION,
  connectionRequestSent: APP_URL.LINKS.JOIN_UNION,
  connectionRequestReceived: APP_URL.LINKS.CODE_CREATED,
  connected: APP_URL.LINKS.DASHBOARD,
};