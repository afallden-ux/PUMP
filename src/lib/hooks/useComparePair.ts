"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCompareSnapshot } from "@/lib/data/compareMetrics";
import type { CompareSnapshot } from "@/lib/compare/types";

export function useComparePair(leftUserId: string, rightUserId: string | null) {
  const [left, setLeft] = useState<CompareSnapshot | null>(null);
  const [right, setRight] = useState<CompareSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!rightUserId) {
      setLoading(true);
      const only = await fetchCompareSnapshot(leftUserId);
      setLeft(only);
      setRight(null);
      setError(only ? null : "Could not load your profile.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const [a, b] = await Promise.all([
      fetchCompareSnapshot(leftUserId),
      fetchCompareSnapshot(rightUserId),
    ]);
    setLeft(a);
    setRight(b);
    if (!a || !b) {
      setError("Could not load one or both climbers.");
    }
    setLoading(false);
  }, [leftUserId, rightUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { left, right, loading, error, refresh };
}
