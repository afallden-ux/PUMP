"use client";

import { useMemo } from "react";
import { Flame, Zap } from "lucide-react";
import {
  pickLoginMotivation,
  type LoginMotivationTone,
} from "@/lib/constants/loginMotivation";
import { cn } from "@/lib/utils";

const toneLabel: Record<LoginMotivationTone, string> = {
  classic: "Reality check",
  ondra: "Ondra mode",
};

interface LoginMotivationBannerProps {
  className?: string;
}

export function LoginMotivationBanner({ className }: LoginMotivationBannerProps) {
  const quote = useMemo(() => pickLoginMotivation(), []);
  const isOndra = quote.tone === "ondra";

  return (
    <aside
      className={cn(
        "rounded-xl border px-4 py-3 text-center shadow-lg",
        isOndra
          ? "border-red-500/40 bg-red-500/10 shadow-red-950/30"
          : "border-teal-500/40 bg-teal-500/10 shadow-teal-950/30",
        className
      )}
      aria-live="polite"
    >
      <div className="mb-2 flex items-center justify-center gap-1.5">
        {isOndra ? (
          <Zap className="size-4 text-red-400" aria-hidden />
        ) : (
          <Flame className="size-4 text-teal-600" aria-hidden />
        )}
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            isOndra ? "text-red-400/90" : "text-teal-600/90"
          )}
        >
          {toneLabel[quote.tone]}
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug text-foreground">
        &ldquo;{quote.text}&rdquo;
      </p>
    </aside>
  );
}
