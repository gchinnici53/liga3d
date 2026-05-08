import { prisma } from "@/lib/prisma";
import { crearCategoria, toggleActivaCategoria, eliminarCategoria } from "./actions";
import Badge from "@/components/ui/Badge";

export default async function CategoriasPage() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { resultados: true } } },
  });

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Categorías</h1>
      <p className="text-slate-500 text-sm mb-6">
        Gestioná las categorías de competición de la liga.
      </p>

      {/* Formulario nueva categoría */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Agregar categoría</h2>
        <form action={crearCategoria} className="flex flex-col sm:flex-row gap-3">
          <input
            name="nombre"
            required
            placeholder="Nombre (ej: Recurvo Caballero)"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            name="descripcion"
            placeholder="Descripción (opcional)"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors whitespace-nowrap"
          >
            + Agregar
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {categorias.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            No hay categorías. Agregá la primera.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descripción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categorias.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{cat.nombre}</td>
                  <td className="px-4 py-3 text-slate-500">{cat.descripcion ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variante={cat.activa ? "activo" : "inactivo"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <ToggleActivaButton id={cat.id} activa={cat.activa} />
                      {cat._count.resultados === 0 && (
                        <EliminarButton id={cat.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ToggleActivaButton({ id, activa }: { id: number; activa: boolean }) {
  const action = toggleActivaCategoria.bind(null, id, !activa);
  return (
    <form action={action} className="inline">
      <button type="submit" className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors">
        {activa ? "Desactivar" : "Activar"}
      </button>
    </form>
  );
}

function EliminarButton({ id }: { id: number }) {
  const action = eliminarCategoria.bind(null, id);
  return (
    <form action={action} className="inline">
      <button type="submit" className="text-xs text-red-500 hover:text-red-700 underline transition-colors">
        Eliminar
      </button>
    </form>
  );
}
