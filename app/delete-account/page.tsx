import type { Metadata } from "next";
import DeleteAccountView from "./view";

export const metadata: Metadata = {
  description:
    "Request permanent deletion of your UnionAI account, and associated data.",
  alternates: {
    canonical: "/delete-account",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DeleteAccountPage() {
  return (
    <>
      <DeleteAccountView />
    </>
  );
}