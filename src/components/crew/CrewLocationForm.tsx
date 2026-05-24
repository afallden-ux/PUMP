"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface CrewLocationFormProps {
  crewId: string;
  location: string | null;
  isOwner: boolean;
}

export function CrewLocationForm({
  crewId,
  location,
  isOwner,
}: CrewLocationFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(location ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isOwner) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("update_crew_location", {
      p_crew_id: crewId,
      p_location: value.trim(),
    });
    setSaving(false);
    if (error) {
      toast.error("Could not save crew location", { description: error.message });
      return;
    }
    toast.success("Crew location updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-border/60 bg-card/80 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-teal-600" />
        <Label htmlFor="crew-location" className="font-bold">
          Crew crag / gym
        </Label>
      </div>
      <p className="text-xs text-muted-foreground">
        {isOwner
          ? "Where your squad trains together — shown to all crew members."
          : "Set by the crew owner."}
      </p>
      <Input
        id="crew-location"
        placeholder="e.g. Klättercentret Malmö, Kjugekull"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={80}
        disabled={!isOwner}
        readOnly={!isOwner}
      />
      {isOwner && (
        <Button type="submit" size="sm" className="bg-teal-600" disabled={saving}>
          {saving ? "Saving..." : "Save crew location"}
        </Button>
      )}
      {!isOwner && location && (
        <p className="text-sm font-semibold text-teal-600/90">📍 {location}</p>
      )}
    </form>
  );
}
