import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserForm } from "../user-form";
import * as usersService from "@/services/users-service";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarUsuariPage({ params }: Props) {
  const { id } = await params;
  const user = await usersService.obtenir(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/users">← Tornar</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Editar usuari
          </h1>
          <p className="text-muted-foreground">
            {user.name ?? user.email}
          </p>
        </div>
      </div>

      <UserForm mode="edit" initialData={user} />
    </div>
  );
}
