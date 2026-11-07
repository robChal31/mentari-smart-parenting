// Seed dataset — Indonesian parenting content for MentariSmartParent.
// Kept separate from the runner for readability.

export const AGE_GROUPS = [
  { name: 'Bayi (0-12 Bulan)', slug: 'bayi', minAge: 0, maxAge: 12, description: 'Konten untuk newborn hingga 12 bulan: MPASI, imunisasi, stimulasi dini.' },
  { name: 'Batita (1-3 Tahun)', slug: 'batita', minAge: 12, maxAge: 36, description: 'Konten untuk anak 1-3 tahun: bahasa, motorik, emosi, rutinitas.' },
  { name: 'Prasekolah (3-6 Tahun)', slug: 'prasekolah', minAge: 36, maxAge: 72, description: 'Konten untuk anak 3-6 tahun: persiapan sekolah, kreativitas, sosialisasi.' },
  { name: 'SD Awal (6-9 Tahun)', slug: 'sd-awal', minAge: 72, maxAge: 108, description: 'Konten untuk anak kelas 1-3 SD: belajar mandiri, tanggung jawab.' },
  { name: 'SD Akhir (9-12 Tahun)', slug: 'sd-akhir', minAge: 108, maxAge: 144, description: 'Konten untuk anak kelas 4-6 SD: literasi, karakter, persiapan SMP.' },
  { name: 'Semua Usia', slug: 'semua-usia', minAge: 0, maxAge: 144, description: 'Konten yang relevan untuk semua jenjang usia.' },
];

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

export const PRODUCTS: Array<{
  name: string; slug: string; description: string; shortDescription: string; type: string;
  price: number; thumbnailUrl: string; externalUrl: string; ctaText: string;
  isFeatured: boolean; sortOrder: number; ageGroupSlugs: string[];
}> = [
  {
    name: 'Buku Tematik SD Kelas 1–6 (Kurikulum Merdeka)',
    slug: 'buku-tematik-sd',
    description: 'Satu paket buku tematik resmi Kurikulum Merdeka untuk jenjang SD kelas 1–6. Disusun oleh tim penulis berpengalaman Mentari Group dengan ilustrasi menarik, latihan bertahap, dan asesmen formatif di setiap bab.',
    shortDescription: 'Paket lengkap buku pelajaran SD Kurikulum Merdeka, kelas 1–6.',
    type: 'BOOK_NATIONAL',
    price: 89000,
    thumbnailUrl: '/images/products/buku-tematik-sd.jpg',
    externalUrl: 'https://mentari.co.id/produk/buku-tematik-sd',
    ctaText: 'Lihat di Mentari',
    isFeatured: true,
    sortOrder: 1,
    ageGroupSlugs: ['sd-awal', 'sd-akhir'],
  },
  {
    name: 'Cambridge Primary English Stage 1–6',
    slug: 'cambridge-primary-english',
    description: 'Buku pelajaran Bahasa Inggris kurikulum internasional (Cambridge Primary) yang didistribusikan resmi oleh Mentari Group. Mengintegrasikan speaking, listening, reading, dan writing dengan task-based learning.',
    shortDescription: 'English for Cambridge Primary learners, Stage 1–6.',
    type: 'BOOK_INTERNATIONAL',
    price: 145000,
    thumbnailUrl: '/images/products/cambridge-primary-english.jpg',
    externalUrl: 'https://mentari.co.id/produk/cambridge-primary-english',
    ctaText: 'Lihat Detail',
    isFeatured: true,
    sortOrder: 2,
    ageGroupSlugs: ['sd-awal', 'sd-akhir'],
  },
  {
    name: 'Seri Dongeng Nusantara (8 Buku)',
    slug: 'seri-dongeng-nusantara',
    description: 'Delapan dongeng klasik nusantara dengan ilustrasi antologi karya ilustrator Indonesia. Setiap buku dilengkapi nilai karakter (kejujuran, keberanian, kepedulian) dan halaman aktivitas untuk anak.',
    shortDescription: '8 dongeng nusantara bergambar + nilai karakter.',
    type: 'BOOK_STORYBOOK',
    price: 175000,
    thumbnailUrl: '/images/products/seri-dongeng-nusantara.jpg',
    externalUrl: 'https://mentari.co.id/produk/seri-dongeng-nusantara',
    ctaText: 'Lihat di Mentari',
    isFeatured: true,
    sortOrder: 3,
    ageGroupSlugs: ['batita', 'prasekolah'],
  },
  {
    name: 'Mentari Digital Learning Platform — 1 Tahun',
    slug: 'mentari-digital-learning',
    description: 'Akses 12 bulan ke platform belajar digital Mentari: video lesson interaktif SD, bank soal anti-bocor, tryout berkala, dan laporan perkembangan untuk orang tua. Bisa diakses di HP, tablet, dan laptop.',
    shortDescription: 'Video lesson, tryout & laporan progres SD selama 12 bulan.',
    type: 'DIGITAL_LEARNING',
    price: 299000,
    thumbnailUrl: '/images/products/mentari-digital-learning.jpg',
    externalUrl: 'https://belajar.mentari.co.id',
    ctaText: 'Coba Gratis 7 Hari',
    isFeatured: true,
    sortOrder: 4,
    ageGroupSlugs: ['sd-awal', 'sd-akhir'],
  },
  {
    name: 'Mentari English Proficiency Assessment',
    slug: 'english-assessment',
    description: 'Tes kemampuan Bahasa Inggris untuk anak 4–15 tahun. Hasil berupa laporan 4 keterampilan (listening, speaking, reading, writing) lengkap dengan rekomendasi level dan materi lanjutan.',
    shortDescription: 'Tes kemampuan Bahasa Inggris anak 4–15 tahun + laporan 4 skill.',
    type: 'ENGLISH_ASSESSMENT',
    price: 150000,
    thumbnailUrl: '/images/products/english-assessment.jpg',
    externalUrl: 'https://assessment.mentari.co.id',
    ctaText: 'Jadwalkan Tes',
    isFeatured: false,
    sortOrder: 5,
    ageGroupSlugs: ['prasekolah', 'sd-awal', 'sd-akhir'],
  },
  {
    name: 'Teacher Academy: Early Childhood Education',
    slug: 'teacher-academy-ecd',
    description: 'Program sertifikasi guru PAUD/TK selama 8 minggu: pedagogi bermain, asesmen otentik, manajemen kelas, dan komunikasi dengan orang tua. Online + praktik lapangan, dengan mentor berpengalaman.',
    shortDescription: 'Sertifikasi guru PAUD/TK — 8 minggu, online + praktik.',
    type: 'TEACHER_ACADEMY',
    price: 750000,
    thumbnailUrl: '/images/products/teacher-academy.jpg',
    externalUrl: 'https://academy.mentari.co.id',
    ctaText: 'Lihat Kurikulum',
    isFeatured: false,
    sortOrder: 6,
    ageGroupSlugs: ['bayi', 'batita', 'prasekolah'],
  },
  {
    name: 'Buku Aktivitas Anak Kreatif (Usia 3–6 Tahun)',
    slug: 'buku-aktivitas-anak-kreatif',
    description: 'Buku aktivitas terbitan sendiri: 120 halaman puzzle, mewarnai, menggunting-menempel, dan labirin untuk melatih motorik halus & konsentrasi. Bebas fotokopi untuk kebutuhan kelas.',
    shortDescription: '120 halaman puzzle & aktivitas motorik halus untuk 3–6 tahun.',
    type: 'BOOK_SELF_PUBLISHED',
    price: 68000,
    thumbnailUrl: '/images/products/buku-aktivitas.jpg',
    externalUrl: 'https://mentari.co.id/produk/buku-aktivitas-anak-kreatif',
    ctaText: 'Lihat di Mentari',
    isFeatured: true,
    sortOrder: 7,
    ageGroupSlugs: ['batita', 'prasekolah'],
  },
];

