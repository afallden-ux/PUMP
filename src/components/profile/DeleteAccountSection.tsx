"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const CONFIRM_TEXT = "DELETE";

export function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (confirm !== CONFIRM_TEXT) {
      toast.error(`Type ${CONFIRM_TEXT} to confirm`);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_my_account");
    setLoading(false);

    if (error) {
      toast.error("Could not delete account", { description: error.message });
      return;
    }

    await supabase.auth.signOut();
    toast.message("Account deleted");
    router.push("/login");
    window.location.assign("/login");
  }

  if (!open) {
    return (
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <h2 className="font-bold text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account, workouts, comments, and profile. This
          cannot be undone.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-3"
          onClick={() => setOpen(true)}
        >
          Delete my account
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex gap-2">
        <AlertTriangle className="size-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm font-semibold text-foreground">
            This removes everything tied to your login — forever.
          </p>
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono font-bold">{CONFIRM_TEXT}</span> to
              confirm
            </Label>
            <Input
              id="delete-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={CONFIRM_TEXT}
              className="font-mono"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={loading || confirm !== CONFIRM_TEXT}
              onClick={handleDelete}
            >
              {loading ? "Deleting…" : "Yes, delete my account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setOpen(false);
                setConfirm("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
