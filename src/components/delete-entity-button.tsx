"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  id: string;
  nom: string;
  entityLabel: string;
  onDelete: (id: string) => Promise<void>;
  mode?: "soft" | "hard";
};

export function DeleteEntityButton({
  id,
  nom,
  entityLabel,
  onDelete,
  mode = "soft",
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const verb = mode === "soft" ? "Desactivar" : "Eliminar";
  const verbPast = mode === "soft" ? "desactivat" : "eliminat";
  const verbProgressive = mode === "soft" ? "Desactivant" : "Eliminant";
  const description =
    mode === "soft"
      ? `Estàs a punt de desactivar ${nom}. Es marcarà com a inactiu i no apareixerà als llistats per defecte.`
      : `Estàs a punt d'eliminar ${nom} permanentment. Aquesta acció no es pot desfer.`;

  function handleDelete() {
    startTransition(async () => {
      try {
        await onDelete(id);
        toast.success(`${capitalitza(entityLabel)} "${nom}" ${verbPast}`);
        setOpen(false);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : `Error ${verbProgressive.toLowerCase()} el ${entityLabel}`,
        );
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          {verb}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {verb} {entityLabel}?
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel·lar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? `${verbProgressive}...` : verb}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function capitalitza(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
