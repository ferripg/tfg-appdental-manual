"use client";

import { useTransition } from "react";
import { getFacturaUrl } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = { fitxerKey: string };

export function DownloadFacturaButton({ fitxerKey }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDownload() {
    startTransition(async () => {
      try {
        const url = await getFacturaUrl(fitxerKey);
        window.open(url, "_blank");
      } catch {
        toast.error("Error obtenint l'URL del fitxer");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isPending}
    >
      {isPending ? "Obrint..." : "PDF"}
    </Button>
  );
}
