"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, LogOut, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md">
      <Link href="/dashboard" className="flex items-center gap-2 font-black tracking-tight">
        <Dumbbell className="size-6 text-orange-500" />
        <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
          PUMP
        </span>
      </Link>
      <div className="flex items-center gap-1">
        <Link href="/dashboard">
          <Button
            variant={pathname === "/dashboard" ? "secondary" : "ghost"}
            size="sm"
          >
            Board
          </Button>
        </Link>
        <Link href="/crew">
          <Button
            variant={pathname === "/crew" ? "secondary" : "ghost"}
            size="sm"
          >
            <Users className="size-4 sm:mr-1" />
            <span className="hidden sm:inline">Crew</span>
          </Button>
        </Link>
        <Link href="/profile" aria-label="Profile">
          <Button
            variant={pathname === "/profile" ? "secondary" : "ghost"}
            size="icon-sm"
          >
            <User className="size-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon-sm" onClick={signOut} aria-label="Sign out">
          <LogOut className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
