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
};

export function DeleteEntityButton({
  id,
  nom,
  entityLabel,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await onDelete(id);
        toast.success(`${capitalitza(entityLabel)} "${nom}" eliminat`);
        setOpen(false);
      } catch {
        toast.error(`Error eliminant el ${entityLabel}`);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar {entityLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            Estàs a punt d&apos;eliminar <strong>{nom}</strong>. Es marcarà
            com a inactiu i no apareixerà als llistats.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            Cancel·lar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? "Eliminant..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function capitalitza(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
