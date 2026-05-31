"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export type ResultToastMap = Record<
  string,
  { type: "success" | "info" | "warning" | "error"; text: string }
>;

/**
 * Reads a `?msg=...` query param and fires a one-shot toast. Used to show
 * feedback after a Server Action redirect (where inline state is lost).
 *
 * Cleans the URL after firing so the toast does not re-trigger on re-renders
 * or browser back/forward.
 */
export function ResultToast({
  msg,
  map,
}: {
  msg?: string;
  map: ResultToastMap;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!msg) return;
    const entry = map[msg];
    if (!entry) return;

    if (entry.type === "success") toast.success(entry.text);
    else if (entry.type === "error") toast.error(entry.text);
    else if (entry.type === "warning") toast.warning(entry.text);
    else toast.info(entry.text);

    // Clean the msg param from URL to prevent re-firing.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("msg");
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newUrl, { scroll: false });
  }, [msg, map, router, pathname, searchParams]);

  return null;
}
