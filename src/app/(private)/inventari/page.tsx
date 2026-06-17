import Link from "next/link";
import type { EstatInventari } from "@prisma/client";
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
import * as inventariService from "@/services/inventari-service";
import * as proveidorsService from "@/services/proveidors-service";
import { currentUserCan } from "@/lib/get-session";
import { ResultToast, type ResultToastMap } from "@/components/result-toast";
import { DeleteEntityButton } from "@/components/delete-entity-button";
import {
  baixaInventari,
  reactivarInventari,
  eliminarInventari,
} from "./actions";

const TOAST_MAP: ResultToastMap = {
  creat: { type: "success", text: "Bé creat correctament" },
  actualitzat: { type: "success", text: "Bé actualitzat" },
  baixa: { type: "success", text: "Bé donat de baixa" },
  reactivat: { type: "success", text: "Bé reactivat" },
};

const ESTAT_BADGE: Record<EstatInventari, { text: string; classes: string }> = {
  ACTIU: { text: "Actiu", classes: "bg-green-100 text-green-800" },
  BAIXA: { text: "De baixa", classes: "bg-amber-100 text-amber-800" },
  ELIMINAT: { text: "Eliminat", classes: "bg-destructive/10 text-destructive" },
};

export default async function InventariPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    estat?: string;
    proveidorId?: string;
    msg?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  // Per defecte mostrem només els actius. "TOTS" treu el filtre d'estat.
  const estatParam = params.estat || "ACTIU";
  const estat =
    estatParam === "TOTS" ? undefined : (estatParam as EstatInventari);
  const proveidorId = params.proveidorId || undefined;

  const [items, proveidors] = await Promise.all([
    inventariService.llistar({ search, estat, proveidorId }),
    proveidorsService.llistar(),
  ]);

  const potGestionar = await currentUserCan("inventari", "update");

  const hasFilters = Boolean(
    search || estatParam !== "ACTIU" || proveidorId,
  );

  const formatImport = (n: number | string) =>
    Number(n).toLocaleString("ca-ES", { style: "currency", currency: "EUR" });

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("ca-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <ResultToast msg={params.msg} map={TOAST_MAP} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Inventari</h1>
          <p className="text-muted-foreground">
            Béns amortitzables (es generen automàticament des de les despeses
            amortitzables)
          </p>
        </div>
      </div>

      <form
        method="GET"
        className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end rounded-lg border bg-card p-4"
      >
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">Cerca</label>
          <Input
            name="q"
            placeholder="Descripció del bé…"
            defaultValue={search ?? ""}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Estat</label>
          <select
            name="estat"
            defaultValue={estatParam}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            <option value="ACTIU">Actius</option>
            <option value="BAIXA">De baixa</option>
            <option value="TOTS">Tots</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Proveïdor</label>
          <select
            name="proveidorId"
            defaultValue={proveidorId ?? ""}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            <option value="">Tots</option>
            {proveidors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 md:col-span-4">
          <Button type="submit" variant="outline" size="sm">
            Aplicar
          </Button>
          {hasFilters && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/inventari">Netejar</Link>
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Núm.</TableHead>
              <TableHead>Descripció</TableHead>
              <TableHead>Data adquisició</TableHead>
              <TableHead>Import</TableHead>
              <TableHead>% amort.</TableHead>
              <TableHead>Proveïdor</TableHead>
              <TableHead>Estat</TableHead>
              <TableHead className="text-right">Accions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  No hi ha béns.{" "}
                  {hasFilters
                    ? "Prova a netejar els filtres."
                    : "Comença creant-ne un."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((b) => {
                const badge = ESTAT_BADGE[b.estat];
                const teAmort = b._count.amortitzacions > 0;
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-sm">
                      {b.numInventari ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">{b.descripcio}</TableCell>
                    <TableCell>{formatDate(b.dataAdquisicio)}</TableCell>
                    <TableCell className="font-mono">
                      {formatImport(b.importAdquisicio.toString())}
                    </TableCell>
                    <TableCell>{b.percAmortitzacio.toString()}%</TableCell>
                    <TableCell>{b.proveidor?.nom ?? "—"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.classes}`}
                      >
                        {badge.text}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {potGestionar &&
                          (b.estat === "ACTIU" ? (
                            <>
                              {teAmort ? (
                                <span
                                  className="text-xs text-muted-foreground"
                                  title="Bé amb amortitzacions generades: retrocedeix-les per poder editar-lo."
                                >
                                  Bloquejat
                                </span>
                              ) : (
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/inventari/${b.id}`}>Editar</Link>
                                </Button>
                              )}
                              <form action={baixaInventari.bind(null, b.id)}>
                                <Button
                                  type="submit"
                                  variant="outline"
                                  size="sm"
                                >
                                  Donar de baixa
                                </Button>
                              </form>
                            </>
                          ) : (
                            <>
                              <form action={reactivarInventari.bind(null, b.id)}>
                                <Button type="submit" variant="outline" size="sm">
                                  Reactivar
                                </Button>
                              </form>
                              {teAmort ? (
                                <span
                                  className="text-xs text-muted-foreground"
                                  title="Bé amb amortitzacions generades: retrocedeix-les per poder eliminar-lo."
                                >
                                  Bloquejat
                                </span>
                              ) : (
                                <DeleteEntityButton
                                  id={b.id}
                                  nom={b.descripcio}
                                  entityLabel="bé"
                                  onDelete={eliminarInventari}
                                  mode="hard"
                                />
                              )}
                            </>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
