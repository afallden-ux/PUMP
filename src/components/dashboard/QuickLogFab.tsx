"use client";

import { LogWorkoutModal } from "@/components/workout/LogWorkoutModal";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

interface QuickLogFabProps {
  userId: string;
  onLogged?: () => void;
}

export function QuickLogFab({ userId, onLogged }: QuickLogFabProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 pb-[env(safe-area-inset-bottom)] md:hidden">
      <LogWorkoutModal
        userId={userId}
        onLogged={onLogged}
        trigger={
          <Button
            size="lg"
            className="h-14 w-full bg-gradient-to-r from-teal-700 to-teal-500 font-bold text-white shadow-lg shadow-teal-900/25"
          >
            <Flame className="size-5" />
            LOG NOW
          </Button>
        }
      />
    </div>
  );
}
