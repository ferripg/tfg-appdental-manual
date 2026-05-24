import { z } from "zod";

export const userCreateSchema = z.object({
  email: z.email("Email invàlid"),
  password: z.string().min(8, "El password ha de tenir almenys 8 caràcters"),
  name: z.string().min(2, "El nom ha de tenir almenys 2 caràcters"),
  role: z.enum(["ADMIN", "MANAGER", "OPERARI"]),
});

export const userUpdateSchema = z.object({
  email: z.email("Email invàlid"),
  name: z.string().min(2, "El nom ha de tenir almenys 2 caràcters"),
  role: z.enum(["ADMIN", "MANAGER", "OPERARI"]),
});

export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
