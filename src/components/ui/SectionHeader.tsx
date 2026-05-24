import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        <Icon className="size-5 shrink-0 text-teal-600" />
        <h2 className="text-lg font-semibold tracking-tight text-slate-800">{title}</h2>
      </div>
      {subtitle && (
        <p className="pl-7 text-xs leading-relaxed text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
