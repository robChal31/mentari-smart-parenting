import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-heading text-7xl font-extrabold text-sand">404</p>
      <span className="mt-4 grid h-16 w-16 place-items-center rounded-3xl bg-secondary-soft text-secondary">
        <Compass size={30} aria-hidden />
      </span>
      <h1 className="mt-6 font-heading text-2xl font-extrabold text-secondary">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-muted">Tautan mungkin salah ketik atau kontennya sudah dipindahkan.</p>
      <Link href="/" className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-deep">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
