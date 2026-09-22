"use client";

import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  Heart,
  HeartHandshake,
  Lightbulb,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constant/static";
import { Reveal } from "./components/reveal";

const productFeatures = [
  { icon: ClipboardCheck, title: "Weekly check-ins", text: "Answer thoughtful prompts together and keep both partners part of the conversation." },
  { icon: BarChart3, title: "Relationship analysis", text: "See your Union Score and the patterns revealed by your shared check-ins." },
  { icon: Lightbulb, title: "Practical recommendations", text: "Turn your latest analysis into focused ideas you can use in everyday life." },
  { icon: Target, title: "Shared tasks", text: "Create small relationship tasks, assign them to either partner, and track progress." },
  { icon: MessageCircleHeart, title: "Shared reflections", text: "Keep your relationship details, summaries, and love languages together in one space." },
  { icon: ShieldCheck, title: "Private by design", text: "Your account and relationship information stay inside your connected Union space." },
];

const steps = [
  { number: "01", icon: HeartHandshake, title: "Create or join a Union", text: "Connect with your partner using a Union code and create your shared relationship space." },
  { number: "02", icon: ClipboardCheck, title: "Check in together", text: "Complete the weekly check-in so both perspectives can shape your shared analysis." },
  { number: "03", icon: Sparkles, title: "Understand and act", text: "Review your score, insights, and recommendations, then turn them into meaningful habits." },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{children}</span>;
}

function RelationshipPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] px-3 sm:px-0">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-primary/15 blur-3xl motion-safe:animate-pulse" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface p-3 shadow-2xl shadow-primary/10 sm:p-5">
        <div className="flex items-center justify-between border-b border-border/70 px-2 pb-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Your Union</p><p className="mt-1 text-sm font-bold">A shared space for both of you</p></div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Heart className="h-4 w-4 fill-current" /></div>
        </div>
        <div className="grid gap-3 pt-3 sm:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl bg-background p-4">
            <div className="flex items-center justify-between"><p className="text-xs font-bold">Weekly check-in</p><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600">Together</span></div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Complete your reflections to reveal your latest Union analysis.</p>
            <div className="mt-5 space-y-2">
              {["Your responses", "Partner responses", "Shared analysis"].map((item, index) => <div key={item} className="flex items-center gap-2 text-[11px] font-medium"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${index < 2 ? "bg-primary text-white" : "border border-border text-muted-foreground"}`}>{index < 2 ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />}</span>{item}</div>)}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-background to-rose-500/10 p-4">
            <div className="flex items-center justify-between"><p className="text-xs font-bold">Relationship insights</p><Sparkles className="h-4 w-4 text-primary" /></div>
            <div className="relative mx-auto my-5 flex h-28 w-28 items-center justify-center rounded-full border-[9px] border-primary/20"><div className="absolute inset-[-9px] rounded-full border-[9px] border-transparent border-l-primary border-t-primary motion-safe:animate-[spin_8s_linear_infinite]" /><span className="text-center text-[11px] font-bold leading-4 text-muted-foreground">Score after<br />check-in</span></div>
            <p className="text-center text-[11px] leading-4 text-muted-foreground">Your score and recommendations appear when both partners complete the check-in.</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600"><Target className="h-4 w-4" /></div><div className="min-w-0"><p className="text-xs font-bold">Small steps matter</p><p className="mt-0.5 truncate text-[11px] text-muted-foreground">Keep shared tasks and conversations moving forward.</p></div><ArrowRight className="ml-auto h-4 w-4 shrink-0 text-primary" /></div>
      </div>
      <div className="anim-float absolute -left-2 top-10 hidden items-center gap-2 rounded-xl border border-border/70 bg-surface px-3 py-2 shadow-lg sm:flex"><UsersRound className="h-4 w-4 text-primary" /><span className="text-[10px] font-bold">Connected partners</span></div>
      <div className="anim-float-delay absolute -right-2 bottom-12 hidden items-center gap-2 rounded-xl border border-border/70 bg-surface px-3 py-2 shadow-lg sm:flex"><Lightbulb className="h-4 w-4 text-amber-500" /><span className="text-[10px] font-bold">Actionable insights</span></div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <Header variant="marketing" />
      <main>
        <section className="relative overflow-hidden px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:px-12 lg:pt-12 2xl:pt-20">
          <div aria-hidden className="pointer-events-none absolute inset-0"><div className="anim-blob absolute left-1/2 top-[-12rem] h-[34rem] w-[55rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" /><div className="anim-blob absolute -right-32 top-72 h-80 w-80 rounded-full bg-rose-400/10 blur-3xl [animation-delay:2s]" /><div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_15%,black,transparent)]" /></div>
          <div className="relative mx-auto grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <Reveal><SectionLabel>Relationship intelligence for two</SectionLabel><h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.04] tracking-[-0.055em] sm:text-5xl lg:text-5xl 2xl:text-7xl">Make space for<span className="block bg-gradient-to-r from-primary via-violet-500 to-rose-400 bg-clip-text text-transparent motion-safe:animate-[pulse_5s_ease-in-out_infinite]">better conversations.</span></h1><p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">UnionAI gives couples one shared place to connect, check in, understand their relationship, and take the next small step together.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild className="h-12 rounded-xl px-6 shadow-lg shadow-primary/20"><Link href={APP_URL.LINKS.REGISTER}>Create your Union<ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild variant="outline" className="h-12 rounded-xl px-6"><a href="#how-it-works">See how it works</a></Button></div><div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" />Private relationship space</span><span className="inline-flex items-center gap-2"><Heart className="h-4 w-4 fill-rose-400 text-rose-400" />Built for both partners</span></div></Reveal>
            <Reveal delay={140}><RelationshipPreview /></Reveal>
          </div>
        </section>

        <section id="how-it-works" className="bg-surface/50 px-5 py-16 sm:px-8 sm:py-20 lg:px-12"><div className="mx-auto"><Reveal><div className="max-w-2xl"><SectionLabel>A simple shared rhythm</SectionLabel><h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">From connection to meaningful action.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">UnionAI keeps the journey clear: connect with your partner, reflect together, and use what you learn.</p></div></Reveal><div className="mt-10 grid gap-4 md:grid-cols-3">{steps.map(({ number, icon: Icon, title, text }, index) => <Reveal key={number} delay={index * 90}><div className="group h-full rounded-2xl border border-border/70 bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 sm:p-6"><div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><Icon className="h-5 w-5" /></div><span className="text-sm font-extrabold text-primary/40">{number}</span></div><h3 className="mt-6 text-base font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div></Reveal>)}</div></div></section>

        <section id="features" className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto"><Reveal><div className="mx-auto max-w-2xl text-center"><SectionLabel>What you can do together</SectionLabel><h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Everything stays connected to your relationship.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Each part of the experience supports the same goal: helping both partners understand and care for the relationship.</p></div></Reveal><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{productFeatures.map(({ icon: Icon, title, text }, index) => <Reveal key={title} delay={index * 65}><div className="group h-full rounded-2xl border border-border/70 bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 sm:p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-white"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-base font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div></Reveal>)}</div></div></section>

        <section id="methodology" className="px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12"><Reveal><div className="mx-auto grid items-center gap-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.12] via-surface to-rose-500/[0.08] p-6 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:p-14"><div><SectionLabel>Designed for reflection</SectionLabel><h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">The insight is only useful when it helps you move forward.</h2><p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">Your check-ins create the context. Your Union Score and insights make the patterns easier to see. Shared tasks and recommendations help turn that understanding into action.</p><Button asChild variant="outline" className="mt-7 rounded-xl"><Link href={APP_URL.LINKS.REGISTER}>Start your shared space<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div><div className="grid gap-3 sm:grid-cols-2">{["Both perspectives matter", "Insights follow your check-ins", "Recommendations stay practical", "Progress belongs to both of you"].map((item, index) => <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-surface/80 p-4 shadow-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600"><Check className="h-3.5 w-3.5" /></span><span className="text-sm font-semibold leading-5">{item}</span>{index === 0 && <HeartHandshake className="ml-auto h-4 w-4 shrink-0 text-primary" />}</div>)}</div></div></Reveal></section>

        <section id="pricing" className="bg-surface/50 px-5 py-16 sm:px-8 sm:py-20 lg:px-12"><Reveal><div className="mx-auto flex flex-col items-start justify-between gap-6 rounded-3xl border border-border/70 bg-background p-6 sm:p-8 md:flex-row md:items-center lg:p-10"><div><SectionLabel>Plans for your journey</SectionLabel><h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Choose the plan that fits your shared rhythm.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Explore the available durations, included features, trial eligibility, and subscription details inside your account.</p></div><Button asChild className="shrink-0 rounded-xl"><Link href={APP_URL.LINKS.REGISTER}>Explore plans<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></Reveal></section>

        <section id="faq" className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><Reveal><div className="mx-auto max-w-3xl"><div className="text-center"><SectionLabel>Good to know</SectionLabel><h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">A shared experience, one step at a time.</h2></div><div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border/70 bg-surface">{[["Do we both need an account?", "UnionAI is designed for two connected partners. Create or join a Union so both perspectives can be part of your shared experience."], ["When do insights become available?", "Complete the weekly check-in together. Once both responses are available, your relationship analysis and insights can be shown."], ["Can we use tasks between check-ins?", "Yes. Shared tasks let you turn recommendations and everyday intentions into trackable actions for either partner."]].map(([question, answer]) => <details key={question} className="group p-5 open:bg-primary/[0.04] sm:p-6"><summary className="cursor-pointer list-none pr-8 text-sm font-bold marker:hidden">{question}<span className="float-right text-xl font-normal text-primary transition-transform group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{answer}</p></details>)}</div></div></Reveal></section>

        <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12"><Reveal><div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-[#5741c7] via-[#7253e5] to-[#9b75f4] p-8 text-center text-white shadow-2xl shadow-primary/25 sm:p-12"><div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[28px] border-white/10" /><div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full border-[28px] border-white/10" /><Heart className="relative mx-auto h-8 w-8 fill-white/20 text-white" /><h2 className="relative mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Start with one conversation.</h2><p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80">Create your Union and make your relationship part of the conversation you choose to keep having.</p><Button asChild variant="secondary" className="relative mt-7 rounded-xl bg-white px-6 text-primary hover:bg-white/90"><Link href={APP_URL.LINKS.REGISTER}>Create your Union<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></Reveal></section>
      </main>
      <Footer />
    </div>
  );
}
