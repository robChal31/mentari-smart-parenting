export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} jt`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1).replace(/\.0$/, "")} rb`;
  return String(views);
}

export function formatPrice(price: number | null | undefined, currency = "IDR"): string {
  if (price === null || price === undefined) return "Hubungi Mentari";
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  return `${minutes} menit`;
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDate(iso);
}

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  BOOK_NATIONAL: "Buku Nasional",
  BOOK_INTERNATIONAL: "Buku Internasional",
  BOOK_SELF_PUBLISHED: "Buku Self-Published",
  BOOK_STORYBOOK: "Buku Cerita",
  DIGITAL_LEARNING: "Pembelajaran Digital",
  ENGLISH_ASSESSMENT: "Asesmen Bahasa Inggris",
  TEACHER_ACADEMY: "Teacher Academy",
};

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  VIDEO: "Video",
  ARTICLE: "Artikel",
  INFOGRAPHIC: "Infografis",
  TIPS: "Tips",
  ACTIVITY: "Aktivitas",
};
