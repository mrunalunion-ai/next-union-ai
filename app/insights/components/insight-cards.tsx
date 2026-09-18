"use client";

import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  IAnalysisItem,
  ICoachRecommendation,
  IInsightText,
  IInsightTrendPoint,
} from "@/redux/modules/insights";

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

function formatScore(score: number) {
  return Number.isInteger(score) ? String(score) : score.toFixed(0);
}

export function ScoreTrendCard({
  trend,
  currentScore,
  status,
}: {
  trend: IInsightTrendPoint[];
  currentScore: number;
  status: string;
}) {
  const width = 640;
  const height = 190;
  const maxScore = Math.max(1000, ...trend.map((point) => point.overallScore));
  const points = trend
    .map((point, index) => {
      const x = trend.length === 1 ? width / 2 : (index / (trend.length - 1)) * width;
      const y = height - (point.overallScore / maxScore) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card className="rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-extrabold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Score trend
          </div>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            Weekly relationship alignment
          </p>
        </div>
        <span className="rounded-xl bg-primary/10 px-3 py-2 text-center text-xs font-bold text-primary">
          {formatScore(currentScore)} / 1000
          <span className="block text-[10px] font-medium capitalize text-muted-foreground">
            {status || "stable"}
          </span>
        </span>
      </div>

      {trend.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl bg-background/70 p-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-44 w-full"
            role="img"
            aria-label="Relationship score trend"
          >
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                x2={width}
                y1={height * ratio}
                y2={height * ratio}
                stroke="currentColor"
                className="text-border"
                strokeDasharray="6 6"
              />
            ))}
            <polyline
              fill="none"
              points={points}
              stroke="currentColor"
              className="text-primary"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
            {trend.map((point, index) => {
              const x = trend.length === 1 ? width / 2 : (index / (trend.length - 1)) * width;
              const y = height - (point.overallScore / maxScore) * (height - 20) - 10;
              return <circle key={`${point.label}-${index}`} cx={x} cy={y} r="6" className="fill-background stroke-primary" strokeWidth="3" />;
            })}
          </svg>
          <div className="flex justify-between gap-2 px-1 text-[10px] font-semibold text-muted-foreground">
            {trend.map((point) => <span key={point.label}>{point.label}</span>)}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex h-44 items-center justify-center rounded-2xl bg-background/70 text-sm text-muted-foreground">
          Complete more check-ins to see your trend.
        </div>
      )}
    </Card>
  );
}

const dimensions = [
  ["Emotional connection", "emotionalConnection"],
  ["Communication satisfaction", "communicationSatisfaction"],
  ["Pacing & reciprocity", "pacingAndReciprocity"],
  ["Core trust index", "coreTrustIndex"],
] as const;

export function DimensionsCard({ analysis }: { analysis?: IAnalysisItem }) {
  return (
    <Card className="rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2 text-sm font-extrabold">
        <HeartPulse className="h-5 w-5 text-primary" />
        Core alignment dimensions
      </div>
      <div className="mt-6 space-y-5">
        {dimensions.map(([label, key]) => {
          const score = Math.max(0, Math.min(100, analysis?.[key] ?? 0));
          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-wide">
                <span className="text-muted-foreground">{label}</span>
                <span>{formatScore(score)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${scoreColor(score)} transition-all`} style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AnalysisCard({
  title,
  items,
  type,
}: {
  title: string;
  items: IInsightText[];
  type: "strength" | "gap";
}) {
  const isStrength = type === "strength";
  const Icon = isStrength ? CheckCircle2 : AlertTriangle;

  return (
    <Card className="rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-6">
      <div className={`flex items-center gap-2 text-sm font-extrabold ${isStrength ? "text-emerald-600" : "text-rose-600"}`}>
        <Icon className="h-5 w-5" />
        {title}
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="border-l-2 border-border pl-3">
            <p className="text-sm font-bold">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AlignmentCards({ analysis }: { analysis?: IAnalysisItem }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AnalysisCard title="Core strengths" items={analysis?.coreStrengths ?? []} type="strength" />
      <AnalysisCard title="Alignment gaps & risks" items={analysis?.gapsAndRisks ?? []} type="gap" />
    </div>
  );
}

const recommendationColors: Record<string, string> = {
  high: "border-rose-400",
  low: "border-emerald-400",
  medium: "border-amber-400",
};

export function CoachCard({ recommendation }: { recommendation: ICoachRecommendation }) {
  const borderColor = recommendationColors[recommendation.priority.toLowerCase()] ?? "border-primary";

  return (
    <Card className={`rounded-2xl border-l-4 ${borderColor} border-y-border/70 border-r-border/70 bg-surface p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          {recommendation.category && (
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary">
              {recommendation.category}
            </span>
          )}
          <h3 className="mt-1 text-sm font-extrabold">{recommendation.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{recommendation.description}</p>
        </div>
      </div>
    </Card>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading insights">
      {["trend", "dimensions", "analysis", "coach"].map((item) => (
        <div key={item} className="h-44 animate-pulse rounded-3xl bg-muted" />
      ))}
    </div>
  );
}

export function InsightsEmptyState() {
  return (
    <Card className="rounded-3xl border-border/70 bg-surface p-10 text-center shadow-sm">
      <Sparkles className="mx-auto h-10 w-10 text-primary/60" />
      <h2 className="mt-4 text-lg font-extrabold">Not enough data yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Complete more weekly check-ins together to unlock relationship insights.
      </p>
    </Card>
  );
}
