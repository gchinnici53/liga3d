import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NuevoUsuarioForm from "./NuevoUsuarioForm";
import UsuarioActions from "./UsuarioActions";
const ETIQUETA_ROL: Record<string, string> = {
  ADMIN:    "Administrador",
  CARGA:    "Carga",
  INVITADO: "Invitado",
  ARQUERO:  "Arquero",
};

const COLOR_ROL: Record<string, string> = {
  ADMIN:    "bg-red-100 text-red-700",
  CARGA:    "bg-blue-100 text-blue-700",
  INVITADO: "bg-slate-100 text-slate-600",
  ARQUERO:  "bg-green-100 text-green-700",
};

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.rol !== "ADMIN") {
    redirect("/admin/dashboard");
  }

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { arquero: { select: { nombre: true, apellido: true } } },
  });

  const sesionId = Number(session.user.id);

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Usuarios</h1>
      <p className="text-slate-500 text-sm mb-6">
        Gestión de accesos al panel de administración.
      </p>

      {/* Lista de usuarios */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-600">Usuarios registrados</h2>
        </div>
        {usuarios.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Sin usuarios.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Arquero vinculado</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Rol</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Creado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => {
                const esPropio = u.id === sesionId;
                return (
                  <tr key={u.id} className={esPropio ? "bg-green-50" : "hover:bg-slate-50"}>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {u.email}
                      {esPropio && (
                        <span className="ml-2 text-xs text-slate-400">(vos)</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600 hidden sm:table-cell">
                      {u.arquero
                        ? `${u.arquero.nombre} ${u.arquero.apellido}`
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${COLOR_ROL[u.rol] ?? "bg-slate-100 text-slate-600"}`}>
                        {ETIQUETA_ROL[u.rol] ?? u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs hidden sm:table-cell">
                      {new Date(u.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-5 py-3">
                      <UsuarioActions usuarioId={u.id} esPropio={esPropio} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Crear nuevo usuario */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Agregar usuario</h2>
        <NuevoUsuarioForm />
      </div>
    </div>
  );
}
