import { cn } from "@/lib/utils";

interface AppCardProps {
  children: React.ReactNode;
  className?: string;
}

/** Light analytics-style surface (Arena / ClimbCompare). */
export function AppCard({ children, className }: AppCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200/90 bg-white shadow-sm shadow-slate-200/40",
        className
      )}
    >
      {children}
    </section>
  );
}
