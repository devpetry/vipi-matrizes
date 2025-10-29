import SidebarToggle from "@/components/SidebarToggle";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️   Não existe sessão: ", session);
    }
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center">
      <main>
        <h1 className="text-3xl font-black mt-4">Olá, {session.user?.name}</h1>
        <SidebarToggle />
      </main>
    </div>
  );
}
