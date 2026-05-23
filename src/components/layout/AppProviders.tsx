"use client";

import { ClimberProfileProvider } from "@/components/profile/ClimberProfileContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ClimberProfileProvider>{children}</ClimberProfileProvider>;
}
