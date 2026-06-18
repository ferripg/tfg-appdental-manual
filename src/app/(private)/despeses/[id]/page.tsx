import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DespesaForm } from "../despesa-form";
import * as despesesService from "@/services/despeses-service";
import * as tipusDespesaService from "@/services/tipus-despesa-service";
import * as proveidorsService from "@/services/proveidors-service";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function EditarDespesaPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { mode: modeParam } = await searchParams;
  const mode = modeParam === "view" ? "view" : "edit";
  const [despesa, tipus, proveidors] = await Promise.all([
    despesesService.obtenir(id),
    tipusDespesaService.llistar(),
    proveidorsService.llistar(),
  ]);

  if (!despesa) {
    notFound();
  }

  const initialData = {
    ...despesa,
    import: despesa.import.toString(),
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/despeses">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {mode === "view" ? "Detall de la despesa" : "Editar despesa"}
          </h1>
          <p className="text-muted-foreground">
            {new Date(despesa.dataFactura).toLocaleDateString("ca-ES")} —{" "}
            {Number(despesa.import).toLocaleString("ca-ES", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>
      </div>

      <DespesaForm
        mode={mode}
        initialData={initialData}
        tipus={tipus}
        proveidors={proveidors}
      />
    </div>
  );
}
