import {
  ArrowRight,
  BarChart3,
  BellRing,
  BrainCircuit,
  Check,
  ChevronDown,
  Heart,
  Lightbulb,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constant/static";
import { AnimatedCounter, Reveal } from "./components/reveal";
import { Header } from "./components/headers";

const featureCards = [
  { icon: BrainCircuit, title: "AI Relationship Analysis", text: "Understand patterns and strengthen your connection with intelligent insights." },
  { icon: BarChart3, title: "Weekly Check-ins", text: "Stay connected through thoughtful prompts and shared reflections." },
  { icon: Target, title: "Communication Score", text: "See how your conversations are evolving over time." },
  { icon: Lightbulb, title: "Personalized Recommendations", text: "Get practical ideas tailored to your relationship." },
  { icon: MessageCircleHeart, title: "AI Conversation Coach", text: "Find the right words for the moments that matter most." },
  { icon: Users, title: "Partner Tasks", text: "Turn small moments into meaningful habits you build together." },
  { icon: TrendingUp, title: "Relationship Timeline", text: "Track shared milestones and your journey as a couple." },
  { icon: BellRing, title: "Smart Notifications", text: "Gentle reminders help you stay intentional, never overwhelmed." },
];

const testimonials = [
  ["We feel more connected than ever. The check-ins give us a simple way to talk about the things we usually skip.", "Sarah & Michael", "Together for 4 years"],
  ["The weekly insights helped us see our patterns and celebrate the progress we were already making.", "Maya & Jordan", "Together for 2 years"],
  ["It feels like having a thoughtful guide for our relationship, without taking away what makes it ours.", "Lisa & Tom", "Together for 7 years"],
];

const pricingCards = [
  {
    name: "Free",
    price: "$0",
    subtitle: "For couples getting started",
    points: ["Daily Love Language Nudges", "Basic Weekly Insights", "Shared Union Space"],
  },
  {
    name: "Most Popular",
    price: "$8.99",
    subtitle: "For couples growing intentionally",
    points: ["Full Relationship Intelligence", "AI Coach & Insights", "Personalized Recommendations", "Unlimited Check-ins"],
  },
  {
    name: "Premium",
    price: "$15.99",
    subtitle: "For couples investing deeply",
    points: ["Everything in Premium", "Advanced AI Reports", "Priority Support", "Early Access"],
  },
];

const stats: { value: number; suffix: string; label: string; decimals?: number }[] = [
  { value: 91, suffix: "%", label: "Improved understanding" },
  { value: 250, suffix: "k+", label: "Check-ins completed" },
  { value: 92, suffix: "%", label: "Accuracy rating" },
  { value: 4.9, decimals: 1, suffix: "★", label: "App love score" },
];

const loveWords = [
  "Quality Time",
  "Acts of Service",
  "Words of Affirmation",
  "Physical Touch",
  "Receiving Gifts",
  "Weekly Check-ins",
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-primary/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
      {children}
    </span>
  );
}

function MiniPhone({ score, color = "primary", className = "" }: { score: string; color?: "primary" | "emerald" | "orange"; className?: string }) {
  const colorClass = color === "emerald" ? "text-emerald-500" : color === "orange" ? "text-orange-500" : "text-primary";
  return (
    <div className={`relative h-56 w-28 rounded-[22px] border-[3px] border-slate-900 bg-surface p-2 shadow-xl sm:h-64 sm:w-32 ${className}`}>
      <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-900" />
      <div className="rounded-xl bg-background p-2 text-center">
        <p className="text-[7px] font-bold text-muted-foreground">TODAY&apos;S CONNECTION</p>
        <div className={`mx-auto my-3 flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-current text-lg font-extrabold ${colorClass}`}>
          {score}
        </div>
        <p className="text-[7px] font-semibold text-foreground">You&apos;re doing great</p>
        <div className="mt-3 h-5 rounded-md bg-primary text-[6px] font-bold leading-5 text-white">View insights</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }: (typeof featureCards)[number]) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/10">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/25">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}

