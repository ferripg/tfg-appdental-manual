import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DespesaForm } from "../despesa-form";
import * as tipusDespesaService from "@/services/tipus-despesa-service";
import * as proveidorsService from "@/services/proveidors-service";

export default async function NovaDespesaPage() {
  const [tipus, proveidors] = await Promise.all([
    tipusDespesaService.llistar(),
    proveidorsService.llistar(),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/despeses">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Nova despesa
          </h1>
          <p className="text-muted-foreground">
            Registra una nova despesa amb el seu tipus i proveïdor opcional
          </p>
        </div>
      </div>

      <DespesaForm mode="create" tipus={tipus} proveidors={proveidors} />
    </div>
  );
}
