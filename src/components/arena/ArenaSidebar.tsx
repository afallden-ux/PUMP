"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  HelpCircle,
  History,
  Home,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard", label: "Plans", icon: BarChart3 },
  { href: "/dashboard", label: "History", icon: History },
  { href: "/arena", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "#", label: "Help", icon: HelpCircle },
  { href: "/profile", label: "Settings", icon: Settings },
] as const;

export function ArenaSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-[72px] shrink-0 flex-col border-r border-slate-200 bg-white lg:w-52">
      <div className="hidden border-b border-slate-100 px-4 py-4 lg:block">
        <BrandLogo href="/arena" size="sm" />
        <p className="mt-2 text-[11px] text-slate-500">Training analytics</p>
      </div>
      <div className="flex justify-center border-b border-slate-100 py-3 lg:hidden">
        <BrandLogo href="/arena" size="sm" />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2 lg:p-3">
        {NAV.map((item) => {
          const active =
            item.href === "/arena"
              ? pathname === "/arena"
              : item.label === "Home"
                ? pathname === "/dashboard"
                : false;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-2 py-2.5 text-slate-600 transition-colors hover:bg-slate-50 lg:px-3",
                active && "bg-slate-50 font-semibold text-[#2563eb]"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-[#2563eb]" />
              )}
              <Icon
                className={cn("mx-auto size-5 shrink-0 lg:mx-0", active && "text-[#2563eb]")}
              />
              <span className="hidden text-sm lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={signOut}
        className="m-2 flex items-center gap-3 rounded-md px-2 py-2.5 text-slate-500 hover:bg-slate-50 lg:m-3 lg:px-3"
      >
        <LogOut className="mx-auto size-5 lg:mx-0" />
        <span className="hidden text-sm lg:inline">Logout</span>
      </button>
    </aside>
  );
}
