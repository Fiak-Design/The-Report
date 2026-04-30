"use client";

import { useState, useEffect } from "react";

/**
 * Returns the current Date, refreshing every `intervalMs` (default 60s).
 *
 * Notes on SSR/hydration:
 *   - The lazy initializer runs on both server (SSR) and client (hydration), so
 *     the initial value may differ by a few ms or even hours (different time zones).
 *   - We immediately call setNow(new Date()) inside useEffect to re-sync to the
 *     client's clock after mount.
 *   - Any DOM node whose contents/position depend on this value should set
 *     `suppressHydrationWarning` to silence the expected mismatch on first paint.
 */
export function useNow(intervalMs: number = 60_000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // Re-sync to the client's clock immediately after hydration.
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
