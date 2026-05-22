"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/app";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(profile.username);
  const [title, setTitle] = useState(profile.title);
  const [homeCrag, setHomeCrag] = useState(profile.home_crag ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        title: title.trim(),
        home_crag: homeCrag.trim() || null,
      })
      .eq("id", profile.id);
    setSaving(false);

    if (error) {
      toast.error("Save failed", { description: error.message });
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={2}
          maxLength={32}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Custom title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Fresh Chalk"
          maxLength={48}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="home-crag">Home crag / gym</Label>
        <Input
          id="home-crag"
          value={homeCrag}
          onChange={(e) => setHomeCrag(e.target.value)}
          placeholder="e.g. Gasworks, Ringen"
          maxLength={80}
        />
        <p className="text-xs text-muted-foreground">
          Shown on your profile and when crew mates view your badges.
        </p>
      </div>
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
