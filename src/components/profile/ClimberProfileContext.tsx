"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ClimberProfileSheet } from "@/components/profile/ClimberProfileSheet";
import { createClient } from "@/lib/supabase/client";

interface ClimberProfileContextValue {
  openProfile: (userId: string) => void;
  closeProfile: () => void;
}

const ClimberProfileContext = createContext<ClimberProfileContextValue | null>(
  null
);

export function ClimberProfileProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  const openProfile = useCallback((id: string) => {
    setUserId(id);
  }, []);

  const closeProfile = useCallback(() => {
    setUserId(null);
  }, []);

  const value = useMemo(
    () => ({ openProfile, closeProfile }),
    [openProfile, closeProfile]
  );

  return (
    <ClimberProfileContext.Provider value={value}>
      {children}
      <ClimberProfileSheet
        userId={userId}
        currentUserId={currentUserId}
        onClose={closeProfile}
      />
    </ClimberProfileContext.Provider>
  );
}

export function useClimberProfile() {
  const ctx = useContext(ClimberProfileContext);
  if (!ctx) {
    throw new Error("useClimberProfile must be used within ClimberProfileProvider");
  }
  return ctx;
}

/** Safe when provider is optional (e.g. tests). */
export function useClimberProfileOptional() {
  return useContext(ClimberProfileContext);
}
