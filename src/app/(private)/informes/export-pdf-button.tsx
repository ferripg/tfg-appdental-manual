"use client";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { Button } from "@/components/ui/button";

type Despesa = {
  numFactura: string | null;
  data: string;
  concepte: string | null;
  tipus: string;
  import: number;
};

type Proveidor = {
  nom: string;
  nif: string | null;
  despeses: Despesa[];
  subtotal: number;
};

export function ExportPdfButton({
  proveidors,
  totalGeneral,
  periode,
}: {
  proveidors: Proveidor[];
  totalGeneral: number;
  periode: string;
}) {
  const eur = (n: number) =>
    n.toLocaleString("ca-ES", { style: "currency", currency: "EUR" });

  function exportar() {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(14);
    doc.text("Despeses per proveïdor", 14, 18);
    doc.setFontSize(10);
    doc.text(`Període: ${periode}`, 14, 25);

    let y = 33;
    for (const p of proveidors) {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.text(p.nif ? `${p.nom}    NIF ${p.nif}` : p.nom, 14, y);
      autoTable(doc, {
        startY: y + 2,
        head: [["Nº factura", "Data", "Concepte", "Tipus", "Import"]],
        body: p.despeses.map((d) => [
          d.numFactura ?? "—",
          d.data,
          d.concepte ?? "—",
          d.tipus,
          eur(d.import),
        ]),
        foot: [["", "", "", "Subtotal", eur(p.subtotal)]],
        styles: { fontSize: 8 },
        headStyles: { fontSize: 8 },
        footStyles: { fontSize: 8 },
      });
      const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } })
        .lastAutoTable.finalY;
      y = finalY + 10;
    }

    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.text(`Total general: ${eur(totalGeneral)}`, 14, y);

    doc.save("despeses-per-proveidor.pdf");
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={exportar}>
      Exportar PDF
    </Button>
  );
}
