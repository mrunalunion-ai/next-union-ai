"use client";

import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

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
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const width = 420;
  const height = 250;
  const plotLeft = 42;
  const plotRight = 12;
  const plotTop = 12;
  const plotBottom = 34;
  const plotWidth = width - plotLeft - plotRight;
  const plotHeight = height - plotTop - plotBottom;
  const maxScore = 1000;
  const getX = (index: number) =>
    trend.length === 1
      ? plotLeft + plotWidth / 2
      : plotLeft + (index / (trend.length - 1)) * plotWidth;
  const getY = (score: number) =>
    plotTop + plotHeight - (Math.max(0, Math.min(score, maxScore)) / maxScore) * plotHeight;
  const points = trend.map((point, index) => `${getX(index)},${getY(point.overallScore)}`).join(" ");
  const yAxisValues = [1000, 750, 500, 250, 0];

  return (
    <Card className="rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide sm:text-sm">
            <TrendingUp className="h-5 w-5 text-primary" />
            Score trend
          </div>
          <p className="mt-1 max-w-[170px] text-[11px] leading-4 text-muted-foreground sm:max-w-none sm:text-xs">
            (Past weeks) Calculated weekly relationship union score
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1.5 text-right text-[10px] font-bold leading-3 text-primary sm:px-3 sm:py-2 sm:text-xs sm:leading-4">
          Current: {formatScore(currentScore)} / 1000
          <span className="block max-w-[92px] text-[9px] font-semibold uppercase leading-3 text-primary/80 sm:max-w-none sm:text-[10px]">
            {status || "stable"}
          </span>
        </span>
      </div>

      {trend.length > 0 ? (
        <div className="mt-5 min-w-0 overflow-hidden rounded-2xl bg-background/70 px-2 pb-2 pt-3 sm:px-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            className="block h-auto max-h-[270px] w-full"
            role="img"
            aria-label="Relationship score trend"
          >
            {yAxisValues.map((value) => {
              const y = getY(value);
              return (
                <g key={value}>
                  <line
                    x1={plotLeft}
                    x2={width - plotRight}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    className="text-border/70"
                    strokeDasharray="5 6"
                  />
                  <text
                    x={plotLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-muted-foreground"
                    fontSize="11"
                  >
                    {value}
                  </text>
                </g>
              );
            })}
            <line
              x1={plotLeft}
              x2={width - plotRight}
              y1={plotTop + plotHeight}
              y2={plotTop + plotHeight}
              stroke="currentColor"
              className="text-border"
            />
            {trend.length > 1 && (
              <polyline
                fill="none"
                points={points}
                stroke="currentColor"
                className="text-primary"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            )}
            {trend.map((point, index) => {
              const x = getX(index);
              const y = getY(point.overallScore);
              const tooltipX = Math.min(Math.max(x - 40, 2), width - 82);
              const tooltipY = Math.max(y - 34, 2);
              return (
                <g
                  key={`${point.label}-${index}`}
                  onMouseEnter={() => setActivePoint(index)}
                  onMouseLeave={() => setActivePoint(null)}
                  onFocus={() => setActivePoint(index)}
                  onBlur={() => setActivePoint(null)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    className="fill-background stroke-primary"
                    strokeWidth="3"
                    tabIndex={0}
                  />
                  <title>{`${point.label}: ${formatScore(point.overallScore)} / 1000`}</title>
                  {activePoint === index && (
                    <g className="pointer-events-none">
                      <rect
                        x={tooltipX}
                        y={tooltipY}
                        width="80"
                        height="24"
                        rx="6"
                        className="fill-foreground"
                      />
                      <text
                        x={tooltipX + 40}
                        y={tooltipY + 16}
                        textAnchor="middle"
                        className="fill-background"
                        fontSize="10"
                        fontWeight="700"
                      >
                        {formatScore(point.overallScore)} / 1000
                      </text>
                    </g>
                  )}
                  <text
                    x={x}
                    y={height - 10}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="11"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
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
  const dimensionScores = dimensions.map(([, key]) => analysis?.[key] ?? 0);
  const averageScore = dimensionScores.length
    ? Math.round(
        dimensionScores.reduce((total, score) => total + score, 0) /
          dimensionScores.length,
      )
    : 0;

  return (
    <Card className="flex h-full flex-col rounded-3xl border-border/70 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2 uppercase text-sm font-extrabold">
        <HeartPulse className="h-5 w-5 text-primary" />
        Core alignment dimensions
      </div>
      <div className="mt-6 space-y-7">
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
      <div className="mt-auto border-t border-border/70 pt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Overall alignment
          </p>
          <p className="text-sm font-extrabold text-primary">{averageScore}%</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          These dimensions show the areas shaping your shared relationship score.
          Use the lowest area as your next conversation focus.
        </p>
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
      <div className={`flex items-center uppercase gap-2 text-sm font-extrabold ${isStrength ? "text-emerald-600" : "text-rose-600"}`}>
        <Icon className="h-5 w-5" />
        {title}
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className={`border-l-2 pl-3 ${isStrength ? "border-emerald-600" : "border-rose-600"}`}>
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

export function CoachCard({ recommendation }: { recommendation: ICoachRecommendation }) {
  return (
    <Card className={`rounded-2xl border-l-4 border-primary border-y-border/70 border-r-border/70 bg-surface p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="min-w-0  flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="mt-1 text-sm font-extrabold">{recommendation.title}</h3>
            {recommendation.category && (
              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {recommendation.category}
              </span>
            )}
          </div>
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
