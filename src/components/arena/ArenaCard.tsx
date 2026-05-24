import { cn } from "@/lib/utils";

interface ArenaCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ArenaCard({ children, className }: ArenaCardProps) {
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
