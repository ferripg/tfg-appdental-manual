import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProveidorForm } from "../proveidor-form";
import * as proveidorsService from "@/services/proveidors-service";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarProveidorPage({ params }: Props) {
  const { id } = await params;
  const proveidor = await proveidorsService.obtenir(id);

  if (!proveidor) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/proveidors">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Editar proveïdor
          </h1>
          <p className="text-muted-foreground">
            {proveidor.nom} — NIF {proveidor.nif}
          </p>
        </div>
      </div>

      <ProveidorForm mode="edit" initialData={proveidor} />
    </div>
  );
}
