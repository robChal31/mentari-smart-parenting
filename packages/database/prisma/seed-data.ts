/**
 * Data esensial untuk seeding produksi.
 *
 * Sengaja TANPA data dummy: tidak ada konten contoh, produk, thread komunitas,
 * milestone, learning path, badge, atau analitik palsu. Yang ada hanya kerangka
 * yang dibutuhkan aplikasi supaya tidak error saat pertama dibuka:
 *
 *   - AGE_GROUPS   → dipakai filter konten & form anak (endpoint /age-groups)
 *   - CATEGORIES   → taksonomi konten (endpoint /categories); halaman depan
 *                    memanggil ini, jadi harus terisi atau UI kosong
 *   - DEMO_AUTHOR  → Content.authorId boleh null, tapi halaman detail konten
 *                    menampilkan penulis. Satu author bawaan menghindari
 *                    tampilan "tanpa penulis" untuk konten pertama.
 *
 * User dibuat di seed.ts (admin + editor), bukan di sini.
 */

export const AGE_GROUPS = [
  { name: 'Bayi (0-12 Bulan)', slug: 'bayi', minAge: 0, maxAge: 12, description: 'Konten untuk newborn hingga 12 bulan.' },
  { name: 'Batita (1-3 Tahun)', slug: 'batita', minAge: 12, maxAge: 36, description: 'Konten untuk anak 1-3 tahun.' },
  { name: 'Prasekolah (3-6 Tahun)', slug: 'prasekolah', minAge: 36, maxAge: 72, description: 'Konten untuk anak 3-6 tahun.' },
  { name: 'SD Awal (6-9 Tahun)', slug: 'sd-awal', minAge: 72, maxAge: 108, description: 'Konten untuk anak kelas 1-3 SD.' },
  { name: 'SD Akhir (9-12 Tahun)', slug: 'sd-akhir', minAge: 108, maxAge: 144, description: 'Konten untuk anak kelas 4-6 SD.' },
  { name: 'Semua Usia', slug: 'semua-usia', minAge: 0, maxAge: 144, description: 'Konten yang relevan untuk semua jenjang usia.' },
];

