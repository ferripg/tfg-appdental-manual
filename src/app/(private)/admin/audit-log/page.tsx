import Link from "next/link";
import type { AccioAudit } from "@prisma/client";
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
import * as auditService from "@/services/audit-service";

const ACCIONS: AccioAudit[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN_OK",
  "LOGIN_FAIL",
  "LOGOUT",
  "PASSWORD_CHANGE",
  "PASSWORD_RESET",
  "USER_BLOCKED",
  "USER_UNBLOCKED",
  "ROLE_CHANGED",
  "EXERCICI_TANCAT",
  "EXERCICI_REOBERT",
  "AMORTITZACIONS_GENERATED",
  "AMORTITZACIONS_RETROCEDIDES",
];

const RUTA_ENTITAT: Record<string, string> = {
  Despesa: "/despeses",
  Proveidor: "/proveidors",
  TipusDespesa: "/tipus-despesa",
  Inventari: "/inventari",
  User: "/admin/users",
};

function parseDateParam(value: string | undefined, fiDelDia = false) {
  if (!value) return undefined;
  const d = new Date(`${value}T${fiDelDia ? "23:59:59" : "00:00:00"}`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ accio?: string; desDe?: string; finsA?: string }>;
}) {
  const params = await searchParams;
  const accio =
    params.accio && ACCIONS.includes(params.accio as AccioAudit)
      ? (params.accio as AccioAudit)
      : undefined;
  const desDe = parseDateParam(params.desDe);
  const finsA = parseDateParam(params.finsA, true);

  const logs = await auditService.llistar({ accio, desDe, finsA });
  const hasFilters = Boolean(accio || desDe || finsA);

  const formatDateTime = (d: Date) =>
    new Date(d).toLocaleString("ca-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Auditoria</h1>
        <p className="text-muted-foreground">
          Registre d&apos;accions i esdeveniments de seguretat (últims 100)
        </p>
      </div>

      <form
        method="GET"
        className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end rounded-lg border bg-card p-4"
      >
        <div>
          <label className="text-xs text-muted-foreground">Acció</label>
          <select
            name="accio"
            defaultValue={params.accio ?? ""}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            <option value="">Totes</option>
            {ACCIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Des de</label>
          <Input name="desDe" type="date" defaultValue={params.desDe ?? ""} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Fins a</label>
          <Input name="finsA" type="date" defaultValue={params.finsA ?? ""} />
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" variant="outline" size="sm">
            Aplicar
          </Button>
          {hasFilters && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/audit-log">Netejar</Link>
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-lg border bg-card">
        <Table className="min-w-180">
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Usuari</TableHead>
              <TableHead>Acció</TableHead>
              <TableHead>Entitat</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  {hasFilters
                    ? "No hi ha registres amb aquests filtres."
                    : "Encara no hi ha registres d'auditoria."}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(l.timestamp)}
                  </TableCell>
                  <TableCell>{l.user?.email ?? "—"}</TableCell>
                  <TableCell className="font-mono text-sm">{l.accio}</TableCell>
                  <TableCell>
                    {l.entitat ? (
                      <div>
                        <span>{l.entitat}</span>
                        {l.entitatId &&
                          (RUTA_ENTITAT[l.entitat] ? (
                            <Link
                              href={`${RUTA_ENTITAT[l.entitat]}/${l.entitatId}?mode=view`}
                              className="block font-mono text-xs text-muted-foreground hover:underline"
                            >
                              {l.entitatId}
                            </Link>
                          ) : (
                            <span className="block font-mono text-xs text-muted-foreground">
                              {l.entitatId}
                            </span>
                          ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {l.ip ?? "—"}
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
