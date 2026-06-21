import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { logoutAction } from "@/app/(private)/actions";
import { Button } from "@/components/ui/button";
import { CanviarContrasenyaForm } from "./canviar-contrasenya-form";

export default async function CanviarContrasenyaPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const forcat = session.user.mustChangePassword;

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-primary tracking-tight">
            Canviar contrasenya
          </h1>
          <p className="text-sm text-muted-foreground">
            {forcat
              ? "Per seguretat, has de canviar la contrasenya inicial abans de continuar."
              : "Actualitza la teva contrasenya"}
          </p>
        </div>

        <CanviarContrasenyaForm />

        <form action={logoutAction} className="text-center">
          <Button type="submit" variant="ghost" size="sm">
            Tancar sessió
          </Button>
        </form>
      </div>
    </main>
  );
}
