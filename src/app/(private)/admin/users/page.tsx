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
import * as usersService from "@/services/users-service";
import { DeleteEntityButton } from "@/components/delete-entity-button";
import {
  ResultToast,
  type ResultToastMap,
} from "@/components/result-toast";
import { deactivateUser, reactivateUser } from "./actions";

const TOAST_MAP: ResultToastMap = {
  creat: { type: "success", text: "Usuari creat correctament" },
  actualitzat: { type: "success", text: "Usuari actualitzat" },
  reactivat: { type: "success", text: "Usuari reactivat" },
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; msg?: string }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const users = await usersService.llistar({ search });

  return (
    <div className="space-y-6">
      <ResultToast msg={params.msg} map={TOAST_MAP} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Usuaris</h1>
          <p className="text-muted-foreground">
            Gestió d&apos;usuaris de la clínica
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/nou">Nou usuari</Link>
        </Button>
      </div>

      <form method="GET" className="flex items-center gap-3">
        <Input
          name="q"
          placeholder="Cerca per nom o email…"
          defaultValue={search ?? ""}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline" size="sm">
          Aplicar
        </Button>
        {search && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/users">Netejar</Link>
          </Button>
        )}
      </form>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Actiu</TableHead>
              <TableHead>Últim login</TableHead>
              <TableHead className="text-right">Accions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No hi ha usuaris.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{u.role ?? "—"}</span>
                  </TableCell>
                  <TableCell>
                    {u.actiu ? (
                      <span className="text-green-600">Sí</span>
                    ) : (
                      <span className="text-destructive">Inactiu</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleDateString("ca-ES")
                      : "Mai"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.actiu ? (
                        <>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/users/${u.id}`}>Editar</Link>
                          </Button>
                          <DeleteEntityButton
                            id={u.id}
                            nom={u.name ?? u.email}
                            entityLabel="usuari"
                            onDelete={deactivateUser}
                          />
                        </>
                      ) : (
                        <form action={reactivateUser.bind(null, u.id)}>
                          <Button type="submit" variant="outline" size="sm">
                            Reactivar
                          </Button>
                        </form>
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
