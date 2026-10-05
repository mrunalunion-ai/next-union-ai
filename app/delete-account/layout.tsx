import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Account",
  description:
    "Request deletion of your UnionAI account and personal data. Find out how to remove your account from our platform.",
  alternates: {
    canonical: "/delete-account",
  },
  robots: { index: true, follow: true },
};

export default function DeleteAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}