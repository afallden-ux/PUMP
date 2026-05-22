"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { getPumpTier } from "@/lib/constants/pumpTiers";
import { cn } from "@/lib/utils";

interface AvatarFrameProps {
  username: string;
  avatarUrl: string | null;
  lifetimeScore: number;
  size?: "sm" | "md" | "lg";
  shameMode?: boolean;
  /** Leaderboard & lists: photo only, no Popeye frame */
  plain?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { box: 56, image: 44 },
  md: { box: 80, image: 64 },
  lg: { box: 112, image: 88 },
};

export function AvatarFrame({
  username,
  avatarUrl,
  lifetimeScore,
  size = "md",
  shameMode = false,
  plain = false,
  className,
}: AvatarFrameProps) {
  const tier = getPumpTier(lifetimeScore);
  const dims = sizeMap[size];
  const initial = username.slice(0, 1).toUpperCase();

  if (plain) {
    const imgSize = dims.image;
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-muted",
          shameMode && "grayscale opacity-60",
          className
        )}
        style={{ width: imgSize, height: imgSize }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={username}
            width={imgSize}
            height={imgSize}
            className="size-full object-cover"
            unoptimized
          />
        ) : (
          <span
            className="flex size-full items-center justify-center bg-orange-500/20 text-sm font-bold text-orange-400"
          >
            {initial}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Forearm bulges — "Popeye effect" */}
      <motion.div
        aria-hidden
        className="absolute -left-3 top-1/2 z-0 h-4 w-8 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-600 to-amber-400"
        animate={{
          scaleX: shameMode ? 0.6 : tier.forearmScale,
          scaleY: shameMode ? 0.8 : tier.forearmScale * 0.7,
          opacity: shameMode ? 0.35 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-3 top-1/2 z-0 h-4 w-8 -translate-y-1/2 rounded-full bg-gradient-to-l from-orange-600 to-amber-400"
        animate={{
          scaleX: shameMode ? 0.6 : tier.forearmScale,
          scaleY: shameMode ? 0.8 : tier.forearmScale * 0.7,
          opacity: shameMode ? 0.35 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      />

      <motion.div
        className={cn(
          "relative z-10 flex items-center justify-center rounded-2xl border-2 bg-zinc-900",
          shameMode
            ? "border-zinc-600 grayscale"
            : "border-orange-500"
        )}
        style={{
          width: dims.box,
          height: dims.box,
          boxShadow: shameMode ? undefined : tier.glow,
        }}
        animate={{ scale: shameMode ? 0.92 : tier.frameScale }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={username}
            width={dims.image}
            height={dims.image}
            className="rounded-xl object-cover"
            unoptimized
          />
        ) : (
          <span
            className="flex items-center justify-center rounded-xl bg-orange-500/20 font-bold text-orange-400"
            style={{ width: dims.image, height: dims.image, fontSize: dims.image * 0.4 }}
          >
            {initial}
          </span>
        )}
      </motion.div>

      {!shameMode && tier.tier !== "chalky" && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-orange-400"
        >
          {tier.label}
        </motion.span>
      )}
    </div>
  );
}
