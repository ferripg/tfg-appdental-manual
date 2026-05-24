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
import * as usersService from "@/services/users-service";
import { DeleteEntityButton } from "@/components/delete-entity-button";
import { deactivateUser } from "./actions";

export default async function UsersPage() {
  const users = await usersService.llistar();

  return (
    <div className="space-y-6">
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
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/users/${u.id}`}>Editar</Link>
                      </Button>
                      {u.actiu && (
                        <DeleteEntityButton
                          id={u.id}
                          nom={u.name ?? u.email}
                          entityLabel="usuari"
                          onDelete={deactivateUser}
                        />
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
