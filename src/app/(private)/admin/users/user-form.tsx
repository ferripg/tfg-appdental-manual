"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { User } from "@prisma/client";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, updateUser, type FormState } from "./actions";

type Props = {
  mode: "create" | "edit";
  initialData?: User;
};

export function UserForm({ mode, initialData }: Props) {
  const action =
    mode === "create"
      ? createUser
      : updateUser.bind(null, initialData!.id);

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
          <CardTitle>Dades de l&apos;usuari</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initialData?.email ?? ""}
            />
            {state.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name ?? ""}
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          {mode === "create" && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Password inicial *</Label>
              <Input id="password" name="password" type="password" />
              <p className="text-xs text-muted-foreground">
                L&apos;usuari haurà de canviar-lo al primer login.
              </p>
              {state.errors?.password && (
                <p className="text-sm text-destructive">
                  {state.errors.password[0]}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="role">Rol *</Label>
            <Select name="role" defaultValue={initialData?.role ?? "OPERARI"}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Tria un rol..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">
                  ADMIN — Accés total (gestió usuaris inclosa)
                </SelectItem>
                <SelectItem value="MANAGER">
                  MANAGER — CRUD complet del domini
                </SelectItem>
                <SelectItem value="OPERARI">
                  OPERARI — Només crear despeses + llegir llistats
                </SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.role && (
              <p className="text-sm text-destructive">{state.errors.role[0]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/admin/users">Cancel·lar</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Guardant..."
            : mode === "create"
              ? "Crear usuari"
              : "Guardar canvis"}
        </Button>
      </div>
    </form>
  );
}
