"use client";

import { useEffect } from "react";

/** Fires a single view-tracking ping on mount (content detail pages). */
export function TrackView({ contentId }: { contentId: string }) {
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      const token = window.localStorage.getItem("mentari.token");
      void fetch(`/api/v1/contents/${contentId}/view`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
        keepalive: true,
      }).catch(() => undefined);
    }, 1200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [contentId]);
  return null;
}
