import { z } from "zod";

export const proveidorSchema = z.object({
  nif: z
    .string()
    .min(1, "El NIF és obligatori")
    .regex(
      /^[A-Z0-9]{8,10}$/i,
      "Format de NIF invàlid (8-10 caràcters alfanumèrics)",
    ),
  nom: z.string().min(2, "El nom ha de tenir almenys 2 caràcters"),
  codiBis: z.string().optional().or(z.literal("")),
  adreca: z.string().optional().or(z.literal("")),
  codiPostal: z
    .string()
    .regex(/^\d{5}$/, "El codi postal ha de tenir 5 dígits")
    .optional()
    .or(z.literal("")),
  poblacio: z.string().optional().or(z.literal("")),
  email: z.email("Email invàlid").optional().or(z.literal("")),
  telefon: z.string().optional().or(z.literal("")),
  personaContacte: z.string().optional().or(z.literal("")),
  iban: z
    .string()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/i, "Format IBAN invàlid")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type ProveidorFormData = z.infer<typeof proveidorSchema>;
