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
import * as tipusDespesaService from "@/services/tipus-despesa-service";
import { DeleteEntityButton } from "@/components/delete-entity-button";
import { deleteTipusDespesa } from "./actions";

export default async function TipusDespesaPage() {
  const tipusDespeses = await tipusDespesaService.llistar();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Tipus de despeses
          </h1>
          <p className="text-muted-foreground">Gestió dels tipus de despesa</p>
        </div>
        <Button asChild>
          <Link href="/tipus-despesa/nou">Nou tipus de despesa</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codi</TableHead>
              <TableHead>Descripció</TableHead>
              <TableHead>Concepte</TableHead>
              <TableHead>Grup</TableHead>
              <TableHead>Amortitzable</TableHead>
              <TableHead>Deduible</TableHead>
              <TableHead className="text-right">Accions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tipusDespeses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No hi ha tipus de despesa. Comença creant-ne un.
                </TableCell>
              </TableRow>
            ) : (
              tipusDespeses.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.codi}</TableCell>
                  <TableCell className="font-medium">{p.descripcio}</TableCell>
                  <TableCell>{p.concepte ?? "—"}</TableCell>
                  <TableCell>{p.grup ?? "—"}</TableCell>
                  <TableCell>{p.deduible ? "Sí" : "No"}</TableCell>
                  <TableCell>{p.esAmortitzable ? "Sí" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/tipus-despesa/${p.id}`}>Editar</Link>
                      </Button>
                      <DeleteEntityButton
                        id={p.id}
                        nom={p.descripcio}
                        entityLabel="tipus de despesa"
                        onDelete={deleteTipusDespesa}
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
