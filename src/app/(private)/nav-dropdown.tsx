"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

export function NavDropdown({ label, items }: { label: string; items: Item[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const actiu = items.some(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground",
          actiu ? "text-foreground font-semibold" : "text-muted-foreground",
        )}
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border bg-background shadow-md">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {i.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
