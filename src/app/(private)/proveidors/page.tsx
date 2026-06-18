import Link from "next/link";
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
import * as proveidorsService from "@/services/proveidors-service";
import { currentUserCan } from "@/lib/get-session";
import { DeleteEntityButton } from "@/components/delete-entity-button";
import {
  ResultToast,
  type ResultToastMap,
} from "@/components/result-toast";
import { deleteProveidor, reactivateProveidor } from "./actions";

const TOAST_MAP: ResultToastMap = {
  creat: { type: "success", text: "Proveïdor creat correctament" },
  actualitzat: { type: "success", text: "Proveïdor actualitzat" },
  reactivat: { type: "success", text: "Proveïdor reactivat" },
};

export default async function ProveidorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; inactius?: string; msg?: string }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const includeInactius = params.inactius === "1";
  const proveidors = await proveidorsService.llistar({ search, includeInactius });
  const potGestionar = await currentUserCan("proveidor", "create");

  return (
    <div className="space-y-6">
      <ResultToast msg={params.msg} map={TOAST_MAP} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Proveïdors</h1>
          <p className="text-muted-foreground">
            Gestió de proveïdors de la clínica
          </p>
        </div>
        {potGestionar && (
          <Button asChild>
            <Link href="/proveidors/nou">Nou proveïdor</Link>
          </Button>
        )}
      </div>

      <form method="GET" className="flex items-center gap-3">
        <Input
          name="q"
          placeholder="Cerca per nom o NIF…"
          defaultValue={search ?? ""}
          className="max-w-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="inactius"
            value="1"
            defaultChecked={includeInactius}
            className="h-4 w-4 rounded border-input"
          />
          Mostrar desactivats
        </label>
        <Button type="submit" variant="outline" size="sm">
          Aplicar
        </Button>
        {(search || includeInactius) && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/proveidors">Netejar</Link>
          </Button>
        )}
      </form>

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
                <TableRow
                  key={p.id}
                  className={!p.actiu ? "opacity-60" : undefined}
                >
                  <TableCell className="font-mono text-sm">{p.nif}</TableCell>
                  <TableCell className="font-medium">
                    {p.nom}
                    {!p.actiu && (
                      <span className="ml-2 text-xs text-destructive">
                        (desactivat)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{p.poblacio ?? "—"}</TableCell>
                  <TableCell>{p.email ?? "—"}</TableCell>
                  <TableCell>{p.telefon ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/proveidors/${p.id}?mode=view`}>Veure</Link>
                      </Button>
                      {potGestionar &&
                        (p.actiu ? (
                          <>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/proveidors/${p.id}`}>Editar</Link>
                            </Button>
                            <DeleteEntityButton
                              id={p.id}
                              nom={p.nom}
                              entityLabel="proveïdor"
                              onDelete={deleteProveidor}
                            />
                          </>
                        ) : (
                          <form action={reactivateProveidor.bind(null, p.id)}>
                            <Button type="submit" variant="outline" size="sm">
                              Reactivar
                            </Button>
                          </form>
                        ))}
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
