"use client";

import { useSearchParams } from "next/navigation";

export function LoginAuthAlert() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;

  const message =
    error === "missing_code"
      ? "Confirmation link was invalid. Try signing up again or request a new email."
      : decodeURIComponent(error);

  return (
    <p
      role="alert"
      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200"
    >
      {message}
    </p>
  );
}
