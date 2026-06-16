import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import type { Rol } from "@/types/enums";

const ROLES_PERMITIDOS: Rol[] = ["ADMIN", "CARGA", "INVITADO"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !ROLES_PERMITIDOS.includes(session.user.rol)) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar rol={session.user.rol} nombre={session.user.nombre} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
