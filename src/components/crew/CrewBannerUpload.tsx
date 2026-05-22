"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface CrewBannerUploadProps {
  crewId: string;
  crewName: string;
  bannerUrl: string | null;
  isOwner: boolean;
}

export function CrewBannerUpload({
  crewId,
  crewName,
  bannerUrl,
  isOwner,
}: CrewBannerUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(bannerUrl);

  async function handleFile(file: File) {
    if (!isOwner) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB for crew banner");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crewId}/banner.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("crew-banners")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploading(false);
      toast.error("Upload failed", { description: uploadError.message });
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("crew-banners").getPublicUrl(path);

    const cacheBusted = `${publicUrl}?t=${Date.now()}`;

    const { error: rpcError } = await supabase.rpc("update_crew_banner_url", {
      p_crew_id: crewId,
      p_url: cacheBusted,
    });

    setUploading(false);

    if (rpcError) {
      toast.error("Could not save banner", { description: rpcError.message });
      return;
    }

    setPreview(cacheBusted);
    toast.success(`${crewName} banner updated`);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl border border-orange-500/30 bg-muted">
        {preview ? (
          <Image
            src={preview}
            alt={`${crewName} banner`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-10 opacity-40" />
            <p className="text-xs font-semibold">No crew banner yet</p>
          </div>
        )}
      </div>
      {isOwner && (
        <>
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
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" />
            {uploading ? "Uploading..." : "Upload crew banner"}
          </Button>
        </>
      )}
    </div>
  );
}
