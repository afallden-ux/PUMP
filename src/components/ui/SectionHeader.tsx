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
        <Icon className="size-5 shrink-0 text-orange-400" />
        <h2 className="text-lg font-black tracking-tight">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-xs leading-relaxed text-muted-foreground pl-7">
          {subtitle}
        </p>
      )}
    </div>
  );
}
