import Link from "next/link";
import type { ContentSummaryDto } from "@mentari/shared";
import { BookOpenText, Eye, Flame, Headphones, Lightbulb, NotebookPen, Play, Sparkles, Clock } from "lucide-react";
import { formatDate, formatDuration, formatViews } from "@/lib/format";

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; chip: string }> = {
  VIDEO: { label: "Video", icon: <Play size={12} fill="currentColor" />, chip: "bg-red-50 text-red-600" },
  ARTICLE: { label: "Artikel", icon: <BookOpenText size={12} />, chip: "bg-secondary-soft text-secondary" },
  INFOGRAPHIC: { label: "Infografis", icon: <Sparkles size={12} />, chip: "bg-purple-50 text-purple-700" },
  TIPS: { label: "Tips", icon: <Lightbulb size={12} />, chip: "bg-amber-50 text-amber-700" },
  ACTIVITY: { label: "Aktivitas", icon: <NotebookPen size={12} />, chip: "bg-accent-soft text-accent-deep" },
};

// Deterministic warm gradient per content id for the thumbnail block.
const THUMB_GRADIENTS = [
  "from-[#FFE3D3] via-[#FFD0BC] to-[#FFB89E]",
  "from-[#DFF0FA] via-[#C9E2F4] to-[#A9CDE9]",
  "from-[#DFF7F4] via-[#C3EEE9] to-[#9FE0D7]",
  "from-[#FFF3C9] via-[#FFE8A3] to-[#FFD97A]",
  "from-[#F3E8FF] via-[#E5D4FB] to-[#D2B8F5]",
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return THUMB_GRADIENTS[hash % THUMB_GRADIENTS.length];
}

export function ContentCard({ content, priority = false }: { content: ContentSummaryDto; priority?: boolean }) {
  const meta = TYPE_META[content.type] ?? TYPE_META.ARTICLE;
  const category = content.categories[0];
  const duration = formatDuration(content.videoDuration);

  return (
    <Link
      href={`/contents/${content.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-sand bg-white shadow-[0_2px_10px_rgba(38,50,68,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_16px_40px_rgba(255,107,53,0.14)]"
    >
      <div className={`relative h-36 w-full overflow-hidden bg-gradient-to-br ${gradientFor(content.id)} sm:h-40`}>
        {/* decorative blobs */}
        <span aria-hidden className="absolute -left-6 -top-8 h-28 w-28 rounded-full bg-white/40 blur-2xl" />
        <span aria-hidden className="absolute -bottom-10 right-6 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-secondary backdrop-blur">
            {meta.icon} {meta.label}
          </span>
          {duration && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/85 px-2.5 py-0.5 text-[10px] font-bold text-white">
              <Clock size={10} /> {duration}
            </span>
          )}
        </div>
        {content.isFeatured && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
            <Flame size={11} fill="currentColor" /> Populer
          </span>
        )}
        {priority && <span className="sr-only">Konten unggulan</span>}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em]">
          {category && (
            <span className="rounded-full px-2 py-0.5 text-secondary" style={{ background: (category.color ?? "#004E89") + "1A" }}>
              {category.name}
            </span>
          )}
          <span className="text-muted">{formatDate(content.publishedAt)}</span>
        </div>
        <h3 className="line-clamp-2 font-heading text-[0.98rem] font-bold leading-snug text-ink transition-colors group-hover:text-secondary">
          {content.title}
        </h3>
        {content.excerpt && <p className="line-clamp-2 text-xs leading-5 text-muted">{content.excerpt}</p>}
        <div className="mt-auto flex items-center gap-3 border-t border-sand/80 pt-2.5 text-[10px] font-medium text-muted">
          <span className="inline-flex items-center gap-1"><Eye size={11} /> {formatViews(content.viewCount)}</span>
          {content.readTime && <span className="inline-flex items-center gap-1"><Headphones size={11} className="hidden" />{content.readTime} mnt baca</span>}
          {content.authorName && <span className="truncate">· {content.authorName.split(",")[0]}</span>}
        </div>
      </div>
    </Link>
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-sand bg-white">
      <div className="skeleton h-36 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}
