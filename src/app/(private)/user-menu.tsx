"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleUser, ChevronDown } from "lucide-react";
import { logoutAction } from "./actions";

export function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <CircleUser className="h-5 w-5" />
        <span className="hidden sm:inline">{email}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border bg-background shadow-md">
            <Link
              href="/canviar-contrasenya"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-muted"
            >
              Canviar contrasenya
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="block w-full px-4 py-2 text-left text-sm hover:bg-muted"
              >
                Tancar sessió
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
