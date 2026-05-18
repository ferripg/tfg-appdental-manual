"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Despesa, TipusDespesa, Proveidor } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDespesa,
  updateDespesa,
  type FormState,
} from "./actions";

type Props = {
  mode: "create" | "edit";
  initialData?: Despesa;
  tipus: TipusDespesa[];
  proveidors: Proveidor[];
};

function toInputDate(d?: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function DespesaForm({ mode, initialData, tipus, proveidors }: Props) {
  const action =
    mode === "create"
      ? createDespesa
      : updateDespesa.bind(null, initialData!.id);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            ⚠️ {state.message}
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dades de la factura</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataFactura">Data factura *</Label>
            <Input
              id="dataFactura"
              name="dataFactura"
              type="date"
              defaultValue={toInputDate(initialData?.dataFactura)}
            />
            {state.errors?.dataFactura && (
              <p className="text-sm text-destructive">
                {state.errors.dataFactura[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataPagament">Data pagament</Label>
            <Input
              id="dataPagament"
              name="dataPagament"
              type="date"
              defaultValue={toInputDate(initialData?.dataPagament)}
            />
            {state.errors?.dataPagament && (
              <p className="text-sm text-destructive">
                {state.errors.dataPagament[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="import">Import (€) *</Label>
            <Input
              id="import"
              name="import"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialData?.import?.toString() ?? ""}
            />
            {state.errors?.import && (
              <p className="text-sm text-destructive">
                {state.errors.import[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numFactura">Núm. factura</Label>
            <Input
              id="numFactura"
              name="numFactura"
              defaultValue={initialData?.numFactura ?? ""}
            />
            {state.errors?.numFactura && (
              <p className="text-sm text-destructive">
                {state.errors.numFactura[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classificació</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipusDespesaId">Tipus de despesa *</Label>
            <Select
              name="tipusDespesaId"
              defaultValue={initialData?.tipusDespesaId ?? ""}
            >
              <SelectTrigger id="tipusDespesaId">
                <SelectValue placeholder="Tria un tipus..." />
              </SelectTrigger>
              <SelectContent>
                {tipus.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.codi} — {t.descripcio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.tipusDespesaId && (
              <p className="text-sm text-destructive">
                {state.errors.tipusDespesaId[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proveidorId">Proveïdor *</Label>
            <Select
              name="proveidorId"
              defaultValue={initialData?.proveidorId ?? ""}
            >
              <SelectTrigger id="proveidorId">
                <SelectValue placeholder="Tria un proveïdor..." />
              </SelectTrigger>
              <SelectContent>
                {proveidors.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nom} ({p.nif})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.proveidorId && (
              <p className="text-sm text-destructive">
                {state.errors.proveidorId[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Descripció</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="descripcio">Descripció</Label>
            <Textarea
              id="descripcio"
              name="descripcio"
              rows={3}
              defaultValue={initialData?.descripcio ?? ""}
            />
            {state.errors?.descripcio && (
              <p className="text-sm text-destructive">
                {state.errors.descripcio[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/despeses">Cancel·lar</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Guardant..."
            : mode === "create"
              ? "Crear despesa"
              : "Guardar canvis"}
        </Button>
      </div>
    </form>
  );
}
