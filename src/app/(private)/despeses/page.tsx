import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as despesesService from "@/services/despeses-service";
import { DeleteEntityButton } from "@/components/delete-entity-button";
import { deleteDespesa } from "./actions";
import { DownloadFacturaButton } from "./download-factura-button";

export default async function DespesesPage() {
  const despeses = await despesesService.llistar();

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("ca-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatImport = (n: number | string) =>
    Number(n).toLocaleString("ca-ES", {
      style: "currency",
      currency: "EUR",
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Despeses</h1>
          <p className="text-muted-foreground">
            Registre de despeses de la clínica
          </p>
        </div>
        <Button asChild>
          <Link href="/despeses/nou">Nova despesa</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data factura</TableHead>
              <TableHead>Import</TableHead>
              <TableHead>Tipus</TableHead>
              <TableHead>Proveïdor</TableHead>
              <TableHead>Núm. factura</TableHead>
              <TableHead className="text-right">Accions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {despeses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No hi ha despeses. Comença creant-ne una.
                </TableCell>
              </TableRow>
            ) : (
              despeses.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    {formatDate(d.dataFactura)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatImport(d.import.toString())}
                  </TableCell>
                  <TableCell>{d.tipusDespesa.descripcio}</TableCell>
                  <TableCell>{d.proveidor?.nom ?? "—"}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {d.numFactura ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {d.fitxerKey && (
                        <DownloadFacturaButton
                          fitxerKey={d.fitxerKey}
                        ></DownloadFacturaButton>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/despeses/${d.id}`}>Editar</Link>
                      </Button>
                      <DeleteEntityButton
                        id={d.id}
                        nom={`${formatDate(d.dataFactura)} — ${formatImport(d.import.toString())}`}
                        entityLabel="despesa"
                        onDelete={deleteDespesa}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
