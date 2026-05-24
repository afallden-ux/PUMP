"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  GitCompare,
  Home,
  LogOut,
  MessageCircle,
  Trophy,
  User,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { APP_UI_VERSION } from "@/lib/appVersion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home, match: (p: string) => p === "/dashboard" },
  {
    href: "/compare",
    label: "Compare",
    icon: GitCompare,
    match: (p: string) => p.startsWith("/compare"),
  },
  {
    href: "/leaderboards",
    label: "Leaderboards",
    icon: Trophy,
    match: (p: string) => p.startsWith("/leaderboards"),
  },
  { href: "/feed", label: "Feed", icon: MessageCircle, match: (p: string) => p === "/feed" },
  {
    href: "/arena",
    label: "Analytics",
    icon: BarChart3,
    match: (p: string) => p.startsWith("/arena"),
  },
  {
    href: "/assessments",
    label: "Assessments",
    icon: ClipboardList,
    match: (p: string) => p.startsWith("/assessments"),
  },
  { href: "/profile", label: "Profile", icon: User, match: (p: string) => p === "/profile" },
] as const;

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "hidden w-52 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex",
        className
      )}
    >
      <div className="border-b border-slate-100 px-4 py-4">
        <BrandLogo href="/dashboard" size="sm" />
        <p className="mt-2 text-[11px] text-slate-500">Side-by-side climber stats</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50",
                active && "bg-teal-50 font-semibold text-teal-800"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-teal-600" />
              )}
              <Icon className={cn("size-5 shrink-0", active && "text-teal-600")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"
        >
          <LogOut className="size-5" />
          Logout
        </button>
        <p className="mt-2 px-3 text-[10px] tabular-nums text-slate-400">UI {APP_UI_VERSION}</p>
      </div>
    </aside>
  );
}

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-md lg:hidden">
      {NAV.map((item) => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-semibold",
              active ? "text-teal-700" : "text-slate-500"
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
