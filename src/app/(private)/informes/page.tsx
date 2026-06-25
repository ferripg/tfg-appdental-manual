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

  const desDe = parseDateParam(params.desDe) ?? new Date(anyActual, 0, 1);
  const finsA =
    parseDateParam(params.finsA, true) ??
    new Date(anyActual, 11, 31, 23, 59, 59);

  const { proveidors, totalGeneral } = await reportsService.informeProveidors({
    desDe,
    finsA,
  });
  const periode = `${desDe.toLocaleDateString("ca-ES")} – ${finsA.toLocaleDateString("ca-ES")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Despeses per proveïdor
          </h1>
          <p className="text-muted-foreground">{periode}</p>
        </div>
        {proveidors.length > 0 && (
          <ExportPdfButton
            proveidors={proveidors}
            totalGeneral={totalGeneral}
            periode={periode}
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

      {proveidors.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No hi ha despeses en aquest període.
        </div>
      ) : (
        <>
          {proveidors.map((p, i) => (
            <div key={i} className="rounded-lg border bg-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="font-semibold">{p.nom}</span>
                <span className="text-sm text-muted-foreground">
                  NIF {p.nif ?? "—"}
                </span>
              </div>
              <Table className="min-w-160">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº factura</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Concepte</TableHead>
                    <TableHead>Tipus</TableHead>
                    <TableHead className="text-right">Import</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {p.despeses.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-sm">
                        {d.numFactura ?? "—"}
                      </TableCell>
                      <TableCell>{d.data}</TableCell>
                      <TableCell>{d.concepte ?? "—"}</TableCell>
                      <TableCell>{d.tipus}</TableCell>
                      <TableCell className="text-right font-mono">
                        {eur(d.import)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold">
                    <TableCell colSpan={4} className="text-right">
                      Subtotal
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {eur(p.subtotal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ))}

          <div className="flex items-center justify-end gap-3 rounded-lg border bg-card px-4 py-3">
            <span className="font-semibold">Total general</span>
            <span className="font-mono font-semibold">{eur(totalGeneral)}</span>
          </div>
        </>
      )}
    </div>
  );
}
