"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useWizard } from "@/lib/state/wizard-store";
import { StepIndicator } from "./StepIndicator";

interface WizardShellProps {
  steps: ReactNode[];
}

export function WizardShell({ steps }: WizardShellProps) {
  const step = useWizard((s) => s.step);
  return (
    <section className="w-full max-w-content mx-auto px-4 sm:px-6 pb-16">
      <StepIndicator current={step} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
