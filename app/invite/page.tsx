import { Suspense } from "react";
import InviteRedirect from "./invite-redirect";

function InviteLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <p className="text-sm text-muted-foreground">Opening your invite…</p>
    </main>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<InviteLoading />}>
      <InviteRedirect />
    </Suspense>
  );
}
