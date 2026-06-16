import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import type { Rol } from "@/types/enums";

const ROLES_PERMITIDOS: Rol[] = ["ADMIN", "CARGA", "INVITADO"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !ROLES_PERMITIDOS.includes(session.user.rol)) {
    redirect("/auth/login");
  }

  return (
    <AdminShell rol={session.user.rol} nombre={session.user.nombre}>
      {children}
    </AdminShell>
  );
}
