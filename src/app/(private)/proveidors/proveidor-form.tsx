"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Proveidor } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProveidor, updateProveidor, type FormState } from "./actions";

type Props = {
  mode: "create" | "edit";
  initialData?: Proveidor;
};

export function ProveidorForm({ mode, initialData }: Props) {
  const action =
    mode === "create"
      ? createProveidor
      : updateProveidor.bind(null, initialData!.id);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dades fiscals</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="nif"
            label="NIF *"
            defaultValue={initialData?.nif}
            errors={state.errors?.nif}
          />
          <Field
            id="nom"
            label="Nom *"
            defaultValue={initialData?.nom}
            errors={state.errors?.nom}
          />
          <Field
            id="codiBis"
            label="Codi BIS"
            defaultValue={initialData?.codiBis ?? ""}
            errors={state.errors?.codiBis}
          />
          <Field
            id="iban"
            label="IBAN"
            defaultValue={initialData?.iban ?? ""}
            errors={state.errors?.iban}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacte</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="email"
            label="Email"
            type="email"
            defaultValue={initialData?.email ?? ""}
            errors={state.errors?.email}
          />
          <Field
            id="telefon"
            label="Telèfon"
            defaultValue={initialData?.telefon ?? ""}
            errors={state.errors?.telefon}
          />
          <Field
            id="personaContacte"
            label="Persona de contacte"
            defaultValue={initialData?.personaContacte ?? ""}
            errors={state.errors?.personaContacte}
            className="md:col-span-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adreça</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            id="adreca"
            label="Adreça"
            defaultValue={initialData?.adreca ?? ""}
            errors={state.errors?.adreca}
            className="md:col-span-3"
          />
          <Field
            id="codiPostal"
            label="Codi postal"
            defaultValue={initialData?.codiPostal ?? ""}
            errors={state.errors?.codiPostal}
          />
          <Field
            id="poblacio"
            label="Població"
            defaultValue={initialData?.poblacio ?? ""}
            errors={state.errors?.poblacio}
            className="md:col-span-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={initialData?.notes ?? ""}
            />
            {state.errors?.notes && (
              <p className="text-sm text-destructive">
                {state.errors.notes[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {state.message && !state.errors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/proveidors">Cancel·lar</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Guardant..."
            : mode === "create"
              ? "Crear proveïdor"
              : "Guardar canvis"}
        </Button>
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
