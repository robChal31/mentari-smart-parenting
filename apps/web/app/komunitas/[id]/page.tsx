import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Eye, Heart, MessageCircle, Pin } from "lucide-react";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import { CommentForm, LikeButton } from "@/components/thread-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const thread = await api.threadById(id);
  if (!thread) return { title: "Diskusi tidak ditemukan" };
  return { title: thread.title, description: thread.body.slice(0, 160) };
}

export default async function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = await api.threadById(id);
  if (!thread) notFound();
  const comments = thread.comments ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] font-semibold text-muted">
        <Link href="/" className="hover:text-primary">Beranda</Link>
        <ChevronRight size={12} aria-hidden />
        <Link href="/komunitas" className="hover:text-primary">Komunitas</Link>
        <ChevronRight size={12} aria-hidden />
        <span className="text-secondary">Diskusi</span>
      </nav>

      <article className="mt-5 rounded-[2rem] border border-sand bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-muted">
          {thread.isPinned && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-extrabold uppercase tracking-wider text-amber-700"><Pin size={9} /> Disematkan</span>}
          {thread.categorySlug && <span className="rounded-full bg-cream px-2.5 py-1 font-extrabold uppercase tracking-wider">#{thread.categorySlug}</span>}
          <span className="inline-flex items-center gap-1"><Eye size={11} /> {thread.viewCount} dilihat</span>
        </div>
        <h1 className="mt-3 font-heading text-2xl font-extrabold leading-snug text-secondary">{thread.title}</h1>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink/90">{thread.body}</p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-sand pt-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary-soft text-xs font-extrabold text-secondary">
              {thread.author.fullName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{thread.author.fullName}</p>
              <p className="text-[11px] text-muted">{formatRelativeTime(thread.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LikeButton threadId={thread.id} initialLikes={thread.likeCount} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-cream px-4 py-2 text-xs font-bold text-muted"><MessageCircle size={13} /> {comments.length}</span>
          </div>
        </div>
      </article>

      <section aria-labelledby="komentar-heading" className="mt-6">
        <h2 id="komentar-heading" className="font-heading text-lg font-extrabold text-secondary">{comments.length} Komentar</h2>
        <ol className="mt-4 space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-3 rounded-3xl border border-sand bg-white p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-accent-soft text-[11px] font-extrabold text-accent-deep">
                {comment.author.fullName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-secondary">{comment.author.fullName} <span className="font-medium text-muted">· {formatRelativeTime(comment.createdAt)}</span></p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-ink/90">{comment.body}</p>
                {comment.likeCount > 0 && <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-muted"><Heart size={10} aria-hidden /> {comment.likeCount}</p>}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5">
          <CommentForm threadId={thread.id} />
        </div>
      </section>
    </div>
  );
}
