"use server";

import { auth } from "@/lib/auth";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
    await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });
  } catch (err) {
    if (isAPIError(err) && err.status === "FORBIDDEN") {
      return err.message;
    }
    return "Credencials invàlides";
  }

  redirect("/dashboard");
}
