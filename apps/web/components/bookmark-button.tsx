"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { apiData, getToken } from "@/lib/client-api";
import { useAuth } from "./auth-provider";
import { useDictionary } from "./i18n-provider";
import { useRouter } from "next/navigation";

export function BookmarkButton({ contentId }: { contentId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const dict = useDictionary();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!getToken()) {
      setReady(true);
      return;
    }
    apiData<Array<{ content: { id: string } }>>("/bookmarks")
      .then((rows) => {
        if (alive) setSaved(rows.some((row) => row.content.id === contentId));
      })
      .catch(() => undefined)
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [contentId]);

  async function toggle() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      if (next) await apiData("/bookmarks", { body: { contentId } });
      else await apiData(`/bookmarks/${contentId}`, { method: "DELETE" });
    } catch {
      setSaved(!next); // rollback
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy || !ready}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
        saved
          ? "border-accent bg-accent-soft text-accent-deep"
          : "border-sand bg-white text-secondary hover:border-accent hover:text-accent-deep"
      }`}
    >
      {saved ? <BookmarkCheck size={15} aria-hidden /> : <Bookmark size={15} aria-hidden />}
      {saved ? dict.common.saved : dict.common.save}
    </button>
  );
}
