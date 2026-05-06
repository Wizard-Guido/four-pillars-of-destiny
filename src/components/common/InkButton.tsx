"use client";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "outline";

interface InkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center min-h-[44px] px-6 py-2 font-serif text-base " +
  "transition-all duration-300 select-none active:scale-[0.97] " +
  "disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-cinnabar text-paper hover:bg-cinnabar-deep shadow-paper rounded-sm",
  ghost: "text-ink hover:bg-paper-2 rounded-sm",
  outline: "border border-gold text-ink hover:bg-paper-2 rounded-sm",
};

export const InkButton = forwardRef<HTMLButtonElement, InkButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
  ),
);
InkButton.displayName = "InkButton";
