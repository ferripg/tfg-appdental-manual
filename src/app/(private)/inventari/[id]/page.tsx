import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InventariForm } from "../inventari-form";
import * as inventariService from "@/services/inventari-service";
import * as proveidorsService from "@/services/proveidors-service";

export default async function EditarInventariPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [item, proveidors] = await Promise.all([
    inventariService.obtenir(id),
    proveidorsService.llistar(),
  ]);

  if (!item) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/inventari">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Editar bé</h1>
          <p className="text-muted-foreground">{item.descripcio}</p>
        </div>
      </div>

      <InventariForm initialData={item} proveidors={proveidors} />
    </div>
  );
}
