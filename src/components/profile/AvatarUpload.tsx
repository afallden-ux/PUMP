"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/app";

interface AvatarUploadProps {
  profile: Profile;
  onUpdated: (avatarUrl: string) => void;
}

export function AvatarUpload({ profile, onUpdated }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Max 3MB — compress that ego pic");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploading(false);
      toast.error("Upload failed", { description: uploadError.message });
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const cacheBusted = `${publicUrl}?t=${Date.now()}`;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: cacheBusted })
      .eq("id", profile.id);

    setUploading(false);

    if (profileError) {
      toast.error("Profile update failed", { description: profileError.message });
      return;
    }

    onUpdated(cacheBusted);
    toast.success("Profile photo updated");
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <AvatarFrame
        username={profile.username}
        avatarUrl={profile.avatar_url}
        lifetimeScore={profile.current_pump_score}
        size="lg"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Camera className="size-4" />
        {uploading ? "Uploading..." : "Change avatar"}
      </Button>
    </div>
  );
}
