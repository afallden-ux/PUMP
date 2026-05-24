"use client";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { AppMobileNav, AppSidebar } from "@/components/layout/AppSidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="cc-app flex min-h-[100dvh] bg-[#f4f6f9] text-slate-800">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-center border-b border-slate-200 bg-white py-3 lg:hidden">
          <BrandLogo href="/dashboard" size="sm" />
        </div>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-24 lg:px-8 lg:py-8 lg:pb-8">
          {children}
        </main>
        <AppMobileNav />
      </div>
    </div>
  );
}
