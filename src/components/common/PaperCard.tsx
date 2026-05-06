import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function PaperCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative bg-paper-2 shadow-paper rounded-sm px-6 py-6 sm:px-8 sm:py-8",
        "before:absolute before:inset-0 before:rounded-sm before:pointer-events-none",
        "before:bg-[url('/ornaments/paper-grain.svg')] before:opacity-[0.04] before:mix-blend-multiply",
        className,
      )}
      {...props}
    />
  );
}
