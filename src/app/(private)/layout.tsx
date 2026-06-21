import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { logoutAction } from "./actions";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import pkg from "../../../package.json";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/despeses", label: "Despeses" },
    { href: "/proveidors", label: "Proveïdors" },
    { href: "/tipus-despesa", label: "Tipus de despesa" },
    { href: "/inventari", label: "Inventari" },
    { href: "/amortitzacions", label: "Amortitzacions" },
    ...(session.user.role === "ADMIN"
      ? [
          { href: "/admin/users", label: "Usuaris" },
          { href: "/admin/audit-log", label: "Auditoria" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative border-b bg-background">
        <div className="mx-auto w-full max-w-384 flex items-center justify-between h-16 px-6">
          <Link
            href="/dashboard"
            className="text-xl font-semibold text-primary tracking-tight"
          >
            AppDental
          </Link>

          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground font-semibold"
              />
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <MobileNav links={navLinks} />
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {session.user.email}
            </span>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                Tancar sessió
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-384 px-6 py-8">{children}</main>

      <footer className="border-t bg-background">
        <div className="mx-auto w-full max-w-384 flex flex-col gap-1 px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>AppDental · Gestió de clínica dental</span>
          <span>
            v{pkg.version} · © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}
