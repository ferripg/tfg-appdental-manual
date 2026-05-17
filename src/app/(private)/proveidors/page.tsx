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
import * as proveidorsService from "@/services/proveidors-service";
import { DeleteProveidorButton } from "./delete-proveidor-button";

export default async function ProveidorsPage() {
  const proveidors = await proveidorsService.llistar();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Proveïdors</h1>
          <p className="text-muted-foreground">
            Gestió de proveïdors de la clínica
          </p>
        </div>
        <Button asChild>
          <Link href="/proveidors/nou">Nou proveïdor</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIF</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Població</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telèfon</TableHead>
              <TableHead className="text-right">Accions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proveidors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No hi ha proveïdors. Comença creant-ne un.
                </TableCell>
              </TableRow>
            ) : (
              proveidors.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.nif}</TableCell>
                  <TableCell className="font-medium">{p.nom}</TableCell>
                  <TableCell>{p.poblacio ?? "—"}</TableCell>
                  <TableCell>{p.email ?? "—"}</TableCell>
                  <TableCell>{p.telefon ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/proveidors/${p.id}`}>Editar</Link>
                      </Button>
                      <DeleteProveidorButton id={p.id} nom={p.nom} />
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
