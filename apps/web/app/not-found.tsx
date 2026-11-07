import Link from "next/link";
import { Compass } from "lucide-react";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function NotFound() {
  const { dict } = await getDictionary();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-heading text-7xl font-extrabold text-sand">404</p>
      <span className="mt-4 grid h-16 w-16 place-items-center rounded-3xl bg-secondary-soft text-secondary">
        <Compass size={30} aria-hidden />
      </span>
      <h1 className="mt-6 font-heading text-2xl font-extrabold text-secondary">{dict.errors.notFoundTitle}</h1>
      <p className="mt-2 text-sm text-muted">{dict.errors.notFoundSub}</p>
      <Link href="/" className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-deep">
        {dict.errors.backHome}
      </Link>
    </div>
  );
}