const MIRA = { authorName: 'Mira Adityasari, M.Psi.', authorTitle: 'Psikolog Anak & Keluarga' };
const DRSARI = { authorName: 'dr. Sari Wulandari, Sp.A', authorTitle: 'Dokter Spesialis Anak' };
const DIMAS = { authorName: 'Dimas Prakoso', authorTitle: 'Fasilitator Parenting Mentari' };
const RATNA = { authorName: 'Ratna Ningrum, S.Pd.', authorTitle: 'Konsultan Pendidikan Anak Usia Dini' };
const TEAM = { authorName: 'Tim Mentari Smart Parent', authorTitle: 'Editorial Mentari Group' };

export interface SeedContent {
  title: string; slug: string; excerpt: string; body?: string; type: string;
  videoUrl?: string; videoDuration?: number; readTime?: number;
  isFeatured?: boolean; isPremium?: boolean; viewCount: number; likeCount?: number;
  publishedDaysAgo: number; author: { authorName: string; authorTitle: string };
  categorySlugs: string[]; ageGroupSlugs: string[]; tags: string[];
  metaTitle?: string; metaDescription?: string;
}

export const CONTENTS: SeedContent[] = [
  {
    title: 'Takaran MPASI 6–24 Bulan: Panduan Porsi Menurut Dokter Anak',
    slug: 'takaran-mpasi-6-24-bulan',
    excerpt: 'Berapa sendok makan yang ideal untuk bayi 6, 8, atau 12 bulan? dr. Rony Tamba, Sp.A menjelaskan porsi MPASI bertahap sesuai usia dan tanda kenyang bayi.',
    type: 'VIDEO',
    videoUrl: 'https://www.youtube.com/embed/b-nwf9Z-sNg',
    videoDuration: 684,
    isFeatured: true,
    viewCount: 24512,
    likeCount: 1287,
    publishedDaysAgo: 3,
    author: DRSARI,
    categorySlugs: ['gizi-anak'],
    ageGroupSlugs: ['bayi', 'batita'],
    tags: ['mpasi', 'gizi', 'bayi'],
    metaTitle: 'Takaran MPASI Sesuai Usia 6–24 Bulan | Mentari Smart Parent',
    metaDescription: 'Panduan porsi MPASI bertahap dari dr. Rony Tamba, Sp.A — dari 2 sendok makan di usia 6 bulan hingga 3/4 piring di usia 12+ bulan.',
  },
  {
    title: 'Kupas Tuntas MPASI: Kesalahan yang Sering Dibuat Orang Tua',
    slug: 'kupas-tuntas-mpasi',
    excerpt: 'dr. Deva Putriane membahas kesalahan klasik MPASI: terlalu dini, tekstur tidak naik, menu tidak variatif, hingga garam & gula berlebih.',
    type: 'VIDEO',
    videoUrl: 'https://www.youtube.com/embed/9DkCKsMK8Ho',
    videoDuration: 902,
    viewCount: 18930,
    likeCount: 942,
    publishedDaysAgo: 9,
    author: DRSARI,
    categorySlugs: ['gizi-anak'],
    ageGroupSlugs: ['bayi'],
    tags: ['mpasi', 'gizi', 'bayi'],
  },
  {
    title: 'Kebutuhan ASI Bayi Sesuai Usia: Jangan Sampai Kurang!',
    slug: 'kebutuhan-asi-bayi-sesuai-usia',
    excerpt: 'Panduan dokter RSUI tentang jumlah ASI yang dibutuhkan bayi di setiap tahap usia — dari newborn hingga 2 tahun.',
    type: 'VIDEO',
    videoUrl: 'https://www.youtube.com/embed/OS-yywQl6Hg',
    videoDuration: 540,
    viewCount: 12540,
    likeCount: 655,
    publishedDaysAgo: 15,
    author: DRSARI,
    categorySlugs: ['gizi-anak'],
    ageGroupSlugs: ['bayi'],
    tags: ['asi', 'bayi', 'menyusui'],
  },
  {
    title: 'Menghadapi Tantrum dengan Tenang: 5 Langkah Terbukti',
    slug: 'menghadapi-tantrum-dengan-tenang',
    excerpt: 'Tantrum bukan kenakalan — ini sinyal anak yang kewalahan mengelola emosi. Pelajari 5 langkah respons tenang yang terbukti secara psikologis.',
    type: 'VIDEO',
    videoUrl: 'https://www.youtube.com/embed/FN-LXa2iHSg',
    videoDuration: 743,
    isFeatured: true,
    viewCount: 31208,
    likeCount: 1754,
    publishedDaysAgo: 5,
    author: MIRA,
    categorySlugs: ['mengelola-emosi', 'sosial-emosional'],
    ageGroupSlugs: ['batita', 'prasekolah'],
    tags: ['tantrum', 'emosi', 'disiplin-positif'],
  },
  {
    title: 'Webinar: Mengelola Emosi Saat Anak Tantrum',
    slug: 'webinar-mengelola-emosi-tantrum',
    excerpt: 'Sesi webinar live bersama psikolog anak: penyebab tantrum, fase-fase kemarahan anak, dan skrip kalimat yang bisa langsung dipakai di rumah.',
    type: 'VIDEO',
    videoUrl: 'https://www.youtube.com/embed/9tOhUvW-95k',
    videoDuration: 1830,
    viewCount: 9874,
    likeCount: 512,
    publishedDaysAgo: 21,
    author: MIRA,
    categorySlugs: ['mengelola-emosi'],
    ageGroupSlugs: ['batita', 'prasekolah', 'sd-awal'],
    tags: ['tantrum', 'emosi', 'webinar'],
  },
  {
    title: 'Tantrum Manipulatif vs Tantrum Frustrasi: Bedanya Apa?',
    slug: 'tantrum-manipulatif-vs-frustrasi',
    excerpt: 'Tidak semua tantrum sama. Kenali perbedaan tantrum manipulatif dan tantrum frustrasi, dan respons yang tepat untuk masing-masing.',
    type: 'VIDEO',
    videoUrl: 'https://www.youtube.com/embed/RIGxQbSlb_w',
    videoDuration: 621,
    viewCount: 15467,
    likeCount: 788,
    publishedDaysAgo: 12,
    author: MIRA,
    categorySlugs: ['mengelola-emosi', 'psikologi-anak'],
    ageGroupSlugs: ['batita', 'prasekolah'],
    tags: ['tantrum', 'emosi'],
  },
  {
    title: 'Memahami Kenapa Anak Tantrum dan Cara Mengatasinya',
    slug: 'kenapa-anak-tantrum-cara-mengatasinya',
    excerpt: 'Hidup Sehat tvOne membahas sisi medis & psikologis di balik tantrum — dan kapan orang tua perlu khawatir.',
    type: 'VIDEO',
    videoUrl: 'https://www.youtube.com/embed/1Xy3bxopth0',
    videoDuration: 812,
    viewCount: 11203,
    likeCount: 590,
    publishedDaysAgo: 27,
    author: { authorName: 'Redaksi Hidup Sehat tvOne', authorTitle: 'Media Kesehatan' },
    categorySlugs: ['mengelola-emosi'],
    ageGroupSlugs: ['prasekolah'],
    tags: ['tantrum', 'kesehatan'],
  },
  {
    title: 'Panduan MPASI 6 Bulan: Menu, Tekstur, dan Jadwal Minggu Pertama',
    slug: 'panduan-mpasi-6-bulan',
    excerpt: 'Dari ASI eksklusif ke makanan pertama: urutan mengenalkan tekstur, contoh menu 7 hari pertama, dan tanda bayi siap makan.',
    type: 'ARTICLE',
    readTime: 8,
    isFeatured: true,
    viewCount: 28934,
    likeCount: 1567,
    publishedDaysAgo: 2,
    author: DRSARI,
    categorySlugs: ['gizi-anak'],
    ageGroupSlugs: ['bayi'],
    tags: ['mpasi', 'menu-bayi', 'gizi'],
    body: `Memulai MPASI di usia 6 bulan adalah tonggak besar — untuk bayi dan orang tua. Artikel ini merangkum hal-hal paling penting agar minggu pertama berjalan lancar.

## Tanda bayi siap MPASI
- Sudah bisa duduk dengan sedikit/tanpa bantuan dan menegakkan kepala
- Hilang refleks menjulurkan lidah (tongue thrust)
- Tertarik melihat makanan dan membuka mulut saat disuap
- Berat badan minimal dua kali berat lahir

## Prinsip minggu pertama
1. **Frekuensi**: 1–2 kali sehari, selingi ASI
2. **Porsi**: 2–3 sendok makan per sesi, naikkan bertahap
3. **Tekstur**: halus (puree) → saring → cincang kasar seiring usia
4. **Variasi**: kenalkan satu bahan baru setiap 3 hari untuk memantau alergi

## Contoh menu 7 hari pertama
- Hari 1–2: puree labu kuning + ASI
- Hari 3–4: puree kentang + wortel + ASI
- Hari 5–6: bubur beras merah + ayam suwir halus
- Hari 7: puree pisang ambon / pepaya

## Yang perlu dihindari
Gula dan garam tambahan, madu (di bawah 1 tahun), susu sapi murni sebagai minuman, serta jus buah. Pastikan konsultasi dengan dokter anak bila bayi lahir prematur atau memiliki riwayat alergi.

**Intinya**: MPASI bukan soal seberapa banyak, tapi seberapa konsisten dan bervariasi. Nikmati prosesnya — makan adalah pengalaman belajar pertama anak.`,
    metaTitle: 'Panduan MPASI 6 Bulan: Menu & Jadwal Minggu Pertama | Mentari',
    metaDescription: 'Panduan lengkap memulai MPASI: tanda bayi siap, contoh menu 7 hari pertama, tekstur bertahap, dan bahan yang harus dihindari.',
  },
  {
    title: 'Jadwal Imunisasi Dasar Lengkap 2025: Ini yang Wajib Anda Tahu',
    slug: 'jadwal-imunisasi-dasar-lengkap',
    excerpt: 'Ringkasan imunisasi dasar untuk bayi 0–18 bulan menurut rekomendasi IDAI: hepatitis B, BCG, polio, DPT-HB-Hib, campak, dan PCV.',
    type: 'ARTICLE',
    readTime: 10,
    viewCount: 16721,
    likeCount: 723,
    publishedDaysAgo: 8,
    author: DRSARI,
    categorySlugs: ['imunisasi', 'kesehatan-fisik'],
    ageGroupSlugs: ['bayi'],
    tags: ['imunisasi', 'vaksin', 'bayi'],
    body: `Imunisasi adalah investasi kesehatan paling berharga di 1000 hari pertama kehidupan. Berikut ringkasan jadwal imunisasi dasar menurut rekomendasi IDAI.

## Jadwal ringkas
- **Lahir**: Hepatitis B-0, polio oral (OPV-0)
- **1 bulan**: BCG, Hepatitis B-1
- **2 bulan**: DPT-HB-Hib 1, polio 1, PCV 1, rotavirus 1
- **3 bulan**: DPT-HB-Hib 2, polio 2, rotavirus 2
- **4 bulan**: DPT-HB-Hib 3, polio 3, PCV 2, rotavirus 3
- **9 bulan**: Campak/MR
- **18 bulan**: DPT-HB-Hib booster, polio booster

## Kenapa tidak boleh ditunda?
Vaksin bekerja membentuk antibodi sebelum anak terpapar. Menunda berarti memperpanjang jendela rentan terhadap penyakit berat seperti pneumonia, meningitis, dan campak.

## Efek samping yang wajar
Demam ringan 1–2 hari, nyeri di bekas suntikan, atau anak sedikit rewel. Ini tanda sistem imun sedang bekerja. Kompres hangat dan ASI cukup biasanya sudah memadai; hubungi dokter bila demam > 39°C atau bayi tampak sangat lemah.

Diskusikan kondisi khusus (alergi, prematur, penyakit bawaan) dengan dokter anak Anda.`,
  },
  {
    title: '12 Ide Permainan Edukatif Tanpa Gadget untuk Anak 3–6 Tahun',
    slug: 'permainan-edukatif-tanpa-gadget',
    excerpt: 'Dari treasure hunt hingga sains dapur: 12 permainan murah meriah yang melatih motorik, kognitif, dan bonding orang tua–anak.',
    type: 'ARTICLE',
    readTime: 12,
    isFeatured: true,
    viewCount: 27650,
    likeCount: 1689,
    publishedDaysAgo: 6,
    author: RATNA,
    categorySlugs: ['permainan-edukatif', 'diy-crafts'],
    ageGroupSlugs: ['prasekolah'],
    tags: ['permainan-edukatif', 'tanpa-gadget', 'bonding'],
    body: `Anak usia 3–6 tahun belajar paling efektif lewat bermain. Kabar baiknya: permainan terbaik tidak butuh layar atau mainan mahal.

## Permainan motorik & kognitif
1. **Treasure hunt** — petunjuk bergambar, cari benda di rumah
2. **Menyortir warna & bentuk** dengan tutup botol
3. **Menjepit jemuran** — memindahkan biji dengan capit bebek
4. **Menyusun menara balok** sambil berhitung
5. **Papan lompat angka** dari koran bekas

## Permainan bahasa
6. **Bercerita bergantian** — satu kalimat bergiliran membuat cerita
7. **Tebak hewan** dari suara dan ciri-cirinya
8. **Menebak rasa** makanan dengan mata tertutup

## Permainan sains & kreativitas
9. **Erupsi gunung berapi** — cuka + baking soda + pewarna makanan
10. **Menanam kacang hijau** di kapas basah — lihat tumbuh setiap hari
11. **Dam mainan dari kardus** — membendung aliran air
12. **Kolase tekstur** — daun kering, kain, kertas pasir

Setiap permainan di atas melatih eksekutif fungsi: fokus, bergiliran, dan menyelesaikan tugas. Main bersama 20 menit sehari sudah jauh lebih berharga daripada 2 jam screen time pasif.`,
  },
  {
    title: 'Checklist Persiapan Anak Masuk SD: 9 Aspek yang Harus Matang',
    slug: 'checklist-persiapan-anak-masuk-sd',
    excerpt: 'School readiness bukan soal bisa baca-tulis saja. Cek 9 aspek: dari motorik halus, kemandirian, hingga kesiapan emosional menghadapi sekolah baru.',
    type: 'ARTICLE',
    readTime: 9,
    isFeatured: true,
    viewCount: 33412,
    likeCount: 1841,
    publishedDaysAgo: 4,
    author: RATNA,
    categorySlugs: ['persiapan-sekolah'],
    ageGroupSlugs: ['prasekolah', 'sd-awal'],
    tags: ['masuk-sd', 'school-readiness', 'checklist'],
    body: `Banyak orang tua cemas apakah anaknya “siap” masuk SD. Padahal kesiapan sekolah jauh lebih luas daripada bisa baca dan menulis.

## 9 aspek school readiness
1. **Motorik halus**: memegang pensil dengan tripod grip, menggunting, menulis huruf sederhana
2. **Motorik kasar**: berlari, melompat, naik tangga bergantian kaki
3. **Kemandirian**: toilet sendiri, mengancingkan baju, buka-tutup bekal
4. **Fokus & atensi**: duduk dan menyelesaikan tugas 10–15 menit
5. **Bahasa**: memahami instruksi 2 langkah, menceritakan kejadian sehari-hari
6. **Sosial**: mau bergantian, antri, dan bekerja sama dalam kelompok
7. **Emosional**: mengelola kekecewaan, berani berpisah dari orang tua
8. **Kognitif**: mengenal angka 1–20, bentuk, dan warna
9. **Rutinitas**: bangun pagi, tidur teratur, sarapan sendiri

## Cara melatihnya di rumah
- Ritual belajar 15 menit/hari (buku gambar, mewarnai, menulis nama)
- Latihan tanggung jawab kecil: merapikan mainan, menyiapkan bekal sendiri
- Main peran “sekolah-sekolahan” agar anak familiar dengan rutinitas kelas
- Kunjungi sekolah tujuannya sebelum hari pertama

Anak yang siap secara emosional dan sosial akan jauh lebih cepat beradaptasi daripada anak yang hanya siap secara akademik.`,
  },
  {
    title: 'Screen Time untuk Balita: Batas Aman Menurut Dokter Anak',
    slug: 'screen-time-balita-batas-aman',
    excerpt: 'WHO merekomendasikan 0 menit screen time sebelum usia 2 tahun. Ini panduan praktis menerapkannya tanpa drama di rumah.',
    type: 'ARTICLE',
    readTime: 6,
    viewCount: 21305,
    likeCount: 1102,
    publishedDaysAgo: 7,
    author: DRSARI,
    categorySlugs: ['screen-time', 'digital-teknologi'],
    ageGroupSlugs: ['batita', 'prasekolah'],
    tags: ['screen-time', 'gadget', 'balita'],
    body: `Screen time adalah topik yang membelah orang tua modern. Rekomendasi WHO dan IDAI cukup jelas — pertanyaannya adalah bagaimana menerapkannya di dunia nyata.

## Rekomendasi resmi
- **< 2 tahun**: hindari screen time (kecuali video call keluarga)
- **2–5 tahun**: maksimal 1 jam/hari, konten berkualitas, didampingi
- **6+ tahun**: buat kesepakatan keluarga yang konsisten

## Kenapa dibatasi?
Otak balita berkembang lewat interaksi dua arah. Layar memberikan stimulasi satu arah: tidak melatih bahasa, kontrol diri, atau empati. Riset menunjukkan screen time berlebih berkorelasi dengan keterlambatan bicara dan masalah fokus.

## Strategi tanpa drama
1. **Ganti, jangan larang mentah** — sediakan alternatif menarik (stiker, playdough, buku)
2. **Zona bebas gadget** — meja makan dan kamar tidur
3. **Co-viewing** — tonton bersama, bahas, lalu matikan
4. **Orang tua jadi teladan** — anak meniru yang dia lihat, bukan yang dia dengar

Kalau anak telanjur terbiasa, kurangi bertahap — bukan drastis dalam semalam.`,
  },
  {
    title: 'Mendisiplinkan Tanpa Memukul: 7 Teknik Disiplin Positif',
    slug: 'disiplin-positif-tanpa-memukul',
    excerpt: 'Hukuman fisik merusak rasa aman anak. Berikut 7 teknik disiplin positif yang membangun karakter, bukan ketakutan.',
    type: 'ARTICLE',
    readTime: 11,
    isFeatured: true,
    viewCount: 30154,
    likeCount: 1734,
    publishedDaysAgo: 10,
    author: MIRA,
    categorySlugs: ['disiplin-positif'],
    ageGroupSlugs: ['prasekolah', 'sd-awal', 'sd-akhir'],
    tags: ['disiplin-positif', 'tanpa-memukul', 'karakter'],
    body: `Disiplin berasal dari kata *disciplina* — pengajaran. Tujuannya membentuk karakter, bukan menakuti anak agar patuh sesaat.

## 7 teknik disiplin positif
1. **Natural consequence** — biarkan anak merasakan akibat wajar (tidak pakai jaket → kedinginan)
2. **Logical consequence** — akibat yang relevan (tidak membereskan mainan → mainan disimpan 1 hari)
3. **Time-in, bukan time-out** — duduk bersama dan bicara saat emosi sudah reda
4. **Pilihan terbatas** — “Mau sikat gigi sebelum atau sesudah piyama?”
5. **Aturan keluarga tertulis** — disepakati bersama, tertempel di kulkas
6. **Validasi emosi, koreksi perilaku** — “Kamu marah boleh, memukul tidak”
7. **Routine & ritual** — konsistensi mencegah sebagian besar konflik

## Kenapa pukulan kontraproduktif
Riset longitudinal menunjukkan hukuman fisik meningkatkan agresi, merusak kelekatan, dan mengajarkan bahwa kekerasan adalah cara menyelesaikan masalah. Anak yang patuh karena takut tidak belajar mana yang benar — dia hanya belajar menghindari ketahuan.

Disiplin bukan tentang mempertahankan otoritas, tapi membimbing anak memahami dampak tindakannya — dan itu butuh kesabaran berulang kali.`,
  },
  {
    title: 'Stimulasi Bahasa Anak 1–3 Tahun: 20 Aktivitas Sehari-hari',
    slug: 'stimulasi-bahasa-anak-1-3-tahun',
    excerpt: 'Bahasa tumbuh dari percakapan nyata, bukan dari layar. 20 aktivitas verbal sehari-hari yang bisa disisipkan kapan saja.',
    type: 'ARTICLE',
    readTime: 10,
    viewCount: 19847,
    likeCount: 1011,
    publishedDaysAgo: 11,
    author: RATNA,
    categorySlugs: ['bahasa'],
    ageGroupSlugs: ['batita'],
    tags: ['bahasa', 'stimulasi', 'batita'],
    body: `Ledakan kosa kata terjadi di usia 1–3 tahun. Kuantitas dan kualitas bicara orang tua adalah prediktor terbesar kemampuan bahasa anak.

## 20 aktivitas stimulasi bahasa
1–5. **Narasi kegiatan**: “Ibu sedang memotong wortel, wortelnya oranye” — komentari apa pun yang Anda kerjakan
6–8. **Membaca bersama**: tunjuk gambar, sebutkan nama, tunggu anak meniru
9–11. **Tanya terbuka**: “Menurut kamu kucing ini sedang apa?”
12. **Nyanyian berulang** — anak 1–2 tahun belajar lewat repetisi
13–15. **Main peran**: telepon-teleponan, pura-pura masak
16. **Flashcard kosakata** sederhana, 5 menit/hari
17. **Menyebut bagian tubuh** saat mandi
18. **Berhitung benda** sehari-hari (sendok, sepatu)
19. **Ceritakan ulang** kejadian hari ini sebelum tidur
20. **Tunggu & jawab** — beri anak waktu 5 detik menjawab sebelum membantu

## Tanda perlu konsultasi
- 18 bulan: belum punya kata bermakna
- 2 tahun: belum bisa merangkai 2 kata
- 3 tahun: bicara sulit dimengerti orang lain

Bila ada tanda ini, segera konsultasikan ke dokter anak atau terapis wicara.`,
  },
  {
    title: 'Rutinitas Tidur Anak: Jadwal Ideal dari Bayi hingga SD',
    slug: 'rutinitas-tidur-anak-jadwal-ideal',
    excerpt: 'Berapa jam tidur anak ideal per usia, dan bagaimana membangun ritual tidur yang konsisten tanpa drama tengah malam?',
    type: 'ARTICLE',
    readTime: 7,
    viewCount: 14356,
    likeCount: 645,
    publishedDaysAgo: 14,
    author: DIMAS,
    categorySlugs: ['kesehatan-fisik'],
    ageGroupSlugs: ['batita', 'prasekolah', 'sd-awal'],
    tags: ['tidur', 'rutinitas', 'kesehatan'],
    body: `Tidur adalah pilar tumbuh kembang yang sering diremehkan. Kurang tidur menurunkan fokus, imunitas, dan regulasi emosi anak.

## Kebutuhan tidur per usia (total per 24 jam)
- Bayi 4–12 bulan: 12–16 jam (termasuk tidur siang)
- Batita 1–2 tahun: 11–14 jam
- Prasekolah 3–5 tahun: 10–13 jam
- SD 6–12 tahun: 9–12 jam

## Ritual tidur 30 menit yang terbukti efektif
1. Mandi air hangat
2. Pakai piyama, sikat gigi
3. Redupkan lampu, singkirkan gadget
4. Baca buku cerita 10 menit
5. Ucapkan 1 hal yang disyukuri hari ini
6. Peluk & bobokan di waktu yang sama setiap malam

Konsistensi 2 minggu biasanya cukup membentuk kebiasaan. Jika anak sering terbangun di malam hari di atas usia 2 tahun, evaluasi asupan kafein (termasuk cokelat), screen time malam, dan kecemasan perpisahan.`,
  },
  {
    title: 'Tanda-tanda Siap Sekolah (School Readiness): Fisik, Sosial, Emosi',
    slug: 'tanda-tanda-siap-sekolah',
    excerpt: 'Bagaimana tahu anak benar-benar siap sekolah — bukan sekadar cukup umur? Kenali 12 tanda kesiapan dari tiga domain utama.',
    type: 'ARTICLE',
    readTime: 8,
    viewCount: 17690,
    likeCount: 834,
    publishedDaysAgo: 18,
    author: RATNA,
    categorySlugs: ['persiapan-sekolah'],
    ageGroupSlugs: ['prasekolah'],
    tags: ['masuk-sd', 'school-readiness'],
    body: `Usia bukan satu-satunya penentu kesiapan sekolah. Dua anak seumur bisa sangat berbeda kesiapan belajarnya.

## Domain fisik
- Duduk dan fokus 15–20 menit
- Motorik halus: pegang pensil, gunting, kancing baju
- Istirahat teratur dan sudah tidak tidur siang

## Domain sosial
- Bisa bermain kooperatif dan bergantian
- Mampu menunggu giliran dan antri
- Berani berinteraksi dengan orang dewasa selain orang tuanya

## Domain emosional
- Bisa berpisah dengan orang tua tanpa panik berkepanjangan
- Mengekspresikan kebutuhan dengan kata, bukan tangisan
- Fleksibel terhadap aturan dan rutinitas baru

## Apa yang bisa dilakukan orang tua
Kunjungi sekolahnya, bertemu guru, latihan pemisahan bertahap (mulai 1–2 jam), dan bacakan cerita tentang pengalaman sekolah. Bila ragu, konsultasikan ke psikolog anak — asesmen school readiness biasanya hanya 1–2 sesi.`,
  },
  {
    title: 'Anak Malas Belajar? 5 Pendekatan Montessori yang Bisa Dicoba di Rumah',
    slug: 'pendekatan-montessori-anak-malas-belajar',
    excerpt: 'Montessori bukan metode mahal — esensinya adalah kemandirian dan lingkungan yang “undang” anak belajar. Ini 5 prinsipnya untuk rumah.',
    type: 'ARTICLE',
    readTime: 13,
    viewCount: 22467,
    likeCount: 1203,
    publishedDaysAgo: 16,
    author: RATNA,
    categorySlugs: ['belajar-di-rumah', 'kurikulum-akademik'],
    ageGroupSlugs: ['sd-awal', 'sd-akhir'],
    tags: ['montessori', 'belajar-di-rumah', 'motivasi'],
    body: `“Anak malas belajar” seringkali sebenarnya “anak bosan dengan cara belajar yang tidak sesuai dirinya”. Montessori menawarkan kerangka sederhana untuk membalikkan itu.

## 5 prinsip Montessori di rumah
1. **Ikuti anak (follow the child)** — amati apa yang menarik baginya, lalu perdalam dari sana (dinosaurus → baca buku dinos → tulis cerita dinos)
2. **Lingkungan yang mengundang** — rak rendah, buku terbuka, alat seukuran anak
3. **Pekerjaan nyata** — melibatkan anak memasak, berkebun, merapikan — belajar matematika & sains terjadi alami
4. **Kemerdekaan dengan batasan** — “Kamu boleh pilih jam belajar: setelah mandi atau setelah makan malam?”
5. **Konsentrasi tidak diganggu** — jangan interupsi saat anak fokus, meski caranya terlihat berantakan

## Yang bukan Montessori sejati
Memaksa “edukatif” ke semua hal, membeli semua alat mahal, atau memaksa mandiri sebelum anak siap. Esensinya observasi + respons, bukan perlengkapan.

Mulai minggu ini: pilih SATU sudut belajar di rumah dan tata ulang bersama anak.`,
  },
  {
    title: 'Co-Parenting Setelah Bercerai: Menjaga Anak Tetap Aman & Bahagia',
    slug: 'co-parenting-setelah-bercerai',
    excerpt: 'Perceraian orang tua bukan akhir dunia anak. 7 prinsip co-parenting sehat agar anak tidak jadi korban konflik.',
    type: 'ARTICLE',
    readTime: 9,
    viewCount: 8932,
    likeCount: 487,
    publishedDaysAgo: 24,
    author: MIRA,
    categorySlugs: ['co-parenting'],
    ageGroupSlugs: ['semua-usia'],
    tags: ['co-parenting', 'perceraian', 'keluarga'],
    body: `Anak tidak butuh orang tua yang sempurna — mereka butuh orang tua yang mau bekerja sama melewati masa sulit.

## 7 prinsip co-parenting sehat
1. **Pisahkan konflik dewasa dari anak** — tidak ada pesan “titipan” lewat anak
2. **Satu suara soal aturan inti** — jam tidur, sekolah, gadget: sepakati bersama
3. **Transisi yang tenang** — serah-terima anak dilakukan netral dan tepat waktu
4. **Jangan bicara buruk soal pasangan di depan anak** — anak adalah bagian dari keduanya
5. **Fleksibel dan manusiawi** — jadwal bisa menyesuaikan ulang tahun & event penting
6. **Komunikasi praktis, bukan emosional** — pakai grup chat khusus urusan anak
7. **Jaga diri sendiri** — anak butuh orang tua yang stabil secara emosional

Anak paling menderita bukan karena orang tuanya berpisah, tapi karena terus terpapar konflik. Bila komunikasi macet, mediator keluarga atau konselor bisa menjadi jembatan.`,
  },
  {
    title: 'Keamanan Digital untuk Anak: Aturan 3C (Content, Contact, Conduct)',
    slug: 'keamanan-digital-anak-aturan-3c',
    excerpt: 'Kerangka 3C dari internet safety: konten yang dilihat, kontak yang bisa menghubungi, dan perilaku online anak.',
    type: 'ARTICLE',
    readTime: 8,
    viewCount: 13478,
    likeCount: 698,
    publishedDaysAgo: 19,
    author: DIMAS,
    categorySlugs: ['keamanan-digital'],
    ageGroupSlugs: ['sd-awal', 'sd-akhir'],
    tags: ['keamanan-digital', 'internet', 'sd'],
    body: `Literasi digital bukan cuma soal memakai gadget, tapi soal bertahan aman di dalamnya. Kerangka 3C dari internet safety memudahkan orang tua mengaudit.

## C1 — Content (konten)
- Aktifkan SafeSearch & YouTube Kids untuk usia < 13 tahun
- Periksa usia rating gim & aplikasi bersama anak
- Diskusikan iklan dan hoaks — anak SD belum bisa membedakannya sendiri

## C2 — Contact (kontak)
- Jelaskan: orang asing di internet tetap orang asing
- Tidak berbagi nama lengkap, alamat, sekolah, atau password
- Semua DM dari orang tidak dikenal: report + block + cerita ke orang tua

## C3 — Conduct (perilaku)
- Be kind online: tidak berkomentar jahat, tidak ikut cyberbullying
- Think before post: jejak digital itu permanen
- Kalau melihat konten mengganggu: tutup, lapor, cerita ke orang tua/guru

Buat “kontrak digital keluarga” tertulis dan tinjau ulang setiap 6 bulan seiring bertambahnya usia anak.`,
  },
  {
    title: 'Membentuk Self-Esteem Anak: 10 Kalimat Ajaib yang Perlu Diucapkan Orang Tua',
    slug: 'membentuk-self-esteem-anak-kalimat-ajaib',
    excerpt: 'Harga diri anak dibangun dari kata-kata sehari-hari orang tua. 10 kalimat ini menumbuhkan anak yang percaya pada dirinya.',
    type: 'ARTICLE',
    readTime: 6,
    isFeatured: true,
    viewCount: 25893,
    likeCount: 1512,
    publishedDaysAgo: 1,
    author: MIRA,
    categorySlugs: ['self-esteem'],
    ageGroupSlugs: ['semua-usia', 'batita', 'prasekolah'],
    tags: ['self-esteem', 'pujian', 'karakter'],
    body: `Self-esteem bukan tentang merasa paling hebat, tapi tentang merasa cukup berharga sebagai manusia. Pondasinya dibangun dari kalimat sehari-hari.

## 10 kalimat yang menumbuhkan self-esteem
1. “Kesalahan itu wajar, yang penting kamu berani coba.”
2. “Aku suka cara kamu berusaha.”
3. “Kamu boleh sedih — Ibu/Ayah di sini.”
4. “Menurut kamu bagaimana?”
5. “Kamu pasti bisa, tapi Ibu/Ayah tetap akan bantu kalau perlu.”
6. “Terima kasih sudah jujur.”
7. “Aku bangga kamu mau minta maaf.”
8. “Apa yang bisa kita pelajari dari ini?”
9. “Setiap orang punya kecepatannya sendiri.”
10. “Kamu dicintai bukan karena nilaimu, tapi karena kamu kamu.”

## Hindari pujian kosong
“Kamu paling pintar!” terdengar baik, tapi anak belajar nilai dirinya dari prestasi. Ganti dengan pujian proses: spesifik, tulus, dan tentang usaha.`,
  },
  {
    title: '5 Tips Menidurkan Anak Lebih Cepat',
    slug: 'tips-menidurkan-anak-lebih-cepat',
    excerpt: 'Ritual 20 menit, lampu hangat, dan satu kebiasaan kecil yang membuat anak tertidur dalam hitungan menit.',
    type: 'TIPS',
    readTime: 3,
    viewCount: 17200,
    likeCount: 745,
    publishedDaysAgo: 5,
    author: DIMAS,
    categorySlugs: ['kesehatan-fisik', 'parenting-tips'],
    ageGroupSlugs: ['semua-usia'],
    tags: ['tidur', 'tips'],
    body: `- Mulai ritual tidur di jam yang sama setiap malam
- Redupkan lampu 30 menit sebelum tidur
- Ganti layar dengan buku cerita
- Pakai musik tidur yang konsisten (white noise / ninabobok)
- Ucapkan 1–3 kalimat positif tentang hari ini`,
  },
  {
    title: 'Checklist Bekal Sekolah Sehat 5 Menit',
    slug: 'checklist-bekal-sekolah-sehat',
    excerpt: 'Formula sederhana: 1 karbohidrat + 1 protein + 1 sayur + 1 buah — selesai dalam 5 menit tiap pagi.',
    type: 'TIPS',
    readTime: 3,
    viewCount: 14500,
    likeCount: 512,
    publishedDaysAgo: 13,
    author: DRSARI,
    categorySlugs: ['gizi-anak'],
    ageGroupSlugs: ['sd-awal', 'sd-akhir'],
    tags: ['bekal', 'gizi', 'sekolah'],
    body: `Gunakan formula 4 bintang:
1. **Karbohidrat** — nasi, roti, pasta, kentang
2. **Protein** — telur, ayam, tempe, keju
3. **Sayur** — wortel rebus, buncis, brokoli
4. **Buah** — pisang, jeruk, melon
Plus air putih. Siapkan malam sebelumnya agar pagi lebih santai.`,
  },
  {
    title: 'Eksperimen Sains Sederhana di Dapur (Usia 4–8 Tahun)',
    slug: 'eksperimen-sains-sederhana-di-dapur',
    excerpt: 'Gunung berapi cuka, pelangi dalam gelas, dan telur terapung: 5 eksperimen sains dari bahan dapur yang membuat anak takjub.',
    type: 'ACTIVITY',
    readTime: 10,
    viewCount: 20113,
    likeCount: 1340,
    publishedDaysAgo: 9,
    author: RATNA,
    categorySlugs: ['diy-crafts', 'kognitif'],
    ageGroupSlugs: ['prasekolah', 'sd-awal'],
    tags: ['sains', 'eksperimen', 'aktivitas'],
    body: `## 1. Gunung berapi cuka + baking soda
Cuka + baking soda + pewarna makanan di botol — lihat reaksinya “meletus”.

## 2. Pelangi dalam gelas
Tuang air gula dengan kadar berbeda + pewarna, tuang perlahan — terbentuk lapisan warna.

## 3. Telur terapung
Air tawar vs air garam — telur tenggelam di yang satu, mengapung di yang lain (densitas!).

## 4. Kapal dari kertas timah
Eksplorasi gaya apung: berapa koin bisa diangkut sebelum tenggelam?

## 5. Kristal gula di benang
Gula jenuh + benang = kristal dalam semalam.

Setelah eksperimen, tanya: “Menurut kamu kenapa bisa begitu?” — biarkan anak menebak dulu, baru jelaskan sederhananya.`,
  },
  {
    title: 'Scavenger Hunt Alam: Belajar Lingkungan di Sekitar Rumah',
    slug: 'scavenger-hunt-alam',
    excerpt: 'Cetak checklist ini, ajak anak keluar: temukan 3 daun berbeda, 2 serangga, 1 batu unik — sains & petualangan jadi satu.',
    type: 'ACTIVITY',
    readTime: 6,
    viewCount: 12570,
    likeCount: 689,
    publishedDaysAgo: 22,
    author: DIMAS,
    categorySlugs: ['outdoor-activities'],
    ageGroupSlugs: ['prasekolah', 'sd-awal'],
    tags: ['outdoor', 'aktivitas', 'alam'],
    body: `## Cara main
1. Cetak atau gambar checklist: 3 bentuk daun, 2 jenis serangga, 1 batu paling unik, sesuatu yang berbau harum, 3 warna yang berbeda
2. Beri anak tas kecil / kantong untuk “hasil buruan”
3. Ajak keliling taman/ komplek 30 menit
4. Di rumah: tempel temuan di “papan sains” dan bahas namanya

Anak belajar observasi, kosakata alam, dan menghargai lingkungan — gratis, tanpa layar.`,
  },
  {
    title: 'Infografis: Milestone Bicara Anak 0–5 Tahun',
    slug: 'infografis-milestone-bicara-0-5-tahun',
    excerpt: 'Ringkasan visual perkembangan bicara: dari cooing di 2 bulan hingga kalimat lengkap di usia 4 tahun — plus red flags yang perlu diwaspadai.',
    type: 'INFOGRAPHIC',
    viewCount: 19023,
    likeCount: 978,
    publishedDaysAgo: 6,
    author: TEAM,
    categorySlugs: ['bahasa', 'kognitif'],
    ageGroupSlugs: ['bayi', 'batita', 'prasekolah'],
    tags: ['milestone', 'bahasa', 'infografis'],
    body: `**0–6 bulan**: cooing, mengoceh, respons terhadap suara
**6–12 bulan**: babbling (“ma-ma”, “da-da”), 1–2 kata pertama
**1–2 tahun**: 50 kata, 2 kata digabung (“mau susu”)
**2–3 tahun**: 200+ kata, kalimat 3–4 kata
**3–4 tahun**: kalimat lengkap, mudah dimengerti orang asing
**4–5 tahun**: bercerita urut, mengenal huruf

**Red flags**: tidak merespons suara di 6 bulan · tidak mengoceh di 12 bulan · tidak ada kata di 18 bulan · tidak merangkai 2 kata di 2 tahun · sulit dimengerti di 3 tahun.`,
  },
];

