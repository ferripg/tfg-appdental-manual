import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Hola {session?.user?.email}</p>
      <form
        action={async () => {
          "use server";
          await auth.api.signOut({ headers: await headers() });
          redirect("/login");
        }}
      >
        <button>Tancar sessió</button>
      </form>
    </div>
  );
}
