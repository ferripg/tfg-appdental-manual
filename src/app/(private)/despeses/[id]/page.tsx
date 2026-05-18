import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DespesaForm } from "../despesa-form";
import * as despesesService from "@/services/despeses-service";
import * as tipusDespesaService from "@/services/tipus-despesa-service";
import * as proveidorsService from "@/services/proveidors-service";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarDespesaPage({ params }: Props) {
  const { id } = await params;
  const [despesa, tipus, proveidors] = await Promise.all([
    despesesService.obtenir(id),
    tipusDespesaService.llistar(),
    proveidorsService.llistar(),
  ]);

  if (!despesa) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/despeses">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Editar despesa
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
        mode="edit"
        initialData={despesa}
        tipus={tipus}
        proveidors={proveidors}
      />
    </div>
  );
}
