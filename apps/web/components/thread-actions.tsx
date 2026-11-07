"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, MessageCircle, Send } from "lucide-react";
import { apiData, ApiError } from "@/lib/client-api";
import { useAuth } from "./auth-provider";
import { useDictionary } from "./i18n-provider";

export function LikeButton({ threadId, initialLikes }: { threadId: string; initialLikes: number }) {
  const { user } = useAuth();
  const router = useRouter();
  const dict = useDictionary();
  const [likes, setLikes] = useState(initialLikes);
  const [busy, setBusy] = useState(false);

  async function like() {
    if (!user) {
      router.push(`/login?next=/community/${threadId}`);
      return;
    }
    setBusy(true);
    try {
      const result = await apiData<{ likeCount: number }>(`/community/threads/${threadId}/like`, { method: "POST" });
      setLikes(result.likeCount);
    } catch {
      setLikes((v) => v + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={like} disabled={busy} aria-pressed="false" className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-4 py-2 text-xs font-bold text-secondary transition hover:border-primary/40 hover:text-primary disabled:opacity-60">
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Heart size={13} aria-hidden />} {likes}
    </button>
  );
}

export function CommentForm({ threadId }: { threadId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const dict = useDictionary();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="rounded-2xl border border-dashed border-sand bg-white/70 px-4 py-4 text-center text-xs text-muted">
        <a href={`/login?next=/community/${threadId}`} className="font-bold text-primary hover:underline">{dict.community.loginToCommentPre}</a>{" "}{dict.community.loginToCommentPost}
      </p>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (body.trim().length < 2) return;
    setBusy(true);
    setError(null);
    try {
      await apiData(`/community/threads/${threadId}/comments`, { body: { body: body.trim() } });
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.community.commentFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-2">
      {error && <p role="alert" className="mb-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">{error}</p>}
      <label htmlFor="comment" className="sr-only">{dict.community.commentAria}</label>
      <div className="flex items-end gap-2 rounded-3xl border border-sand bg-white p-2 focus-within:border-primary">
        <MessageCircle size={18} className="mb-2 ml-2 shrink-0 text-muted" aria-hidden />
        <textarea id="comment" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder={dict.community.commentPlaceholder} className="w-full resize-none bg-transparent py-2 text-sm outline-none" />
        <button type="submit" disabled={busy || body.trim().length < 2} aria-label={dict.community.commentSubmitAria} className="mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-white transition hover:bg-primary-deep disabled:opacity-40">
          {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} aria-hidden />}
        </button>
      </div>
    </form>
  );
}
