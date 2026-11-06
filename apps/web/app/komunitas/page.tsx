import Link from "next/link";
import type { Metadata } from "next";
import { Eye, Heart, MessageCircle, Pin } from "lucide-react";
import { api } from "@/lib/api";
import { NewThreadForm } from "@/components/new-thread-form";
import { formatRelativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Komunitas Orang Tua Indonesia",
  description: "Tanya jawab, berbagi pengalaman, dan dukung sesama orang tua — dimoderasi tim Mentari.",
};

export default async function KomunitasPage() {
  const { items: threads, meta } = await api.threads({ limit: "20" });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">Ruang Hangat</p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-secondary">Komunitas Mentari</h1>
          <p className="mt-1 max-w-md text-sm text-muted">{meta?.total ?? threads.length} diskusi · diawasi moderator, bebas judgement.</p>
        </div>
        <NewThreadForm />
      </header>

      <ol className="mt-8 space-y-4">
        {threads.map((thread) => (
          <li key={thread.id}>
            <Link href={`/komunitas/${thread.id}`} className="block rounded-3xl border border-sand bg-white p-5 transition hover:border-primary/30 hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary-soft text-xs font-extrabold text-secondary">
                  {thread.author.fullName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-muted">
                    <span className="font-bold text-secondary">{thread.author.fullName}</span>
                    · {formatRelativeTime(thread.createdAt)}
                    {thread.categorySlug && <span className="rounded-full bg-cream px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-muted">#{thread.categorySlug}</span>}
                    {thread.isPinned && <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700"><Pin size={9} /> Disematkan</span>}
                  </span>
                  <span className="mt-1.5 block font-heading text-base font-bold leading-snug text-ink">{thread.title}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-4 text-[10px] font-medium text-muted">
                    <span className="inline-flex items-center gap-1"><MessageCircle size={11} /> {thread.commentCount} komentar</span>
                    <span className="inline-flex items-center gap-1"><Heart size={11} /> {thread.likeCount}</span>
                    <span className="inline-flex items-center gap-1"><Eye size={11} /> {thread.viewCount}</span>
                  </span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      {threads.length === 0 && (
        <p className="mt-14 rounded-3xl border border-dashed border-sand bg-white/60 px-6 py-14 text-center text-sm text-muted">Belum ada diskusi. Jadilah yang pertama bertanya!</p>
      )}
    </div>
  );
}
