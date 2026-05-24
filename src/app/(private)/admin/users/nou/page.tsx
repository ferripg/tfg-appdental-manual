import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserForm } from "../user-form";

export default function NouUsuariPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/users">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Nou usuari
          </h1>
          <p className="text-muted-foreground">
            Crea un usuari amb el seu rol assignat
          </p>
        </div>
      </div>

      <UserForm mode="create" />
    </div>
  );
}
