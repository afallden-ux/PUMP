"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SessionPhotoPickerProps {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (file: File | null, previewUrl: string | null) => void;
}

export function SessionPhotoPicker({
  file,
  previewUrl,
  onFileChange,
}: SessionPhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSelect(selected: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onFileChange(selected, URL.createObjectURL(selected));
  }

  function clear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onFileChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 font-semibold">
        <Camera className="size-4 text-orange-400" />
        Flex pic (optional)
      </Label>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-orange-500/30">
          <Image
            src={previewUrl}
            alt="Session preview"
            width={400}
            height={240}
            className="h-40 w-full object-cover"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={clear}
            aria-label="Remove photo"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="size-4" />
          Add proof of suffering
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) handleSelect(selected);
        }}
      />

      {file && (
        <p className="text-center text-[10px] text-muted-foreground">
          {file.name} · ready to upload on save
        </p>
      )}
    </div>
  );
}
