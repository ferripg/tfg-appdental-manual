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
import * as despesesService from "@/services/despeses-service";
import * as proveidorsService from "@/services/proveidors-service";
import * as tipusDespesaService from "@/services/tipus-despesa-service";
import { currentUserCan } from "@/lib/get-session";
import { DeleteEntityButton } from "@/components/delete-entity-button";
import {
  ResultToast,
  type ResultToastMap,
} from "@/components/result-toast";
import { deleteDespesa } from "./actions";
import { DownloadFacturaButton } from "./download-factura-button";

const TOAST_MAP: ResultToastMap = {
  creat: { type: "success", text: "Despesa creada" },
  actualitzat: { type: "success", text: "Despesa actualitzada" },
};

function parseDateParam(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseNumParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

export default async function DespesesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    desDe?: string;
    finsA?: string;
    proveidorId?: string;
    tipusId?: string;
    exercici?: string;
    importMin?: string;
    importMax?: string;
    msg?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  let desDe = parseDateParam(params.desDe);
  let finsA = parseDateParam(params.finsA);
  const proveidorId = params.proveidorId || undefined;
  const tipusId = params.tipusId || undefined;
  const importMin = parseNumParam(params.importMin);
  const importMax = parseNumParam(params.importMax);

  // Exercici: si se'n tria un, filtra tot l'any (sobreescriu el rang de dates).
  const exercici = parseNumParam(params.exercici);
  if (exercici !== undefined) {
    desDe = new Date(exercici, 0, 1);
    finsA = new Date(exercici, 11, 31);
  }

  const [despeses, proveidors, tipus, anysDespeses] = await Promise.all([
    despesesService.llistar({
      search,
      desDe,
      finsA,
      proveidorId,
      tipusId,
      importMin,
      importMax,
    }),
    proveidorsService.llistar(),
    tipusDespesaService.llistar(),
    despesesService.exercicisAmbDespeses(),
  ]);

  // Anys del desplegable: els que realment tenen despeses + sempre l'actual.
  const anyActual = new Date().getFullYear();
  const exercicis = [...new Set([anyActual, ...anysDespeses])].sort(
    (a, b) => b - a,
  );

  const potCrear = await currentUserCan("despesa", "create");
  const potGestionar = await currentUserCan("despesa", "update");

  const hasFilters = Boolean(
    search ||
      desDe ||
      finsA ||
      proveidorId ||
      tipusId ||
      importMin !== undefined ||
      importMax !== undefined,
  );

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
      <ResultToast msg={params.msg} map={TOAST_MAP} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Despeses</h1>
          <p className="text-muted-foreground">
            Registre de despeses de la clínica
          </p>
        </div>
        {potCrear && (
          <Button asChild>
            <Link href="/despeses/nou">Nova despesa</Link>
          </Button>
        )}
      </div>

      <form method="GET" className="space-y-3 rounded-lg border bg-card p-4">
        {/* Filtres principals */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-muted-foreground">Cerca</label>
            <Input
              name="q"
              placeholder="Núm. factura o descripció…"
              defaultValue={search ?? ""}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Exercici</label>
            <select
              name="exercici"
              defaultValue={params.exercici ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            >
              <option value="">Tots</option>
              {exercicis.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
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
          <div>
            <label className="text-xs text-muted-foreground">Tipus</label>
            <select
              name="tipusId"
              defaultValue={tipusId ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            >
              <option value="">Tots</option>
              {tipus.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.codi} — {t.descripcio}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Més filtres: col·lapsable; s'obre sol si n'hi ha algun d'actiu */}
        <details
          open={Boolean(
            params.desDe ||
              params.finsA ||
              importMin !== undefined ||
              importMax !== undefined,
          )}
        >
          <summary className="cursor-pointer select-none text-sm text-muted-foreground">
            Més filtres
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mt-3">
            <div>
              <label className="text-xs text-muted-foreground">Des de</label>
              <Input name="desDe" type="date" defaultValue={params.desDe ?? ""} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fins a</label>
              <Input name="finsA" type="date" defaultValue={params.finsA ?? ""} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Import mín</label>
              <Input
                name="importMin"
                type="number"
                step="0.01"
                min="0"
                defaultValue={params.importMin ?? ""}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Import màx</label>
              <Input
                name="importMax"
                type="number"
                step="0.01"
                min="0"
                defaultValue={params.importMax ?? ""}
              />
            </div>
          </div>
        </details>

        {/* Accions */}
        <div className="flex items-center gap-2">
          <Button type="submit" variant="outline" size="sm">
            Aplicar
          </Button>
          {hasFilters && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/despeses">Netejar</Link>
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data factura</TableHead>
              <TableHead>Concepte</TableHead>
              <TableHead>Import</TableHead>
              <TableHead>Tipus</TableHead>
              <TableHead>Proveïdor</TableHead>
              <TableHead>Núm. factura</TableHead>
              <TableHead>Estat</TableHead>
              <TableHead className="text-right">Accions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {despeses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  No hi ha despeses. {hasFilters ? "Prova a netejar els filtres." : "Comença creant-ne una."}
                </TableCell>
              </TableRow>
            ) : (
              despeses.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{formatDate(d.dataFactura)}</TableCell>
                  <TableCell className="font-medium">
                    {d.descripcio ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatImport(d.import.toString())}
                  </TableCell>
                  <TableCell>{d.tipusDespesa.descripcio}</TableCell>
                  <TableCell>{d.proveidor?.nom ?? "—"}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {d.numFactura ?? "—"}
                  </TableCell>
                  <TableCell>
                    {d.dataPagament ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Pagada
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Pendent
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {d.fitxerKey && (
                        <DownloadFacturaButton
                          fitxerKey={d.fitxerKey}
                        ></DownloadFacturaButton>
                      )}
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/despeses/${d.id}?mode=view`}>Veure</Link>
                      </Button>
                      {potGestionar && (
                        <>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/despeses/${d.id}`}>Editar</Link>
                          </Button>
                          <DeleteEntityButton
                            id={d.id}
                            nom={`${formatDate(d.dataFactura)} — ${formatImport(d.import.toString())}`}
                            entityLabel="despesa"
                            onDelete={deleteDespesa}
                            mode="hard"
                          />
                        </>
                      )}
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
