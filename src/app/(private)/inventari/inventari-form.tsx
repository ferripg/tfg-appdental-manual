"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Inventari, Proveidor } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInventari, updateInventari, type FormState } from "./actions";

type Props = {
  mode: "create" | "edit";
  initialData?: Inventari;
  proveidors: Proveidor[];
};

function toInputDate(d?: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function InventariForm({ mode, initialData, proveidors }: Props) {
  const action =
    mode === "create"
      ? createInventari
      : updateInventari.bind(null, initialData!.id);

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
          <CardTitle>Dades del bé</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="descripcio">Descripció *</Label>
            <Input
              id="descripcio"
              name="descripcio"
              placeholder="Cadira dental, equip de raigs X..."
              defaultValue={initialData?.descripcio ?? ""}
            />
            {state.errors?.descripcio && (
              <p className="text-sm text-destructive">
                {state.errors.descripcio[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataAdquisicio">Data d&apos;adquisició *</Label>
            <Input
              id="dataAdquisicio"
              name="dataAdquisicio"
              type="date"
              defaultValue={toInputDate(initialData?.dataAdquisicio)}
            />
            {state.errors?.dataAdquisicio && (
              <p className="text-sm text-destructive">
                {state.errors.dataAdquisicio[0]}
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

          <div className="space-y-2">
            <Label htmlFor="importAdquisicio">Import d&apos;adquisició (€) *</Label>
            <Input
              id="importAdquisicio"
              name="importAdquisicio"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialData?.importAdquisicio?.toString() ?? ""}
            />
            {state.errors?.importAdquisicio && (
              <p className="text-sm text-destructive">
                {state.errors.importAdquisicio[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="percAmortitzacio">% amortització anual *</Label>
            <Input
              id="percAmortitzacio"
              name="percAmortitzacio"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="10"
              defaultValue={initialData?.percAmortitzacio?.toString() ?? ""}
            />
            {state.errors?.percAmortitzacio && (
              <p className="text-sm text-destructive">
                {state.errors.percAmortitzacio[0]}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="proveidorId">Proveïdor</Label>
            <Select
              name="proveidorId"
              defaultValue={initialData?.proveidorId ?? ""}
            >
              <SelectTrigger id="proveidorId">
                <SelectValue placeholder="Tria un proveïdor (opcional)..." />
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

      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/inventari">Cancel·lar</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Guardant..."
            : mode === "create"
              ? "Crear bé"
              : "Guardar canvis"}
        </Button>
      </div>
    </form>
  );
}
