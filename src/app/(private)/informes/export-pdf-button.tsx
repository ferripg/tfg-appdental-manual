"use client";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { Button } from "@/components/ui/button";

type Row = {
  nom: string;
  comptador: number;
  total: number;
  percentatge: number;
};

export function ExportPdfButton({
  rows,
  totalGeneral,
  totalFactures,
  desDe,
  finsA,
}: {
  rows: Row[];
  totalGeneral: number;
  totalFactures: number;
  desDe: string;
  finsA: string;
}) {
  const eur = (n: number) =>
    n.toLocaleString("ca-ES", { style: "currency", currency: "EUR" });

  function exportar() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Informe de despeses per proveïdor", 14, 18);
    doc.setFontSize(10);
    doc.text(`Període: ${desDe} a ${finsA}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [["Proveïdor", "Nº factures", "Total", "%"]],
      body: rows.map((r) => [
        r.nom,
        String(r.comptador),
        eur(r.total),
        `${r.percentatge.toFixed(1)}%`,
      ]),
      foot: [["Total", String(totalFactures), eur(totalGeneral), "100%"]],
    });

    doc.save(`informe-despeses-${desDe}_${finsA}.pdf`);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={exportar}>
      Exportar PDF
    </Button>
  );
}
