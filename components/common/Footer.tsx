import { Heart, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/app/layout";
import { APP_URL } from "@/constant/static";

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Twitter", href: "https://x.com", icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
];

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Methodology", href: "#methodology" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Methodology", href: "#methodology" },
      { label: "About Union AI", href: APP_URL.LINKS.ABOUT },
      { label: "Sign in", href: APP_URL.LINKS.LOGIN },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Get started", href: APP_URL.LINKS.REGISTER },
      { label: "Contact us", href: "mailto:hello@unionai.app" },
      { label: "Privacy & Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-surface">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-12">
        <div className="max-w-sm">
          <Link
            href={APP_URL.LINKS.HOME}
            className="inline-flex items-center gap-2.5"
            aria-label={`${APP_NAME} home`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#9b75f4] shadow-lg shadow-primary/20">
              <Heart className="h-5 w-5 text-white" fill="currentColor" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              Union
              <span className="bg-gradient-to-r from-[#5741c7] via-[#7253e5] to-[#e85d9e] bg-clip-text text-transparent">
                AI
              </span>
            </span>
          </Link>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Union AI empowers modern couples to master emotional connection and resolution through real-time communication analysis.
          </p>

          <div className="mt-6 flex items-center gap-2">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:text-white hover:shadow-lg hover:shadow-primary/25"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#e85d9e] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Icon className="relative h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground">
              {column.title}
            </p>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="h-px w-0 bg-gradient-to-r from-primary to-[#e85d9e] transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-[11px] text-muted-foreground sm:flex-row sm:px-8 lg:px-12">
          <p>
            © 2026 Union Tech Inc. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Made with
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
            for couples who grow together
          </p>
        </div>
      </div>
    </footer>
  );
}