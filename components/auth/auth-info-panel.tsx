import { BrainCircuit, Check, HeartPulse, Sparkles } from "lucide-react";


export function AuthInfoPanel() {
  return (
    <aside className="relative hidden h-full min-h-0 overflow-hidden bg-gradient-to-br from-[#5741c7] via-[#7253e5] to-[#9b75f4] lg:flex lg:w-1/2 lg:items-center lg:justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-32 h-[30rem] w-[30rem] rounded-full bg-[#b8a7ff]/20 blur-3xl" />
        <div className="absolute -bottom-44 -right-28 h-[32rem] w-[32rem] rounded-full bg-[#d3c8ff]/15 blur-3xl" />
        <div className="absolute left-[12%] top-[18%] h-44 w-44 rounded-full border border-white/15" />
        <div className="absolute bottom-[12%] right-[10%] h-64 w-64 rounded-full border border-white/10" />
      </div>

      {/* soft dot-grid texture for depth, kept subtle so it reads as material, not noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 anim-pulse-ring" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 anim-pulse-ring" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 flex max-w-xl flex-col items-center px-6 text-center text-white sm:px-10 xl:px-16">
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/65 sm:text-xs">Relationship wellness, reimagined</p>
        <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">Know where you stand. Grow together.</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/75 sm:text-base">
          UnionAI turns regular check-ins into a clear relationship health score and practical next steps for both of you.
        </p>

        <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
          <div
            className="anim-fade-in-delay rounded-xl border border-white/15 bg-white/10 p-3 text-left backdrop-blur-sm
                       transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.14]"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white/85">
              <HeartPulse className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-white/70">Health score</span>
            <p className="mt-1 text-2xl font-extrabold">84</p>
            <p className="mt-0.5 text-[0.7rem] text-white/65">Built from check-ins</p>
          </div>
          <div
            className="anim-fade-in-delay rounded-xl border border-white/15 bg-white/10 p-3 text-left backdrop-blur-sm
                       transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.14]"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white/85">
              <BrainCircuit className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-white/70">AI insights</span>
            <p className="mt-1 text-sm font-bold">Made for you</p>
            <p className="mt-0.5 text-[0.7rem] text-white/65">Guidance that adapts</p>
          </div>
          <div
            className="anim-fade-in-delay rounded-xl border border-white/15 bg-white/10 p-3 text-left backdrop-blur-sm
                       transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.14]"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white/85">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-white/70">Next step</span>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold"><Check className="h-4 w-4" aria-hidden="true" /> Keep connected</p>
            <p className="mt-0.5 text-[0.7rem] text-white/65">Small actions, lasting change</p>
          </div>
        </div>
      </div>
    </aside>
  );
}