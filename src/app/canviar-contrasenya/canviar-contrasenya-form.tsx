"use client";

import { useActionState } from "react";
import { canviarContrasenya, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function CanviarContrasenyaForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    canviarContrasenya,
    {},
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          {state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="actual">Contrasenya actual</Label>
            <Input id="actual" name="actual" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nova">Nova contrasenya</Label>
            <Input id="nova" name="nova" type="password" required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmar">Confirma la nova contrasenya</Label>
            <Input
              id="confirmar"
              name="confirmar"
              type="password"
              required
              minLength={8}
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Canviant..." : "Canviar contrasenya"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
