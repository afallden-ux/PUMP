"use client";

import { useEffect, useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { resolveWorkoutPhotoSrc } from "@/lib/utils/workoutPhotoDisplay";

interface FeedSessionPhotoProps {
  url: string;
  alt: string;
  userId?: string;
  workoutLogId?: string;
}

export function FeedSessionPhoto({
  url,
  alt,
  userId,
  workoutLogId,
}: FeedSessionPhotoProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setSrc(null);

    resolveWorkoutPhotoSrc(url, userId, workoutLogId).then((resolved) => {
      if (cancelled) return;
      if (!resolved) {
        setFailed(true);
        setLoading(false);
        return;
      }
      setSrc(resolved);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [url, userId, workoutLogId]);

  if (failed) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center gap-2 bg-muted text-muted-foreground">
        <ImageOff className="size-6" />
        <span className="text-xs">Photo failed to load</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full bg-muted">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-orange-500/80" />
        </div>
      )}
      {src && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      )}
    </div>
  );
}
