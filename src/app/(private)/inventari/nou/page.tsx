import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InventariForm } from "../inventari-form";
import * as proveidorsService from "@/services/proveidors-service";

export default async function NouInventariPage() {
  const proveidors = await proveidorsService.llistar();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/inventari">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Nou bé</h1>
          <p className="text-muted-foreground">
            Registra un bé amortitzable de la clínica
          </p>
        </div>
      </div>

      <InventariForm mode="create" proveidors={proveidors} />
    </div>
  );
}
