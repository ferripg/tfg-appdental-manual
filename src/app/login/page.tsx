"use client";
import { useActionState } from "react";
import { authenticate } from "./actions";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate, // Server Action que s'executa al submit
    undefined, // valor inicial d'errorMessage (cap error al primer render)
  );
  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button disabled={isPending}>Entrar</button>
      {errorMessage && <p>{errorMessage}</p>}
    </form>
  );
}
