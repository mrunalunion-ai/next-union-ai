"use client";

import { Check, Send } from "lucide-react";
import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubscribed(true);
    setEmail("");
  };

  if (subscribed) {
    return (
      <div
        role="status"
        className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
      >
        <Check className="h-4 w-4 shrink-0" />
        You&apos;re on the list. See you soon!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#9b75f4] text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:brightness-110 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}