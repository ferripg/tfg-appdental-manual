import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TipusDespesaForm } from "../tipus-despesa-form";
import * as tipusDespesaService from "@/services/tipus-despesa-service";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarTipusDespesaPage({ params }: Props) {
  const { id } = await params;
  const tipusDespesa = await tipusDespesaService.obtenir(id);

  if (!tipusDespesa) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/tipus-despesa">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Editar tipus de despesa
          </h1>
          <p className="text-muted-foreground">
            {tipusDespesa.descripcio} — Codi {tipusDespesa.codi}
          </p>
        </div>
      </div>

      <TipusDespesaForm mode="edit" initialData={tipusDespesa} />
    </div>
  );
}
