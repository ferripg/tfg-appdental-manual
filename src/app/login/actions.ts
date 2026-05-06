"use server";

import { AuthError } from "next-auth";
import { signIn } from "~/auth";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return "Dades invàlides";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) return "Credencials invàlides";
    throw error;
  }
}
