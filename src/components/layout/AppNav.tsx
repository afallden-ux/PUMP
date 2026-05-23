"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Dumbbell, Home, LogOut, MessageCircle, User } from "lucide-react";
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
    <>
      <nav className="sticky top-0 z-40 hidden border-b border-border/60 bg-background/90 px-6 py-3 backdrop-blur-md lg:flex lg:items-center lg:justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-black tracking-tight"
        >
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
              <Home className="size-4 mr-1" />
              Board
            </Button>
          </Link>
        <Link href="/feed">
          <Button
            variant={pathname === "/feed" ? "secondary" : "ghost"}
            size="sm"
          >
            <MessageCircle className="size-4 mr-1" />
            Feed
          </Button>
        </Link>
          <Link href="/dashboard#compare">
            <Button variant="ghost" size="sm">
              <BarChart3 className="size-4 mr-1" />
              Compare
            </Button>
          </Link>
          <Link href="/profile">
            <Button
              variant={pathname === "/profile" ? "secondary" : "ghost"}
              size="sm"
            >
              <User className="size-4 mr-1" />
              Profile
            </Button>
          </Link>
          <Button variant="ghost" size="icon-sm" onClick={signOut} aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border/60 bg-background/95 px-2 py-2 backdrop-blur-md lg:hidden">
        <Link href="/dashboard" className="flex flex-1 flex-col items-center gap-0.5 py-1">
          <Home
            className={`size-5 ${pathname === "/dashboard" ? "text-orange-400" : "text-muted-foreground"}`}
          />
          <span className="text-[10px] font-semibold">Board</span>
        </Link>
        <Link href="/feed" className="flex flex-1 flex-col items-center gap-0.5 py-1">
          <MessageCircle
            className={`size-5 ${pathname === "/feed" ? "text-orange-400" : "text-muted-foreground"}`}
          />
          <span className="text-[10px] font-semibold">Feed</span>
        </Link>
        <Link href="/dashboard#compare" className="flex flex-1 flex-col items-center gap-0.5 py-1">
          <BarChart3 className="size-5 text-muted-foreground" />
          <span className="text-[10px] font-semibold">Charts</span>
        </Link>
        <Link href="/profile" className="flex flex-1 flex-col items-center gap-0.5 py-1">
          <User
            className={`size-5 ${pathname === "/profile" ? "text-orange-400" : "text-muted-foreground"}`}
          />
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>
      </nav>
    </>
  );
}
