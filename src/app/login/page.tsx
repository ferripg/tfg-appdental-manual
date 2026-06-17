"use client";
import { useActionState } from "react";
import { authenticate } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate, // Server Action que s'executa al submit
    undefined, // valor inicial d'errorMessage (cap error al primer render)
  );
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-2xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-semibold text-primary tracking-tight">
            AppDental
          </h1>
          <p className="text-xl text-muted-foreground">
            Gestió de clínica dental
          </p>
        </div>

        <Card className="py-8">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-3xl">Inicia sessió</CardTitle>
            <CardDescription className="text-base">
              Accedeix al teu compte
            </CardDescription>
          </CardHeader>

          <form action={formAction}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Usuari
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Contrasenya
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="h-12 text-base"
                />
              </div>
              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="w-full text-base"
              >
                {isPending ? "Entrant..." : "Entrar"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Has oblidat la contrasenya? Contacta amb l&apos;administrador.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
