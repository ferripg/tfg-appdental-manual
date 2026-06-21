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
import * as tipusDespesaService from "@/services/tipus-despesa-service";
import { currentUserCan } from "@/lib/get-session";
import { DeleteEntityButton } from "@/components/delete-entity-button";
import {
  ResultToast,
  type ResultToastMap,
} from "@/components/result-toast";
import { deleteTipusDespesa, reactivateTipusDespesa } from "./actions";

const TOAST_MAP: ResultToastMap = {
  creat: { type: "success", text: "Tipus de despesa creat" },
  actualitzat: { type: "success", text: "Tipus de despesa actualitzat" },
  reactivat: { type: "success", text: "Tipus de despesa reactivat" },
};

export default async function TipusDespesaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; inactius?: string; msg?: string }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const includeInactius = params.inactius === "1";
  const tipusDespeses = await tipusDespesaService.llistar({
    search,
    includeInactius,
  });
  const potGestionar = await currentUserCan("tipusDespesa", "create");

  return (
    <div className="space-y-6">
      <ResultToast msg={params.msg} map={TOAST_MAP} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Tipus de despeses
          </h1>
          <p className="text-muted-foreground">Gestió dels tipus de despesa</p>
        </div>
        {potGestionar && (
          <Button asChild>
            <Link href="/tipus-despesa/nou">Nou tipus de despesa</Link>
          </Button>
        )}
      </div>

      <form method="GET" className="flex items-center gap-3">
        <Input
          name="q"
          placeholder="Cerca per codi o descripció…"
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
            <Link href="/tipus-despesa">Netejar</Link>
          </Button>
        )}
      </form>

      <div className="rounded-lg border bg-card">
        <Table className="min-w-195">
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
                <TableRow
                  key={p.id}
                  className={!p.actiu ? "opacity-60" : undefined}
                >
                  <TableCell className="font-mono text-sm">{p.codi}</TableCell>
                  <TableCell className="font-medium">
                    {p.descripcio}
                    {!p.actiu && (
                      <span className="ml-2 text-xs text-destructive">
                        (desactivat)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{p.concepte ?? "—"}</TableCell>
                  <TableCell>{p.grup ?? "—"}</TableCell>
                  <TableCell>{p.esAmortitzable ? "Sí" : "No"}</TableCell>
                  <TableCell>{p.deduible ? "Sí" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/tipus-despesa/${p.id}?mode=view`}>Veure</Link>
                      </Button>
                      {potGestionar &&
                        (p.actiu ? (
                          <>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/tipus-despesa/${p.id}`}>Editar</Link>
                            </Button>
                            <DeleteEntityButton
                              id={p.id}
                              nom={p.descripcio}
                              entityLabel="tipus de despesa"
                              onDelete={deleteTipusDespesa}
                            />
                          </>
                        ) : (
                          <form action={reactivateTipusDespesa.bind(null, p.id)}>
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
