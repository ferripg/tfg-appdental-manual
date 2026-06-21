"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { TipusDespesa } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createTipusDespesa,
  updateTipusDespesa,
  type FormState,
} from "./actions";
import { GRUPS_PGC } from "@/lib/pgc";

type Props = {
  mode: "create" | "edit" | "view";
  initialData?: TipusDespesa;
};

export function TipusDespesaForm({ mode, initialData }: Props) {
  const action =
    mode === "create"
      ? createTipusDespesa
      : updateTipusDespesa.bind(null, initialData!.id);

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

      <fieldset disabled={mode === "view"} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dades bàsiques</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="codi"
            label="Codi *"
            defaultValue={initialData?.codi}
            errors={state.errors?.codi}
          />
          <Field
            id="descripcio"
            label="Descripció *"
            defaultValue={initialData?.descripcio}
            errors={state.errors?.descripcio}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classificació comptable</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grup">Grup PGC</Label>
            <select
              id="grup"
              name="grup"
              defaultValue={initialData?.grup?.toString() ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            >
              <option value="">—</option>
              {GRUPS_PGC.map((g) => (
                <option key={g.num} value={g.num}>
                  {g.num} — {g.nom}
                </option>
              ))}
            </select>
            {state.errors?.grup && (
              <p className="text-sm text-destructive">{state.errors.grup[0]}</p>
            )}
          </div>
          <Field
            id="concepte"
            label="Concepte"
            defaultValue={initialData?.concepte ?? ""}
            errors={state.errors?.concepte}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atributs fiscals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CheckboxField
            id="deduible"
            label="Deduible fiscalment"
            description="Si està marcat, les despeses d'aquest tipus es poden deduir de l'impost de societats"
            defaultChecked={initialData?.deduible ?? true}
            errors={state.errors?.deduible}
          />
          <CheckboxField
            id="esAmortitzable"
            label="És amortitzable"
            description="Si està marcat, les despeses d'aquest tipus es comptabilitzen com a inversió amortitzable"
            defaultChecked={initialData?.esAmortitzable ?? false}
            errors={state.errors?.esAmortitzable}
          />
        </CardContent>
      </Card>

      </fieldset>

      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/tipus-despesa">{mode === "view" ? "Tornar" : "Cancel·lar"}</Link>
        </Button>
        {mode !== "view" && (
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Guardant..."
              : mode === "create"
                ? "Crear tipus de despesa"
                : "Guardar canvis"}
          </Button>
        )}
      </div>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  defaultValue?: string;
  errors?: string[];
  className?: string;
};

function Field({
  id,
  label,
  type = "text",
  defaultValue,
  errors,
  className,
}: FieldProps) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} defaultValue={defaultValue} />
      {errors && <p className="text-sm text-destructive">{errors[0]}</p>}
    </div>
  );
}

type CheckboxFieldProps = {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  errors?: string[];
};

function CheckboxField({
  id,
  label,
  description,
  defaultChecked,
  errors,
}: CheckboxFieldProps) {
  return (
    <div className="flex items-start gap-3">
      {/* Hidden input garanteix que sempre s'envia "off" si el checkbox està desmarcat */}
      <input type="hidden" name={id} value="off" />
      <input
        type="checkbox"
        id={id}
        name={id}
        value="on"
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-input"
      />
      <div className="space-y-1">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {errors && <p className="text-sm text-destructive">{errors[0]}</p>}
      </div>
    </div>
  );
}
