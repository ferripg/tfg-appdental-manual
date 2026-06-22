import * as reportsService from "@/services/reports-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportPdfButton } from "./export-pdf-button";

function parseDateParam(value: string | undefined, fiDelDia = false) {
  if (!value) return undefined;
  const d = new Date(`${value}T${fiDelDia ? "23:59:59" : "00:00:00"}`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const eur = (n: number) =>
  n.toLocaleString("ca-ES", { style: "currency", currency: "EUR" });

export default async function InformesPage({
  searchParams,
}: {
  searchParams: Promise<{ desDe?: string; finsA?: string }>;
}) {
  const params = await searchParams;
  const anyActual = new Date().getFullYear();

  // Període per defecte: any actual (des de l'1 de gener fins al 31 de desembre)
  const desDe = parseDateParam(params.desDe) ?? new Date(anyActual, 0, 1);
  const finsA =
    parseDateParam(params.finsA, true) ??
    new Date(anyActual, 11, 31, 23, 59, 59);

  const { rows, totalGeneral } = await reportsService.informeProveidors({
    desDe,
    finsA,
  });
  const totalFactures = rows.reduce((acc, r) => acc + r.comptador, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Informes</h1>
          <p className="text-muted-foreground">
            Despeses per proveïdor en un període
          </p>
        </div>
        {rows.length > 0 && (
          <ExportPdfButton
            rows={rows}
            totalGeneral={totalGeneral}
            totalFactures={totalFactures}
            desDe={toInput(desDe)}
            finsA={toInput(finsA)}
          />
        )}
      </div>

      <form
        method="GET"
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4"
      >
        <div>
          <label className="text-xs text-muted-foreground">Des de</label>
          <Input name="desDe" type="date" defaultValue={toInput(desDe)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Fins a</label>
          <Input name="finsA" type="date" defaultValue={toInput(finsA)} />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Aplicar
        </Button>
      </form>

      <div className="rounded-lg border bg-card">
        <Table className="min-w-160">
          <TableHeader>
            <TableRow>
              <TableHead>Proveïdor</TableHead>
              <TableHead className="text-right">Nº factures</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  No hi ha despeses en aquest període.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rows.map((r) => (
                  <TableRow key={r.proveidorId ?? "sense"}>
                    <TableCell className="font-medium">{r.nom}</TableCell>
                    <TableCell className="text-right">{r.comptador}</TableCell>
                    <TableCell className="text-right font-mono">
                      {eur(r.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.percentatge.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{totalFactures}</TableCell>
                  <TableCell className="text-right font-mono">
                    {eur(totalGeneral)}
                  </TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
