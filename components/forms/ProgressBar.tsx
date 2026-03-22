"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, name: "START" },
  { id: 2, name: "TIME & PLACE" },
  { id: 3, name: "VIDEO" },
  { id: 4, name: "AUDIO & AV" },
  { id: 5, name: "DETAILS" },
  { id: 6, name: "SEND" },
];

interface ProgressBarProps {
  currentStep: number;
  // When true (i.e. on the success screen), the final SEND step
  // renders as completed (filled primary + check) instead of active (ring).
  isFinished?: boolean;
}

export function ProgressBar({
  currentStep,
  isFinished = false,
}: ProgressBarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6 mb-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="relative flex justify-between items-center">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-secondary -z-10" />
          <motion.div
            className="absolute top-4 left-0 h-0.5 bg-primary -z-10"
            initial={{ width: "0%" }}
            animate={{
              // When finished, fill the bar 100%
              width: isFinished
                ? "100%"
                : `${Math.min(((currentStep - 1) / (STEPS.length - 1)) * 100, 100)}%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          {STEPS.map((step) => {
            const isCompleted =
              currentStep > step.id ||
              // The final step shows as completed when the success screen is shown
              (isFinished && step.id === STEPS[STEPS.length - 1].id);
            const isActive = !isCompleted && currentStep === step.id;

            return (
              <div key={step.id} className="flex flex-col items-center group">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full border-2 flex items-center justify-center bg-background transition-all duration-300",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                        ? "border-primary text-primary ring-4 ring-primary/10 shadow-sm"
                        : "border-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <span className="text-xs font-bold">{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "absolute -bottom-7 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 whitespace-nowrap",
                    isActive || isCompleted
                      ? "text-primary"
                      : "text-muted-foreground/60",
                  )}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
