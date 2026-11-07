"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3, FileText, GraduationCap, Package, ShieldAlert, Users,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useDictionary } from "@/components/i18n-provider";
import { OverviewTab } from "@/components/admin/overview-tab";
import { ContentsTab } from "@/components/admin/contents-tab";
import { ProductsTab } from "@/components/admin/products-tab";
import { LearningPathsTab } from "@/components/admin/learning-paths-tab";
import { UsersTab } from "@/components/admin/users-tab";

type Tab = "overview" | "content" | "products" | "learning-paths" | "users";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const dict = useDictionary();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login?next=/admin");
  }, [isLoading, user, router]);

  const allowed = user && (user.role === "ADMIN" || user.role === "EDITOR");
  const isAdmin = user?.role === "ADMIN";

  if (isLoading || !user) {
    return <div className="mx-auto max-w-6xl px-4 py-16" aria-busy="true"><div className="skeleton h-10 w-72" /></div>;
  }
  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert size={44} className="mx-auto text-red-400" aria-hidden />
        <h1 className="mt-4 font-heading text-2xl font-extrabold text-secondary">{dict.admin.forbiddenTitle}</h1>
        <p className="mt-2 text-sm text-muted">{dict.admin.forbiddenSub}</p>
      </div>
    );
  }

  const tabs: Array<[Tab, string, React.ReactNode]> = [
    ["overview", dict.admin.overview, <BarChart3 key="i" size={15} />],
    ["content", dict.admin.contents, <FileText key="i" size={15} />],
    ["products", dict.admin.products, <Package key="i" size={15} />],
    ["learning-paths", dict.nav.learningPath, <GraduationCap key="i" size={15} />],
    ...(isAdmin ? [["users", dict.admin.users, <Users key="i" size={15} />] as [Tab, string, React.ReactNode]] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">{dict.admin.cmsKicker}</p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-secondary">{dict.admin.dashboardTitle}</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-secondary">
          {user.role} · {user.fullName.split(" ")[0]}
        </span>
      </header>

      <div role="tablist" aria-label={dict.admin.tabsAria} className="mt-6 flex flex-wrap gap-2 border-b border-sand pb-4">
        {tabs.map(([value, label, icon]) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${tab === value ? "bg-secondary text-white" : "border border-sand bg-white text-ink/75 hover:border-secondary/35"}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "content" && <ContentsTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "learning-paths" && <LearningPathsTab />}
        {tab === "users" && isAdmin && <UsersTab />}
      </div>
    </div>
  );
}
