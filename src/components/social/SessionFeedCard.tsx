"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FeedSessionPhoto } from "@/components/social/FeedSessionPhoto";
import { Heart, MessageCircle, Mountain, Moon, Send } from "lucide-react";
import { toast } from "sonner";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { useClimberProfile } from "@/components/profile/ClimberProfileContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INTENSITY_SHORT } from "@/lib/constants/intensityLabels";
import { CLIMB_BONUS_META, SESSION_TYPE_META } from "@/lib/constants/sessionTypes";
import { getSessionDisplayNote, getThreadComments } from "@/lib/utils/sessionNote";
import { formatDuration, formatRelativeTime } from "@/lib/utils/dates";
import { createClient } from "@/lib/supabase/client";
import { BadgeShowcase } from "@/components/profile/BadgeShowcase";
import type { SessionCounts } from "@/lib/data/sessionBadges";
import type { CrewFeedSession, IntensityLevel } from "@/types/app";

interface SessionFeedCardProps {
  session: CrewFeedSession;
  currentUserId: string;
  authorBadgeCounts?: SessionCounts;
  onUpdated?: () => void;
}

export function SessionFeedCard({
  session,
  currentUserId,
  authorBadgeCounts,
  onUpdated,
}: SessionFeedCardProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { openProfile } = useClimberProfile();

  const profile = Array.isArray(session.profiles)
    ? session.profiles[0]
    : session.profiles;
  const kudos = session.session_kudos ?? [];
  const sessionNote = getSessionDisplayNote(session);
  const comments = getThreadComments(session);
  const hasKudo = kudos.some((k) => k.user_id === currentUserId);
  const isOwn = session.user_id === currentUserId;
  const typeMeta = SESSION_TYPE_META[session.session_type];

  async function toggleKudo() {
    if (isOwn) {
      toast.message("You can't like your own session.");
      return;
    }
    const supabase = createClient();
    if (hasKudo) {
      const row = kudos.find((k) => k.user_id === currentUserId);
      if (!row) return;
      const { error } = await supabase.from("session_kudos").delete().eq("id", row.id);
      if (error) toast.error("Could not remove like", { description: error.message });
      else onUpdated?.();
      return;
    }
    const { error } = await supabase.from("session_kudos").insert({
      workout_log_id: session.id,
      user_id: currentUserId,
    });
    if (error) {
      if (error.code === "23505") toast.message("Already liked!");
      else toast.error("Like failed", { description: error.message });
    } else {
      toast.success("Liked!");
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
    toast.success("Comment posted");
    onUpdated?.();
  }

  if (!profile) return null;

  return (
    <motion.article
      layout
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex gap-4 border-b border-slate-100 bg-slate-50/80 p-3 sm:gap-5 sm:pl-4">
        <button
          type="button"
          onClick={() => openProfile(session.user_id)}
          className="-m-1 flex min-w-0 flex-1 gap-4 rounded-lg p-1 text-left transition-colors hover:bg-teal-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 sm:gap-5"
          aria-label={`View ${profile.username}'s profile`}
        >
        <div className="w-12 shrink-0 sm:w-14">
          <AvatarFrame
            username={profile.username}
            avatarUrl={profile.avatar_url}
            lifetimeScore={profile.current_pump_score ?? 0}
            size="sm"
            plain
            className="mx-auto"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-bold leading-tight text-teal-600/90 hover:underline">
            {profile.username}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(session.created_at)} ·{" "}
            <span className={session.total_points >= 0 ? "text-teal-600" : "text-zinc-400"}>
              {session.total_points >= 0 ? "+" : ""}
              {session.total_points} pts
            </span>
          </p>
          {profile.home_crag && (
            <p className="text-[10px] text-muted-foreground/80">🏔 {profile.home_crag}</p>
          )}
          {authorBadgeCounts && (
            <div className="pt-1">
              <BadgeShowcase counts={authorBadgeCounts} max={5} size="sm" />
            </div>
          )}
        </div>
        </button>
      </div>

      {session.photo_url ? (
        <FeedSessionPhoto
          url={session.photo_url}
          alt={`${profile.username} session`}
          userId={session.user_id}
          workoutLogId={session.id}
        />
      ) : null}

      {sessionNote && (
        <div className="border-b border-teal-500/20 bg-teal-500/5 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600/90">
            Session note
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{sessionNote}</p>
        </div>
      )}

      <div className="space-y-3 p-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge className={typeMeta.badgeClass}>
            {typeMeta.emoji} {typeMeta.label}
          </Badge>
          <Badge variant="secondary">
            {formatDuration(session.duration_minutes)} · L{session.intensity_level}{" "}
            {INTENSITY_SHORT[session.intensity_level as IntensityLevel]}
          </Badge>
          {session.hardest_grade && (
            <Badge className="bg-teal-500/20 text-teal-600">
              Sent {session.hardest_grade}
            </Badge>
          )}
          {session.session_type === "climbing" && (
            <Badge
              className={
                session.is_moonboard
                  ? "gap-1 bg-indigo-500/20 text-indigo-300"
                  : session.is_outdoors
                    ? "gap-1 bg-emerald-500/20 text-emerald-300"
                    : "gap-1 bg-teal-500/20 text-teal-600"
              }
            >
              {session.is_moonboard ? (
                <>
                  <Moon className="size-3" /> {CLIMB_BONUS_META.board.label}
                </>
              ) : session.is_outdoors ? (
                <>
                  <Mountain className="size-3" /> {CLIMB_BONUS_META.outdoors.label}
                </>
              ) : (
                CLIMB_BONUS_META.none.label
              )}
            </Badge>
          )}
        </div>

        <div className="rounded-xl border border-teal-500/25 bg-teal-500/5 p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={hasKudo ? "default" : "outline"}
              size="sm"
              className={hasKudo ? "bg-teal-600" : ""}
              onClick={toggleKudo}
              aria-pressed={hasKudo}
            >
              <Heart className={`size-4 ${hasKudo ? "fill-current" : ""}`} />
              {hasKudo ? "Liked" : "Like"}
              {kudos.length > 0 && (
                <span className="ml-0.5 opacity-90">· {kudos.length}</span>
              )}
            </Button>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="size-4" />
              {comments.length} comment{comments.length === 1 ? "" : "s"}
            </span>
          </div>

          {comments.length > 0 && (
            <ul className="space-y-2 rounded-lg bg-background/60 p-2">
              {comments.map((c) => {
                const author = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
                return (
                  <li key={c.id} className="text-sm">
                    <button
                      type="button"
                      onClick={() => openProfile(c.user_id)}
                      className="font-semibold text-teal-600/90 hover:underline"
                    >
                      {author?.username ?? "Climber"}:
                    </button>{" "}
                    <span className="text-foreground/90">{c.body}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <form onSubmit={postComment} className="flex gap-2">
            <Input
              placeholder={
                isOwn ? "Add another comment…" : "Comment on this session…"
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="text-sm bg-background"
              aria-label="Comment"
            />
            <Button
              type="submit"
              size="sm"
              className="bg-teal-600 shrink-0"
              disabled={submitting || !comment.trim()}
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </motion.article>
  );
}
