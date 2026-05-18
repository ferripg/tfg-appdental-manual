import { z } from "zod";

export const despesaSchema = z.object({
  dataFactura: z.coerce.date({ message: "Data de factura obligatòria" }),
  dataPagament: z.coerce.date().optional().or(z.literal("")),
  import: z.coerce.number().positive("L'import ha de ser positiu"),
  numFactura: z.string().optional().or(z.literal("")),
  descripcio: z.string().optional().or(z.literal("")),
  tipusDespesaId: z.string().min(1, "El tipus de despesa és obligatori"),
  proveidorId: z.string().min(1, "El proveïdor és obligatori"),
});

export type DespesaFormData = z.infer<typeof despesaSchema>;
