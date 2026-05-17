import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProveidorForm } from "../proveidor-form";

export default function NouProveidorPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/proveidors">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Nou proveïdor
          </h1>
          <p className="text-muted-foreground">
            Crea un proveïdor amb les seves dades fiscals i de contacte
          </p>
        </div>
      </div>

      <ProveidorForm mode="create" />
    </div>
  );
}
