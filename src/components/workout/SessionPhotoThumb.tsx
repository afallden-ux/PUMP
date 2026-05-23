"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { resolveWorkoutPhotoSrc } from "@/lib/utils/workoutPhotoDisplay";

interface SessionPhotoThumbProps {
  photoUrl: string;
  userId: string;
  workoutLogId: string;
  alt?: string;
}

export function SessionPhotoThumb({
  photoUrl,
  userId,
  workoutLogId,
  alt = "Session",
}: SessionPhotoThumbProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveWorkoutPhotoSrc(photoUrl, userId, workoutLogId).then((resolved) => {
      if (!cancelled) setSrc(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [photoUrl, userId, workoutLogId]);

  if (!src) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        <ImageIcon className="size-6 opacity-40" />
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={src} alt={alt} className="size-full object-cover" loading="lazy" />
  );
}
