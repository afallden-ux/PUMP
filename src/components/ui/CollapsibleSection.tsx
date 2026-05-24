"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
        aria-expanded={open}
      >
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600">
            <Icon className="size-4" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-slate-800">{title}</span>
          {subtitle && (
            <span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="border-t border-slate-100 p-4 pt-3">{children}</div>}
    </section>
  );
}
