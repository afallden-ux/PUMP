import {
  Activity,
  Globe,
  Grid3x3,
  LayoutGrid,
  MapPin,
  Mountain,
  StretchHorizontal,
  type LucideIcon,
  Zap,
} from "lucide-react";
import type { LeaderboardCategory } from "@/lib/leaderboards/types";

export interface LeaderboardCategoryMeta {
  id: LeaderboardCategory;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  accent: string;
  accentMuted: string;
  ring: string;
}

export const LEADERBOARD_CATEGORY_META: LeaderboardCategoryMeta[] = [
  {
    id: "all",
    label: "All metrics",
    shortLabel: "All",
    icon: LayoutGrid,
    accent: "from-slate-600 to-slate-800",
    accentMuted: "bg-slate-100 text-slate-700",
    ring: "ring-slate-400/40",
  },
  {
    id: "strength",
    label: "Strength",
    shortLabel: "Strength",
    icon: Activity,
    accent: "from-rose-600 to-orange-600",
    accentMuted: "bg-rose-50 text-rose-800",
    ring: "ring-rose-400/40",
  },
  {
    id: "flex",
    label: "Flexibility",
    shortLabel: "Flex",
    icon: StretchHorizontal,
    accent: "from-violet-600 to-purple-600",
    accentMuted: "bg-violet-50 text-violet-800",
    ring: "ring-violet-400/40",
  },
  {
    id: "outdoor",
    label: "Outdoor",
    shortLabel: "Outdoor",
    icon: Mountain,
    accent: "from-emerald-600 to-teal-700",
    accentMuted: "bg-emerald-50 text-emerald-800",
    ring: "ring-emerald-400/40",
  },
  {
    id: "moonboard",
    label: "MoonBoard",
    shortLabel: "MoonBoard",
    icon: Grid3x3,
    accent: "from-amber-600 to-orange-700",
    accentMuted: "bg-amber-50 text-amber-900",
    ring: "ring-amber-400/40",
  },
  {
    id: "crags27",
    label: "27crags",
    shortLabel: "27crags",
    icon: MapPin,
    accent: "from-sky-600 to-blue-700",
    accentMuted: "bg-sky-50 text-sky-900",
    ring: "ring-sky-400/40",
  },
  {
    id: "eighta",
    label: "8a.nu",
    shortLabel: "8a.nu",
    icon: Globe,
    accent: "from-indigo-600 to-blue-800",
    accentMuted: "bg-indigo-50 text-indigo-900",
    ring: "ring-indigo-400/40",
  },
  {
    id: "activity",
    label: "Activity",
    shortLabel: "Activity",
    icon: Zap,
    accent: "from-teal-600 to-cyan-700",
    accentMuted: "bg-teal-50 text-teal-800",
    ring: "ring-teal-400/40",
  },
];

export function getCategoryMeta(
  id: LeaderboardCategory
): LeaderboardCategoryMeta {
  return (
    LEADERBOARD_CATEGORY_META.find((c) => c.id === id) ??
    LEADERBOARD_CATEGORY_META[0]
  );
}
