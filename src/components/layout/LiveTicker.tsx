"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useRecentActivity } from "@/lib/hooks/useRecentActivity";

export function LiveTicker() {
  const message = useRecentActivity();

  return (
    <div className="relative overflow-hidden border-b border-teal-500/40 bg-red-950/80">
      <div className="flex items-center gap-2 px-3 py-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <AlertTriangle className="size-4 shrink-0 text-amber-400" />
        </motion.span>
        <div className="relative flex-1 overflow-hidden">
          <motion.p
            key={message}
            className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-amber-100 sm:text-sm"
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            {message}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
