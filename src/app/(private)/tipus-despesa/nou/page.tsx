import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TipusDespesaForm } from "../tipus-despesa-form";

export default function NouTipusDespesaPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/tipus-despesa">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Nou tipus de despesa
          </h1>
          <p className="text-muted-foreground">
            Defineix un tipus de despesa amb la seva classificació comptable i fiscal
          </p>
        </div>
      </div>

      <TipusDespesaForm mode="create" />
    </div>
  );
}
