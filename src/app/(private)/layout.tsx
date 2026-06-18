import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { logoutAction } from "./actions";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link
            href="/dashboard"
            className="text-xl font-semibold text-primary tracking-tight"
          >
            AppDental
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/despeses"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Despeses
            </Link>
            <Link
              href="/proveidors"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Proveïdors
            </Link>
            <Link
              href="/tipus-despesa"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tipus de despesa
            </Link>
            <Link
              href="/inventari"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Inventari
            </Link>
            <Link
              href="/amortitzacions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Amortitzacions
            </Link>
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin/users"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Usuaris
              </Link>
            )}
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin/audit-log"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Auditoria
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
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

      <main className="flex-1 container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
