import { z } from "zod";

export const tipusDespesaSchema = z.object({
  codi: z
    .string()
    .min(1, "El codi és obligatori")
    .regex(
      /^[A-Z0-9]{2,10}$/i,
      "Format de codi invàlid (2-10 caràcters alfanumèrics)",
    ),
  descripcio: z
    .string()
    .min(2, "La descripció ha de tenir almenys 2 caràcters"),
  deduible: z.boolean().default(true),
  grup: z.coerce.number().int().min(1).max(9).optional().or(z.literal("")),
  concepte: z.string().optional().or(z.literal("")),
  esAmortitzable: z.boolean().default(false),
});

export type TipusDespesaFormData = z.infer<typeof tipusDespesaSchema>;
