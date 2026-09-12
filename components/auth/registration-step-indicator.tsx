import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type RegistrationStepIndicatorProps = {
  steps?: string[];
  currentStep: number;
  className?: string;
};

const registrationSteps = [
  "Create account",
  "Relationship details",
  "Union Connection",
];

export function RegistrationStepIndicator({
  steps = registrationSteps,
  currentStep,
  className,
}: RegistrationStepIndicatorProps) {
  const completedProgress =
    steps.length > 1
      ? ((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100
      : 0;

  return (
    <div
      className={cn("mx-auto w-full", className)}
      aria-label={`Registration progress: step ${currentStep} of ${steps.length}`}
    >
      <div className="relative flex w-full items-start justify-between">
        {steps.length > 1 && (
          <div
            className="pointer-events-none absolute left-[16.666%] right-[16.666%] top-5 h-[2px] -translate-y-1/2 rounded-full bg-border"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
              style={{ width: `${completedProgress}%` }}
            />
          </div>
        )}

        {steps.map((stepLabel, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <div
              key={stepLabel}
              className="relative z-10 flex min-w-0 flex-1 flex-col items-center"
            >
              <div className="relative flex h-10 w-10 items-center justify-center">
                {isCurrent && (
                  <span
                    className="absolute inset-0 rounded-full bg-primary/30 anim-pulse-ring"
                    aria-hidden="true"
                  />
                )}
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                    isComplete &&
                      "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25",
                    isCurrent &&
                      "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-4 ring-primary/15",
                    !isCurrent &&
                      !isComplete &&
                      "border border-border bg-secondary text-muted-foreground",
                  )}
                >
                  {isComplete ? (
                    <Check
                      className="h-4 w-4"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="tabular-nums">{stepNumber}</span>
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "mt-2 whitespace-nowrap text-center text-[0.7rem] leading-4 transition-colors duration-300",
                  isComplete && "font-medium text-foreground",
                  isCurrent && "font-semibold text-primary",
                  !isCurrent &&
                    !isComplete &&
                    "font-medium text-muted-foreground",
                )}
              >
                {stepLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
