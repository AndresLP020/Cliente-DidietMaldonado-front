"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/** Filtros de listado sincronizados con la URL (compartibles y conservados al volver atrás). */
export function useListParams<K extends string>(keys: readonly K[]) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const values = Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ""])) as Record<K, string>;
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const update = useCallback(
    (patch: Partial<Record<K | "page", string | number>>) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(patch)) {
        if (value === "" || value === undefined || (key === "page" && value === 1)) next.delete(key);
        else next.set(key, String(value));
      }
      // Cambiar un filtro vuelve a la primera página.
      if (!("page" in patch)) next.delete("page");
      router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return { values, page, update };
}
