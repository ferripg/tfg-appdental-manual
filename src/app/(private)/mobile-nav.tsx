"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "./nav-link";

type NavLink = { href: string; label: string };

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b bg-background shadow-md">
          <nav className="mx-auto w-full max-w-384 flex flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                activeClassName="bg-muted text-foreground"
              />
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