function InterestsMarquee() {
  const items = [...loveWords, ...loveWords];
  return (
    <section aria-label="What Union AI measures" className="relative border-y border-border/50 bg-surface/70 py-5">
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="anim-marquee flex w-max items-center gap-10 px-10">
          {items.map((word, index) => (
            <span key={`${word}-${index}`} className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <Header />
      <main>
        <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:px-8 lg:pt-14">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="anim-blob absolute left-1/2 top-0 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="anim-blob absolute -left-24 top-44 h-72 w-72 rounded-full bg-[#e85d9e]/10 blur-3xl [animation-delay:2s]" />
            <div className="anim-blob absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#7253e5]/10 blur-3xl [animation-delay:4s]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
          </div>

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <Reveal>
              <SectionEyebrow>AI-powered relationship intelligence</SectionEyebrow>
              <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-[-0.055em] sm:text-6xl">
                Build Stronger
                <br /> Relationships with
                <br />{" "}
                <span className="anim-gradient-shift bg-gradient-to-r from-[#5741c7] via-[#7253e5] to-[#e85d9e] bg-clip-text text-transparent">
                  AI Intelligence
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                Union AI helps couples measure communication, resilience, conflict, and future goals—then turns those insights into practical habits, daily check-ins, and meaningful conversations.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="group h-11 rounded-lg px-10 shadow-lg shadow-primary/20">
                  <Link href={APP_URL.LINKS.REGISTER}>
                    Start Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-lg px-6">
                  <a href="#methodology">
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    Explore Methodology
                  </a>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex -space-x-2">
                  {["A", "M", "J", "S"].map((letter, index) => (
                    <span
                      key={letter}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white transition-transform duration-300 hover:-translate-y-1 ${["bg-violet-500", "bg-rose-400", "bg-amber-500", "bg-emerald-500"][index]}`}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
                <span>
                  <strong className="text-foreground">12,000+</strong> couples growing together
                </span>
              </div>
            </Reveal>

            <Reveal delay={150} className="relative">
              <div className="relative mx-auto h-[370px] w-full max-w-[560px] sm:h-[450px]">
                <div className="anim-float absolute left-[35%] top-[5%] h-[285px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border-[4px] border-slate-900 bg-surface p-3 shadow-2xl sm:h-[400px] sm:w-[210px]">
                  <div className="mx-auto mb-6 h-2 w-14 rounded-full bg-slate-900" />
                  <div className="rounded-2xl bg-background p-3 text-center">
                    <Heart className="mx-auto h-5 w-5 fill-rose-400 text-rose-400" />
                    <p className="mt-2 text-[9px] font-bold">Your Relationship Score</p>
                    <div className="relative mx-auto my-6 flex h-24 w-24 items-center justify-center rounded-full border-[7px] border-primary text-3xl font-extrabold text-primary">
                      <span className="anim-pulse-ring absolute inset-0 rounded-full border border-primary" />
                      92
                    </div>
                    <div className="h-7 rounded-lg bg-primary text-[8px] font-bold leading-7 text-white">See your insights</div>
                  </div>
                </div>
                <div className="anim-float-delay absolute left-0 top-20 rounded-xl border border-primary/20 bg-surface p-3 shadow-xl sm:left-[6rem]">
                  <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-[9px] font-bold">Weekly insight</span></div>
                  <p className="mt-2 text-[9px] text-muted-foreground">You&apos;re communicating<br />more openly this week.</p>
                </div>
                <div className="anim-float absolute right-0 top-8 rounded-xl border border-primary/20 bg-surface p-3 shadow-xl sm:right-[6rem] [animation-delay:1.2s]">
                  <p className="text-[9px] font-bold text-primary">+12% this week</p><p className="mt-1 text-[8px] text-muted-foreground">Connection score</p>
                </div>
                <div className="anim-float-delay absolute bottom-10 right-0 rounded-xl border border-primary/20 bg-surface p-3 shadow-xl [animation-delay:2.4s] sm:right-[6rem]">
                  <p className="text-[9px] font-bold">Today&apos;s check-in</p><p className="mt-1 text-[8px] text-muted-foreground">Take a moment together →</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <InterestsMarquee />

        <section id="insights" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <Reveal>
            <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border rounded-2xl border border-border/50 bg-surface py-6 shadow-sm sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="px-3 text-center">
                  <p className="text-xl font-extrabold text-primary sm:text-2xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
                  </p>
                  <p className="mt-1 text-[9px] font-medium text-muted-foreground sm:text-[10px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="features" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="mx-auto max-w-xl text-center">
                <SectionEyebrow>Everything you need</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Scientific Features Crafted for Intimacy</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Built on relationship science and designed for real life. Feel closer, communicate better, and grow together.</p>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((card, index) => (
                <Reveal key={card.title} delay={index * 70}>
                  <FeatureCard {...card} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <Reveal>
            <div className="mx-auto max-w-6xl rounded-3xl bg-[#100b2d] p-6 text-white shadow-2xl shadow-primary/15 sm:p-10 lg:p-14">
              <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                <div>
                  <SectionEyebrow>See the bigger picture</SectionEyebrow>
                  <h2 className="mt-4 max-w-lg text-3xl font-extrabold tracking-tight sm:text-4xl">Real-time Intelligence at a Glance</h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">Turn everyday moments into a clear picture of what is working, where you are growing, and how to keep moving forward.</p>
                </div>
                {/* <Button className="w-fit rounded-lg bg-violet-500 text-white hover:bg-violet-400">
                  Explore insights <ArrowRight className="ml-2 h-4 w-4" />
                </Button> */}
              </div>
              <div className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-xl bg-[#090620] p-5">
                  <p className="text-xs text-white/50">Relationship score</p>
                  <p className="mt-2 text-5xl font-extrabold">88</p>
                  <p className="mt-2 text-xs text-emerald-400">↑ 12% from last month</p>
                  <div className="mt-8 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white/5 p-3"><p className="text-xl font-bold">94</p><p className="text-[9px] text-white/50">Communication</p></div>
                    <div className="rounded-lg bg-white/5 p-3"><p className="text-xl font-bold">87</p><p className="text-[9px] text-white/50">Emotional safety</p></div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#090620] p-5">
                  <div className="flex justify-between text-xs text-white/50"><span>Connection growth</span><span>This month</span></div>
                  {[["Quality time", "84%", "bg-violet-500"], ["Emotional safety", "76%", "bg-fuchsia-400"], ["Conflict resolution", "91%", "bg-cyan-400"], ["Shared vision", "68%", "bg-emerald-400"]].map(([name, value, color]) => (
                    <div key={name} className="mt-5">
                      <div className="flex justify-between text-xs"><span>{name}</span><span className="text-white/50">{value}</span></div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10"><div className={`h-full rounded-full ${color}`} style={{ width: value }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="mx-auto max-w-xl text-center">
                <SectionEyebrow>Your relationship companion</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Everywhere You Go, Together</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">A thoughtful companion that helps you stay connected, wherever life takes you.</p>
              </div>
            </Reveal>
            <div className="mt-12 flex justify-center gap-3 sm:gap-8">
              <Reveal delay={100}><MiniPhone score="74" color="orange" className="anim-float mt-8" /></Reveal>
              <Reveal delay={250}><MiniPhone score="95" /></Reveal>
              <Reveal delay={400}><MiniPhone score="88" color="emerald" className="anim-float-delay mt-8" /></Reveal>
            </div>
          </div>
        </section>

        <section id="methodology" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <Reveal>
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl bg-[#160b35] p-6 text-white shadow-xl sm:p-8">
                <SectionEyebrow>Understand what matters</SectionEyebrow>
                <h3 className="mt-4 text-2xl font-extrabold">Neural Sentiment &amp; Conflict Prediction</h3>
                <div className="relative mt-8 h-40">
                  <div className="absolute left-8 top-12 h-px w-44 rotate-[-18deg] bg-violet-400" />
                  <div className="absolute left-20 top-24 h-px w-36 rotate-[16deg] bg-cyan-400" />
                  {[["left-6 top-10", "bg-violet-500"], ["left-24 top-0", "bg-blue-400"], ["left-40 top-20", "bg-fuchsia-500"], ["left-16 top-28", "bg-emerald-400"], ["right-4 top-16", "bg-pink-500"]].map(([position, color]) => (
                    <span key={position} className={`anim-blob absolute h-3 w-3 rounded-full ${position} ${color} shadow-[0_0_12px_currentColor]`} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/10 p-3 text-xs"><strong>92%</strong><br /><span className="text-white/50">confidence</span></div>
                  <div className="rounded-lg bg-emerald-400/15 p-3 text-xs text-emerald-300"><strong>Positive trend</strong><br /><span className="text-white/50">this month</span></div>
                </div>
              </div>
              <div>
                <SectionEyebrow>Six pillars of harmony</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">A more complete picture of your connection</h2>
                <div className="mt-6 space-y-3">
                  {[[ShieldCheck, "Communication Analysis", "See how your words create safety and understanding."], [Heart, "Emotional Intelligence", "Build awareness around feelings, needs, and reactions."], [Zap, "Conflict Prediction", "Spot friction early and turn it into a conversation."], [Sparkles, "Personalized Suggestions", "Get recommendations that fit your unique relationship."]].map(([Icon, title, text]) => (
                    <div key={title as string} className="group flex gap-4 rounded-xl border border-border/60 bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{title as string}</h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{text as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <Reveal>
            <div className="mx-auto max-w-5xl rounded-3xl border border-border/60 bg-surface p-6 shadow-sm sm:p-10 lg:p-14">
              <div className="mx-auto max-w-xl text-center">
                <SectionEyebrow>Measure what matters</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Quantifying What Matters Most</h2>
                <p className="mt-3 text-sm text-muted-foreground">Track the small signals that make a big difference.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[["94", "Communication"], ["87", "Emotional safety"], ["88", "Shared goals"], ["92", "Quality time"]].map(([score, label]) => (
                  <div key={label} className="rounded-xl border border-border/60 bg-background p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
                    <p className="text-2xl font-extrabold text-primary">{score}<span className="text-xs text-muted-foreground">/100</span></p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
                    <span className="mt-2 inline-block text-[8px] font-bold text-emerald-500">Excellent</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <h3 className="text-sm font-bold">Interactive Relationship Health Estimator</h3>
                  {[["Quality Time Together", "8.7/10"], ["Communication Satisfaction", "7.8/10"], ["Emotional Safety & Trust", "9.1/10"]].map(([label, value], index) => (
                    <div key={label} className="mt-5">
                      <div className="flex justify-between text-xs"><span>{label}</span><span className="font-semibold text-primary">{value}</span></div>
                      <div className="mt-2 h-2 rounded-full bg-secondary"><div className={`h-full rounded-full ${index === 1 ? "bg-fuchsia-400" : "bg-primary"}`} style={{ width: `${[87, 78, 91][index]}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl bg-background p-5 text-center">
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[12px] border-primary text-3xl font-extrabold text-primary">
                    <span className="anim-pulse-ring absolute inset-0 rounded-full border border-primary" />
                    82
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Overall relationship health</p>
                  <Button className="mt-4 h-9 rounded-lg text-xs">View full report</Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="mx-auto max-w-xl text-center">
                <SectionEyebrow>Loved by 12,000+ couples worldwide</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Real couples. Real growth.</h2>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {testimonials.map(([quote, name, detail], index) => (
                <Reveal key={name} delay={index * 100}>
                  <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10">
                    <div className="text-xs tracking-[0.2em] text-amber-400">★★★★★</div>
                    <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">“{quote}”</p>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5741c7] to-[#e85d9e] text-xs font-bold text-white">{name[0]}</div>
                      <div>
                        <p className="text-xs font-bold">{name}</p>
                        <p className="text-[10px] text-muted-foreground">{detail}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="mx-auto max-w-xl text-center">
                <SectionEyebrow>Invest in your shared future</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Choose Your Journey</h2>
                <p className="mt-3 text-sm text-muted-foreground">Start free and upgrade when you are ready to go deeper together.</p>
              </div>
            </Reveal>
            <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
              {pricingCards.map((plan, index) => (
                <Reveal key={plan.name} delay={index * 100}>
                  <div className={`relative flex h-full flex-col rounded-2xl border p-6 ${index === 1 ? "border-primary bg-surface shadow-xl shadow-primary/15 ring-1 ring-primary/20" : "border-border/60 bg-surface shadow-sm"}`}>
                    {index === 1 && (
                      <span className="anim-blob absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#5741c7] via-[#7253e5] to-[#e85d9e] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/25">Most popular</span>
                    )}
                    <h3 className="text-sm font-bold">{plan.name}</h3>
                    <p className="mt-4 text-3xl font-extrabold">{plan.price}<span className="text-xs font-medium text-muted-foreground">/month</span></p>
                    <p className="mt-2 text-xs text-muted-foreground">{plan.subtitle}</p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.points.map((point) => <li key={point} className="flex gap-2 text-xs text-muted-foreground"><Check className="h-4 w-4 shrink-0 text-emerald-500" />{point}</li>)}
                    </ul>
                    <Button asChild variant={index === 1 ? "default" : "outline"} className="mt-7 w-full rounded-lg">
                      <Link href={APP_URL.LINKS.REGISTER}>{index === 1 ? "Start Premium Free" : "Get Started"}</Link>
                    </Button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <SectionEyebrow>Frequently asked</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Everything You Need to Know</h2>
              </div>
              <div className="mt-8 divide-y divide-border rounded-2xl border border-border/60 bg-surface px-5 shadow-sm">
                {["How does Union AI help couples communicate?", "Does the AI listen to our private conversations?", "Can we use Union AI on different devices?", "What happens after our free trial ends?"].map((question) => (
                  <details key={question} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold transition-colors hover:text-primary">
                      {question}
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 max-w-2xl text-xs leading-5 text-muted-foreground">Union AI gives you private, practical insights based on the check-ins and reflections you choose to share. You stay in control of your information and your relationship journey.</p>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12">
          <Reveal>
            <div className="anim-gradient-shift relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#51228e] via-[#7138b0] to-[#8b42c8] px-6 py-12 text-center text-white shadow-2xl shadow-primary/20 sm:px-10">
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />
              <SectionEyebrow>Start your next chapter</SectionEyebrow>
              <h2 className="mx-auto mt-4 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">Start Building Stronger Relationships Today</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/75">Join thousands of couples using intelligent tools to create a more connected future.</p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild className="group rounded-lg bg-white text-primary hover:bg-white/90">
                  <Link href={APP_URL.LINKS.REGISTER}>
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-lg border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <a href="#features">Learn more</a>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}