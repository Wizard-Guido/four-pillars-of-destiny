"use client";
import { motion } from "framer-motion";
import { InkButton } from "@/components/common/InkButton";

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
        viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M0 480 Q 200 360 400 420 T 800 380 T 1200 440 L 1200 600 L 0 600 Z"
          fill="var(--ink-900)"
        />
        <path
          d="M0 520 Q 250 440 500 480 T 1000 460 T 1200 500 L 1200 600 L 0 600 Z"
          fill="var(--ink-900)" opacity="0.5"
        />
      </svg>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="font-serif text-6xl sm:text-7xl tracking-[0.2em] mb-3"
      >
        四 柱
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-ink-600 font-serif text-lg mb-12"
      >
        知命，知未来
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <InkButton onClick={onStart} className="px-10 py-3 text-lg">开始排盘</InkButton>
      </motion.div>
    </section>
  );
}
