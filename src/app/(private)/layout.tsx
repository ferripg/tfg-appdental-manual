import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { UserMenu } from "./user-menu";
import { NavDropdown } from "./nav-dropdown";
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
  if (session.user.mustChangePassword) redirect("/canviar-contrasenya");

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/despeses", label: "Despeses" },
    { href: "/proveidors", label: "Proveïdors" },
    { href: "/tipus-despesa", label: "Tipus de despesa" },
    { href: "/inventari", label: "Inventari" },
    { href: "/amortitzacions", label: "Amortitzacions" },
    { href: "/informes", label: "Informes" },
  ];
  const adminItems = [
    { href: "/admin/users", label: "Usuaris" },
    { href: "/admin/audit-log", label: "Auditoria" },
  ];
  const esAdmin = session.user.role === "ADMIN";
  const totsElsLinks = [...links, ...(esAdmin ? adminItems : [])];

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

          <nav className="hidden lg:flex items-center gap-6">
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground font-semibold"
              />
            ))}
            {esAdmin && <NavDropdown label="Admin" items={adminItems} />}
          </nav>

          <div className="flex items-center gap-4">
            <MobileNav links={totsElsLinks} />
            <UserMenu email={session.user.email} />
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