export const MILESTONES: Array<{ title: string; description?: string; ageGroupSlug: string; category: string; sortOrder: number }> = [
  // Bayi
  { title: 'Mengangkat kepala saat tengkurap', ageGroupSlug: 'bayi', category: 'PHYSICAL', sortOrder: 1 },
  { title: 'Tersenyum responsif saat diajak bicara/tersenyum', ageGroupSlug: 'bayi', category: 'SOCIAL_EMOTIONAL', sortOrder: 2 },
  { title: 'Mengoceh (ba-ba, ma-ma)', ageGroupSlug: 'bayi', category: 'LANGUAGE', sortOrder: 3 },
  { title: 'Meraih dan menggenggam mainan', ageGroupSlug: 'bayi', category: 'COGNITIVE', sortOrder: 4 },
  { title: 'Duduk tanpa bantuan', ageGroupSlug: 'bayi', category: 'PHYSICAL', sortOrder: 5 },
  // Batita
  { title: 'Berjalan tanpa pegangan', ageGroupSlug: 'batita', category: 'PHYSICAL', sortOrder: 1 },
  { title: 'Mengucapkan minimal 10 kata bermakna', ageGroupSlug: 'batita', category: 'LANGUAGE', sortOrder: 2 },
  { title: 'Menunjuk bagian tubuh saat ditanya', ageGroupSlug: 'batita', category: 'COGNITIVE', sortOrder: 3 },
  { title: 'Bermain pura-pura sederhana (pura-pura minum)', ageGroupSlug: 'batita', category: 'CREATIVE', sortOrder: 4 },
  { title: 'Mengekspresikan emosi dasar dengan kata ("marah", "sedih")', ageGroupSlug: 'batita', category: 'SOCIAL_EMOTIONAL', sortOrder: 5 },
  // Prasekolah
  { title: 'Melompat dengan dua kaki secara bersamaan', ageGroupSlug: 'prasekolah', category: 'PHYSICAL', sortOrder: 1 },
  { title: 'Bercerita tentang kejadian sehari-hari dengan urut', ageGroupSlug: 'prasekolah', category: 'LANGUAGE', sortOrder: 2 },
  { title: 'Mengenal huruf dan angka 1–10', ageGroupSlug: 'prasekolah', category: 'COGNITIVE', sortOrder: 3 },
  { title: 'Berbagi dan bergantian dengan teman', ageGroupSlug: 'prasekolah', category: 'SOCIAL_EMOTIONAL', sortOrder: 4 },
  { title: 'Menggambar orang dengan minimal 3 bagian tubuh', ageGroupSlug: 'prasekolah', category: 'CREATIVE', sortOrder: 5 },
  // SD Awal
  { title: 'Membaca kalimat sederhana dengan lancar', ageGroupSlug: 'sd-awal', category: 'LANGUAGE', sortOrder: 1 },
  { title: 'Menulis nama lengkap sendiri', ageGroupSlug: 'sd-awal', category: 'COGNITIVE', sortOrder: 2 },
  { title: 'Bekerja sama dalam kelompok kecil', ageGroupSlug: 'sd-awal', category: 'SOCIAL_EMOTIONAL', sortOrder: 3 },
  { title: 'Mengikat tali sepatu dan kancing baju sendiri', ageGroupSlug: 'sd-awal', category: 'PHYSICAL', sortOrder: 4 },
  // SD Akhir
  { title: 'Membaca buku cerita mandiri sampai selesai', ageGroupSlug: 'sd-akhir', category: 'LANGUAGE', sortOrder: 1 },
  { title: 'Menyelesaikan tugas bertahap tanpa terus diingatkan', ageGroupSlug: 'sd-akhir', category: 'COGNITIVE', sortOrder: 2 },
  { title: 'Bertanggung jawab atas barang sendiri (HP/uang saku)', ageGroupSlug: 'sd-akhir', category: 'SOCIAL_EMOTIONAL', sortOrder: 3 },
  { title: 'Membuat karya kreatif orisinal (tulisan/gambar/kerajinan)', ageGroupSlug: 'sd-akhir', category: 'CREATIVE', sortOrder: 4 },
];

