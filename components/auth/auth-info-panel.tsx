import { APP_URL } from "@/constant/static";
import {
  Check,
  HeartHandshake,
  LockKeyhole,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

type AuthInfoPanelMode = "login" | "recovery";

interface AuthInfoPanelProps {
  mode?: AuthInfoPanelMode;
}

const panelContent = {
  login: {
    eyebrow: "Your shared relationship space",
    title: "Make room for better conversations.",
    description:
      "UnionAI helps couples turn honest check-ins into clearer understanding, meaningful habits, and steady progress together.",
    features: [
      {
        icon: MessageCircleHeart,
        title: "Check in together",
        description: "Share what matters in a calm, guided way.",
      },
      {
        icon: Sparkles,
        title: "Find your next step",
        description: "Get thoughtful insights shaped around your relationship.",
      },
      {
        icon: HeartHandshake,
        title: "Grow as a team",
        description: "Build small habits that create lasting connection.",
      },
    ],
  },
  recovery: {
    eyebrow: "Your relationship journey is worth protecting",
    title: "Get back to the conversations that matter.",
    description:
      "We’ll help you securely recover access to your UnionAI account so you can continue checking in and growing together.",
    features: [
      {
        icon: ShieldCheck,
        title: "Secure account recovery",
        description: "A verification code helps keep your account protected.",
      },
      {
        icon: LockKeyhole,
        title: "Your privacy matters",
        description: "Your relationship reflections stay connected to your account.",
      },
      {
        icon: HeartHandshake,
        title: "Continue together",
        description: "Return to your shared space when you’re ready.",
      },
    ],
  },
} as const;

export function AuthInfoPanel({ mode = "login" }: AuthInfoPanelProps) {
  const content = panelContent[mode];

  return (
    <aside className="relative hidden min-h-0 overflow-hidden bg-gradient-to-br from-[#3d267d] via-[#6045c7] to-[#9b75f4] lg:flex lg:w-1/2 lg:items-center lg:justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-32 h-[30rem] w-[30rem] rounded-full bg-[#b8a7ff]/20 blur-3xl" />
        <div className="absolute -bottom-44 -right-28 h-[32rem] w-[32rem] rounded-full bg-[#f3b7dc]/15 blur-3xl" />
        <div className="absolute left-[10%] top-[16%] h-44 w-44 rounded-full border border-white/15" />
        <div className="absolute bottom-[10%] right-[8%] h-64 w-64 rounded-full border border-white/10" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 anim-pulse-ring" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 anim-pulse-ring" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 flex text-center w-full max-w-2xl flex-col px-8 py-10 text-white xl:px-14">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image
            src={APP_URL.IMAGES.LOGO_BADGE}
            alt="UnionAI"
            width={70}
            height={70}
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">{content.eyebrow}</p>
        <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
          {content.title}
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/75 xl:text-base">
          {content.description}
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {content.features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="anim-fade-in-delay rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.14]"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold">{title}</p>
              <p className="mt-2 text-xs leading-5 text-white/65">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs font-medium text-white/65">
          <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          Private, practical, and built for both of you
        </div>
      </div>
    </aside>
  );
}