/** Kategori induk + subkategori. `parent` merujuk ke slug induk. */
export const CATEGORIES: Array<{
  name: string; slug: string; description?: string; icon?: string; color?: string; sortOrder?: number; parent?: string;
}> = [
  { name: 'Nutrisi & Kesehatan', slug: 'nutrisi-kesehatan', description: 'Gizi, MPASI, imunisasi, dan kesehatan fisik anak.', icon: 'Apple', color: '#2EC4B6', sortOrder: 1 },
  { name: 'Gizi Anak', slug: 'gizi-anak', parent: 'nutrisi-kesehatan', sortOrder: 1 },
  { name: 'Kesehatan Fisik', slug: 'kesehatan-fisik', parent: 'nutrisi-kesehatan', sortOrder: 2 },
  { name: 'Imunisasi', slug: 'imunisasi', parent: 'nutrisi-kesehatan', sortOrder: 3 },

  { name: 'Tumbuh Kembang', slug: 'tumbuh-kembang', description: 'Perkembangan kognitif, motorik, bahasa, dan sosial emosional.', icon: 'TrendingUp', color: '#FF6B35', sortOrder: 2 },
  { name: 'Kognitif', slug: 'kognitif', parent: 'tumbuh-kembang', sortOrder: 1 },
  { name: 'Motorik', slug: 'motorik', parent: 'tumbuh-kembang', sortOrder: 2 },
  { name: 'Bahasa', slug: 'bahasa', parent: 'tumbuh-kembang', sortOrder: 3 },
  { name: 'Sosial Emosional', slug: 'sosial-emosional', parent: 'tumbuh-kembang', sortOrder: 4 },

  { name: 'Pendidikan', slug: 'pendidikan', description: 'Persiapan sekolah, belajar di rumah, dan kurikulum.', icon: 'BookOpen', color: '#004E89', sortOrder: 3 },
  { name: 'Persiapan Sekolah', slug: 'persiapan-sekolah', parent: 'pendidikan', sortOrder: 1 },
  { name: 'Belajar di Rumah', slug: 'belajar-di-rumah', parent: 'pendidikan', sortOrder: 2 },
  { name: 'Kurikulum & Akademik', slug: 'kurikulum-akademik', parent: 'pendidikan', sortOrder: 3 },

  { name: 'Aktivitas & Kreativitas', slug: 'aktivitas-kreativitas', description: 'DIY, permainan edukatif, dan aktivitas outdoor.', icon: 'Palette', color: '#FFD166', sortOrder: 4 },
  { name: 'DIY Crafts', slug: 'diy-crafts', parent: 'aktivitas-kreativitas', sortOrder: 1 },
  { name: 'Permainan Edukatif', slug: 'permainan-edukatif', parent: 'aktivitas-kreativitas', sortOrder: 2 },
  { name: 'Outdoor Activities', slug: 'outdoor-activities', parent: 'aktivitas-kreativitas', sortOrder: 3 },

  { name: 'Psikologi Anak', slug: 'psikologi-anak', description: 'Disiplin positif, mengelola emosi, dan self-esteem.', icon: 'Heart', color: '#EF476F', sortOrder: 5 },
  { name: 'Disiplin Positif', slug: 'disiplin-positif', parent: 'psikologi-anak', sortOrder: 1 },
  { name: 'Mengelola Emosi', slug: 'mengelola-emosi', parent: 'psikologi-anak', sortOrder: 2 },
  { name: 'Self-Esteem', slug: 'self-esteem', parent: 'psikologi-anak', sortOrder: 3 },

  { name: 'Parenting Tips', slug: 'parenting-tips', description: 'Tips praktis: new parents, co-parenting, work-life balance.', icon: 'Lightbulb', color: '#06D6A0', sortOrder: 6 },
  { name: 'New Parents', slug: 'new-parents', parent: 'parenting-tips', sortOrder: 1 },
  { name: 'Co-Parenting', slug: 'co-parenting', parent: 'parenting-tips', sortOrder: 2 },
  { name: 'Work-Life Balance', slug: 'work-life-balance', parent: 'parenting-tips', sortOrder: 3 },

  { name: 'Digital & Teknologi', slug: 'digital-teknologi', description: 'Screen time, keamanan digital, dan edukasi digital.', icon: 'Smartphone', color: '#8B5CF6', sortOrder: 7 },
  { name: 'Screen Time', slug: 'screen-time', parent: 'digital-teknologi', sortOrder: 1 },
  { name: 'Keamanan Digital', slug: 'keamanan-digital', parent: 'digital-teknologi', sortOrder: 2 },
  { name: 'Edukasi Digital', slug: 'edukasi-digital', parent: 'digital-teknologi', sortOrder: 3 },
];

/** Author bawaan. Konten pertama bisa menempel ke sini sampai editor membuat author sendiri. */
export const DEMO_AUTHOR = {
  name: 'Tim Editorial Mentari',
  slug: 'tim-editorial-mentari',
  title: 'Redaksi Mentari Smart Parent',
  bio: 'Tim internal yang mengkurasi konten parenting Mentari Smart Parent.',
  sortOrder: 0,
};

/**
 * Kredensial seed. Dua akun staf, tanpa akun demo/community palsu.
 *
 * Password default bisa diganti lewat env saat `pnpm db:seed`:
 *   SEED_ADMIN_PASSWORD=... SEED_EDITOR_PASSWORD=... pnpm db:seed
 * Jangan pakai default di server yang bisa diakses publik.
 */
export const SEED_USERS = [
  {
    email: 'admin@mentari.id',
    fullName: 'Admin Mentari',
    role: 'ADMIN' as const,
    envVar: 'SEED_ADMIN_PASSWORD',
    defaultPassword: 'mentari123',
  },
  {
    email: 'editor@mentari.id',
    fullName: 'Editor Mentari',
    role: 'EDITOR' as const,
    envVar: 'SEED_EDITOR_PASSWORD',
    defaultPassword: 'mentari123',
  },
];