export const BADGES: Array<{ name: string; slug: string; description: string; points: number }> = [
  { name: 'Langkah Pertama', slug: 'langkah-pertama', description: 'Mendaftar akun Mentari Smart Parent', points: 10 },
  { name: 'Pembaca Setia', slug: 'pembaca-setia', description: 'Membaca 10 artikel sampai selesai', points: 50 },
  { name: 'Penonton Setia', slug: 'penonton-setia', description: 'Menonton 10 video pembelajaran', points: 50 },
  { name: '7 Hari Berturut-turut', slug: 'streak-7-hari', description: 'Belajar parenting 7 hari tanpa putus', points: 70 },
  { name: 'Master 30 Hari', slug: 'streak-30-hari', description: 'Belajar parenting 30 hari tanpa putus', points: 150 },
  { name: 'Pejuang MPASI', slug: 'pejuang-mpasi', description: 'Membaca 5 konten tentang MPASI & gizi bayi', points: 40 },
  { name: 'Penjaga Bookmark', slug: 'penjaga-bookmark', description: 'Menyimpan 10 konten ke bookmark', points: 30 },
  { name: 'Kontributor Komunitas', slug: 'kontributor-komunitas', description: 'Menulis 5 komentar bermanfaat di komunitas', points: 60 },
  { name: 'Ahli Tumbuh Kembang', slug: 'ahli-tumbuh-kembang', description: 'Menyelesaikan 10 milestone tracking', points: 80 },
  { name: 'Super Parent', slug: 'super-parent', description: 'Mengumpulkan 500 poin total', points: 100 },
];

