"use client";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { APP_URL } from "@/constant/static";

const APP_NAME = "UnionAI";

const appLinks = [
  {
    label: "Google Play",
    href: "https://play.google.com/store/apps",
    image: "/assets/images/play_store.svg",
  },
  {
    label: "App Store",
    href: "https://www.apple.com/app-store/",
    image: "/assets/images/apple_store.svg",
  },
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
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: `${APP_URL.LINKS.LEGAL}/terms` },
      { label: "Privacy Policy", href: `${APP_URL.LINKS.LEGAL}/privacy` },
      { label: "Subscription Policy", href: `${APP_URL.LINKS.LEGAL}/subscription` },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#121225] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9b75f4] to-transparent" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-72 w-72 rounded-full bg-[#e85d9e]/10 blur-3xl" />

      <div className="relative mx-auto grid w-full gap-10 px-5 py-12 sm:grid-cols-2 sm:px-8 sm:py-14 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-12 lg:px-12">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            href={APP_URL.LINKS.HOME}
            className="inline-flex items-center gap-2.5"
            aria-label={`${APP_NAME} home`}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
              <Image
                width={56}
                height={56}
                src={APP_URL.IMAGES.LOGO_BADGE}
                alt="UnionAI"
                className="h-12 w-12 object-contain sm:h-14 sm:w-14"
              />
            </div>
              <Image
                width={110}
                height={110}
                src={APP_URL.IMAGES.LIGHT_LOGO}
                alt="UnionAI"
              />
          </Link>
          <p className="mt-4 max-w-sm text-xs leading-6 text-white/60 sm:text-sm">
            Union AI empowers modern couples to master emotional connection and resolution through real-time communication analysis.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {appLinks.map(({ label, href, image }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group inline-flex h-10 w-[135px] overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 sm:h-11 sm:w-[148px]"
              >
                <Image src={image} alt={`Download UnionAI on ${label}`} width={135} height={40} className="h-full w-full object-fill" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              {column.title}
            </p>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
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

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex w-full flex-col items-center justify-between gap-3 px-5 py-5 text-center text-[11px] text-white/50 sm:flex-row sm:px-8 sm:text-left lg:px-12">
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
