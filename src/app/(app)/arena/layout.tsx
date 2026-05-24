"use client";

import { ThemeProvider } from "next-themes";

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="climbcompare-arena-theme">
      {children}
    </ThemeProvider>
  );
}
