import { auth, signOut } from "~/auth";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Hola {session?.user?.email}</p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button>Tancar sessió</button>
      </form>
    </div>
  );
}
