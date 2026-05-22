"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Mountain, Moon } from "lucide-react";
import { toast } from "sonner";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INTENSITY_SHORT } from "@/lib/constants/intensityLabels";
import { SESSION_TYPE_META } from "@/lib/constants/sessionTypes";
import { formatDuration, formatRelativeTime } from "@/lib/utils/dates";
import { createClient } from "@/lib/supabase/client";
import type { CrewFeedSession, IntensityLevel } from "@/types/app";

interface SessionFeedCardProps {
  session: CrewFeedSession;
  currentUserId: string;
  onUpdated?: () => void;
}

export function SessionFeedCard({
  session,
  currentUserId,
  onUpdated,
}: SessionFeedCardProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const profile = Array.isArray(session.profiles)
    ? session.profiles[0]
    : session.profiles;
  const kudos = session.session_kudos ?? [];
  const comments = session.session_comments ?? [];
  const hasKudo = kudos.some((k) => k.user_id === currentUserId);
  const isOwn = session.user_id === currentUserId;

  async function toggleKudo() {
    const supabase = createClient();
    if (hasKudo) {
      const row = kudos.find((k) => k.user_id === currentUserId);
      if (!row) return;
      const { error } = await supabase.from("session_kudos").delete().eq("id", row.id);
      if (error) toast.error("Could not remove kudos", { description: error.message });
      else onUpdated?.();
      return;
    }
    const { error } = await supabase.from("session_kudos").insert({
      workout_log_id: session.id,
      user_id: currentUserId,
    });
    if (error) {
      if (error.code === "23505") toast.message("Already sent kudos!");
      else toast.error("Kudos failed", { description: error.message });
    } else {
      toast.success("Kudos sent!");
      onUpdated?.();
    }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    const body = comment.trim();
    if (!body) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("session_comments").insert({
      workout_log_id: session.id,
      user_id: currentUserId,
      body,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Comment failed", { description: error.message });
      return;
    }
    setComment("");
    onUpdated?.();
  }

  if (!profile) return null;

  return (
    <motion.article
      layout
      className="overflow-hidden rounded-2xl border border-border/60 bg-card/80"
    >
      <div className="flex items-center gap-3 p-3">
        <AvatarFrame
          username={profile.username}
          avatarUrl={profile.avatar_url}
          lifetimeScore={profile.current_pump_score ?? 0}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{profile.username}</p>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(session.created_at)} ·{" "}
            {session.total_points >= 0 ? "+" : ""}
            {session.total_points} pts
          </p>
        </div>
      </div>

      {session.photo_url && (
        <div className="relative aspect-[4/3] w-full bg-muted">
          <Image
            src={session.photo_url}
            alt={`${profile.username} session`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="space-y-2 p-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">
            {SESSION_TYPE_META[session.session_type]?.emoji}{" "}
            {SESSION_TYPE_META[session.session_type]?.label ?? session.session_type}
          </Badge>
          <Badge variant="secondary">
            {formatDuration(session.duration_minutes)} · L{session.intensity_level}{" "}
            {INTENSITY_SHORT[session.intensity_level as IntensityLevel]}
          </Badge>
          {session.hardest_grade && (
            <Badge className="bg-orange-500/20 text-orange-300">
              Sent {session.hardest_grade}
            </Badge>
          )}
          {session.is_moonboard && (
            <Badge className="gap-1 bg-indigo-500/20 text-indigo-300">
              <Moon className="size-3" /> Board
            </Badge>
          )}
          {session.is_outdoors && (
            <Badge className="gap-1 bg-emerald-500/20 text-emerald-300">
              <Mountain className="size-3" /> Outdoors
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={hasKudo ? "default" : "outline"}
            size="sm"
            className={hasKudo ? "bg-orange-600" : ""}
            onClick={toggleKudo}
            disabled={isOwn}
          >
            <Heart className={`size-4 ${hasKudo ? "fill-current" : ""}`} />
            {kudos.length} kudos
          </Button>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="size-4" />
            {comments.length}
          </span>
        </div>

        {comments.length > 0 && (
          <ul className="space-y-1.5 rounded-lg bg-muted/40 p-2">
            {comments.map((c) => {
              const author = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
              return (
                <li key={c.id} className="text-sm">
                  <span className="font-semibold text-orange-400/90">
                    {author?.username ?? "Climber"}:
                  </span>{" "}
                  <span className="text-foreground/90">{c.body}</span>
                </li>
              );
            })}
          </ul>
        )}

        <form onSubmit={postComment} className="flex gap-2">
          <Input
            placeholder="Roast or hype..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="text-sm"
          />
          <Button type="submit" size="sm" disabled={submitting || !comment.trim()}>
            Post
          </Button>
        </form>
      </div>
    </motion.article>
  );
}