export const LEARNING_PATHS: Array<{
  title: string; slug: string; description: string; difficulty: string; estimatedTime: number; sortOrder: number;
  contentSlugs: string[];
}> = [
  {
    title: 'Persiapan Anak Masuk SD',
    slug: 'persiapan-anak-masuk-sd',
    description: 'Learning path terstruktur 8 langkah: dari asesmen kesiapan, mengasah motorik & sosial, hingga minggu pertama sekolah.',
    difficulty: 'BEGINNER',
    estimatedTime: 90,
    sortOrder: 1,
    contentSlugs: [
      'tanda-tanda-siap-sekolah',
      'checklist-persiapan-anak-masuk-sd',
      'stimulasi-bahasa-anak-1-3-tahun',
      'permainan-edukatif-tanpa-gadget',
      'disiplin-positif-tanpa-memukul',
      'rutinitas-tidur-anak-jadwal-ideal',
    ],
  },
  {
    title: 'MPASI 6 Bulan Pertama',
    slug: 'mpasi-6-bulan-pertama',
    description: 'Dari tanda bayi siap makan, contoh menu minggu pertama, takaran per usia, hingga kesalahan yang harus dihindari.',
    difficulty: 'BEGINNER',
    estimatedTime: 60,
    sortOrder: 2,
    contentSlugs: [
      'panduan-mpasi-6-bulan',
      'takaran-mpasi-6-24-bulan',
      'kupas-tuntas-mpasi',
      'kebutuhan-asi-bayi-sesuai-usia',
      'infografis-milestone-bicara-0-5-tahun',
    ],
  },
];

