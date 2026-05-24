"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Home, LogOut, MessageCircle, Swords, User } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { APP_UI_VERSION } from "@/lib/appVersion";
import { createClient } from "@/lib/supabase/client";

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith("/arena")) {
    return null;
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <nav className="sticky top-0 z-40 hidden border-b border-border/60 bg-background/90 px-6 py-3 backdrop-blur-md lg:flex lg:items-center lg:justify-between">
        <BrandLogo href="/dashboard" size="md" priority />
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
          <Link href="/arena">
            <Button
              variant={pathname === "/arena" ? "secondary" : "ghost"}
              size="sm"
            >
              <Swords className="size-4 mr-1" />
              Arena
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
          <span
            className="ml-2 hidden text-[10px] tabular-nums text-muted-foreground/50 lg:inline"
            title="UI version and git commit — if this is missing or old, redeploy on Vercel"
          >
            UI {APP_UI_VERSION}
            {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
              ? ` · ${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)}`
              : null}
          </span>
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
        <Link href="/arena" className="flex flex-1 flex-col items-center gap-0.5 py-1">
          <Swords
            className={`size-5 ${pathname === "/arena" ? "text-orange-400" : "text-muted-foreground"}`}
          />
          <span className="text-[10px] font-semibold">Arena</span>
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
