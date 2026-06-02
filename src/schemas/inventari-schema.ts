import { z } from "zod";

export const inventariSchema = z.object({
  descripcio: z.string().min(1, "La descripció és obligatòria"),
  dataAdquisicio: z.coerce
    .date({ message: "Data d'adquisició obligatòria" })
    .refine((d) => d <= new Date(), {
      message: "La data d'adquisició no pot ser futura",
    }),
  importAdquisicio: z.coerce
    .number()
    .positive("L'import d'adquisició ha de ser positiu"),
  percAmortitzacio: z.coerce
    .number()
    .min(0, "El percentatge no pot ser negatiu")
    .max(100, "El percentatge no pot superar el 100%"),
  numFactura: z.string().optional().or(z.literal("")),
  proveidorId: z.string().optional().or(z.literal("")),
});

export type InventariFormData = z.infer<typeof inventariSchema>;
