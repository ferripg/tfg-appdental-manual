import { z } from "zod";
import { isValidIBAN } from "@/lib/validators/iban";
import { isValidNIF } from "@/lib/validators/nif";

export const proveidorSchema = z.object({
  nif: z
    .string()
    .min(1, "El NIF és obligatori")
    .refine(isValidNIF, "NIF no vàlid (comprova el dígit/lletra de control)"),
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
    .refine(
      (v) => v === "" || isValidIBAN(v),
      "IBAN no vàlid (comprova el dígit de control mod-97)",
    )
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type ProveidorFormData = z.infer<typeof proveidorSchema>;