export const THREADS: Array<{
  title: string; body: string; categorySlug: string; isPinned?: boolean;
  authorEmail: string; likeCount: number; commentCount: number; viewCount: number;
  comments: Array<{ authorEmail: string; body: string }>;
}> = [
  {
    title: 'Anak 2 tahun pilih-pilih makan — wajar nggak sih?',
    body: 'Halo mams! Anak saya (2th 2bln) belakangan ini nolak hampir semua sayur, cuma mau nasi+ayam goreng. Berat badan masih bagus tapi saya khawatir nutrisinya. Ada yang punya pengalaman serupa? Please share tipsnya 🙏',
    categorySlug: 'gizi-anak',
    authorEmail: 'ratna.dewi@example.com',
    likeCount: 23,
    commentCount: 3,
    viewCount: 482,
    comments: [
      { authorEmail: 'sari.p@example.com', body: 'Wajar banget, namanya food jag. Kuncinya jangan dipaksa, tawarkan 15x dengan cara beda-beda. Anak saya butuh 2 bulan sampai mau brokoli.' },
      { authorEmail: 'dimas.p@example.com', body: 'Coba campur sayurnya ke makanan favoritnya dulu — misal nasi goreng sayur halus. Pelan-pelan teksturnya dinaikkan.' },
      { authorEmail: 'mentari@mentari.id', body: 'Info tambahan: artikel “Panduan MPASI” di platform ini juga membahas picky eater di batita. Semoga membantu, Bu Ratna!' },
    ],
  },
  {
    title: 'Pengalaman homeschooling SD — ada yang bisa sharing?',
    body: 'Pertimbangkan homeschooling untuk anak dengan minat seni yang tinggi. Apakah kualitasnya diakui untuk lanjut SMP? Bagaimana legalitas ijazahnya?',
    categorySlug: 'kurikulum-akademik',
    authorEmail: 'budi.s@example.com',
    likeCount: 17,
    commentCount: 2,
    viewCount: 356,
    comments: [
      { authorEmail: 'ratna.ningrum@example.com', body: 'Homeschooling resmi (terdaftar di PKBM) diakui — ijazahnya setara. Kuncinya cari PKBM yang cocok dan dokumenkan portofolio karya anak.' },
      { authorEmail: 'ratna.dewi@example.com', body: 'Teman saya homeschooling, anaknya masuk SMP negeri lewat PPDB jalur prestasi dengan portofolio seni. Bisa banget!' },
    ],
  },
  {
    title: 'Tips lepas diaper di malam hari? Anak 3,5 tahun masih ngompol',
    body: 'Siang sudah lepas diaper sejak 3 tahun, tapi malam masih sering ngompol. Sudah coba batasi minum 2 jam sebelum tidur. Ada tips lain?',
    categorySlug: 'kesehatan-fisik',
    authorEmail: 'sari.p@example.com',
    likeCount: 31,
    commentCount: 2,
    viewCount: 418,
    comments: [
      { authorEmail: 'ratna.dewi@example.com', body: 'Ngompol sampai 5-6 tahun masih dalam batas normal. Jangan dimarahi ya bunda — bikin anak jadi takut. Coba double void: pipis 2x, 30 menit sebelum tidur dan tepat sebelum tidur.' },
      { authorEmail: 'mentari@mentari.id', body: 'Artikel rutinitas tidur di platform ini membahas strategi ini lebih detail, Bu Sari. Semoga membantu!' },
    ],
  },
  {
    title: 'Baca: Rekomendasi sekolah — nasional vs internasional? (Pin dari admin)',
    body: 'Diskusi paling sering di komunitas ini: memilih kurikulum. Tidak ada jawaban tunggal — tergantung tujuan, budget, dan gaya belajar anak. Thread ini kami pin sebagai tempat bertanya terstruktur. Sertakan: usia anak, lokasi, budget range, dan prioritas (akademik/karakter/bahasa).',
    categorySlug: 'kurikulum-akademik',
    isPinned: true,
    authorEmail: 'mentari@mentari.id',
    likeCount: 45,
    commentCount: 2,
    viewCount: 1204,
    comments: [
      { authorEmail: 'budi.s@example.com', body: 'Jakarta Selatan, anak 6 th. Budget 30–60jt/tahun. Prioritas: bahasa Inggris + karakter. Condiserat nasional berbasis Kurikulum Merdeka + ekstra Cambridge?' },
      { authorEmail: 'ratna.ningrum@example.com', body: 'Banyak sekolah nasional plus yang menawarkan bilingual track. Kunjungi langsung, tanyakan kualifikasi guru bahasa Inggrisnya, dan rasakan atmosfer kelasnya.' },
    ],
  },
  {
    title: 'Berapa jam screen time yang sehat untuk SD?',
    body: 'Anak kelas 2 minta nonton YouTube setiap sore. Kami batasi 1 jam tapi nego terus. Bagaimana mencari jalan tengah yang sehat?',
    categorySlug: 'screen-time',
    authorEmail: 'dimas.p@example.com',
    likeCount: 28,
    commentCount: 1,
    viewCount: 389,
    comments: [
      { authorEmail: 'ratna.dewi@example.com', body: 'Pakai sistem “gadget setelah tugas selesai” + waktu khusus (misal 16.30–17.30). Konsisten 2 minggu, anak biasanya terbiasa dengan aturan.' },
    ],
  },
];

