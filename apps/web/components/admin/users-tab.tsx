"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminErrorBanner } from "@/components/admin/admin-error";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { apiData, apiPaginated } from "@/lib/client-api";
import { Combobox } from "@/components/combobox";
import { intlTag } from "@/lib/i18n/config";
import { format } from "@/lib/i18n/format";

interface AdminUser {
  id: string; email: string; fullName: string; role: "USER" | "ADMIN" | "EDITOR" | "MODERATOR";
  isActive: boolean; lastLoginAt: string | null; createdAt: string; childrenCount: number; bookmarkCount: number;
}

export function UsersTab() {
  const dict = useDictionary();
  const locale = intlTag(useLocale());
  const [items, setItems] = useState<AdminUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(() => {
    setBusy(true);
    setLoadError(false);
    apiPaginated<AdminUser>("/admin/users?limit=50")
      .then((envelope) => setItems(envelope.data))
      .catch(() => setLoadError(true))
      .finally(() => setBusy(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function setRole(id: string, role: string) {
    await apiData(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }).catch(() => undefined);
    load();
  }

  const roleOptions = [
    { value: "USER", label: "USER" },
    { value: "ADMIN", label: "ADMIN" },
    { value: "EDITOR", label: "EDITOR" },
    { value: "MODERATOR", label: "MODERATOR" },
  ];

  return (
    <div className="space-y-2">
      {loadError && <AdminErrorBanner onRetry={load} />}
    <div className="overflow-x-auto rounded-3xl border border-sand bg-white md:overflow-visible">      <table className="w-full min-w-[720px] text-left text-xs">
        <thead className="bg-cream/50 text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted">
          <tr>
            <th className="px-5 py-3">{dict.admin.usersName}</th>
            <th className="px-4 py-3">{dict.admin.usersEmail}</th>
            <th className="px-4 py-3">{dict.admin.usersChildren}</th>
            <th className="px-4 py-3">{dict.admin.usersBookmarks}</th>
            <th className="px-4 py-3">{dict.admin.usersLastLogin}</th>
            <th className="px-4 py-3">{dict.admin.usersRole}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand/70">
          {items.map((adminUser) => (
            <tr key={adminUser.id} className="transition hover:bg-cream/40">
              <td className="px-5 py-3 font-semibold text-ink">{adminUser.fullName}</td>
              <td className="px-4 py-3 text-muted">{adminUser.email}</td>
              <td className="px-4 py-3">{adminUser.childrenCount}</td>
              <td className="px-4 py-3">{adminUser.bookmarkCount}</td>
              <td className="px-4 py-3 text-muted">{adminUser.lastLoginAt ? new Date(adminUser.lastLoginAt).toLocaleDateString(locale) : "—"}</td>
              <td className="px-4 py-3">
                <Combobox
                  ariaLabel={format(dict.admin.roleAria, { name: adminUser.fullName })}
                  options={roleOptions}
                  value={adminUser.role}
                  onChange={(role) => setRole(adminUser.id, role)}
                  className="w-32"
                  panelClassName="min-w-[8rem]"
                  buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-sand bg-white px-3 py-2 text-[11px] font-semibold outline-none transition focus:border-primary"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!busy && items.length === 0 && <p className="px-5 py-8 text-center text-xs text-muted">{dict.admin.noUsers}</p>}
    </div>
    </div>
  );
}
