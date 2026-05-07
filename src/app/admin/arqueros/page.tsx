import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { toggleActivoArquero } from "./actions";
import { nombreCompleto } from "@/lib/scoring";

type Props = {
  searchParams: { buscar?: string; categoria?: string; estado?: string };
};

export default async function ArquerosPage({ searchParams }: Props) {
  const { buscar, categoria, estado } = searchParams;

  const arqueros = await prisma.arquero.findMany({
    where: {
      AND: [
        buscar
          ? {
              OR: [
                { nombre:   { contains: buscar } },
                { apellido: { contains: buscar } },
                { dni:      { contains: buscar } },
              ],
            }
          : {},
        categoria ? { categoriaId: Number(categoria) } : {},
        estado === "activo"   ? { activo: true }  :
        estado === "inactivo" ? { activo: false }  : {},
      ],
    },
    include: { categoria: true },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
  });

  const categorias = await prisma.categoria.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Arqueros</h1>
          <p className="text-slate-500 text-sm mt-0.5">{arqueros.length} resultados</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/arqueros/importar"
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white text-slate-700 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            ↑ Importar Excel
          </Link>
          <Link
            href="/admin/arqueros/nuevo"
            className="inline-flex items-center gap-1.5 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            + Nuevo arquero
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <form method="GET" className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3">
        <input
          name="buscar"
          defaultValue={buscar}
          placeholder="Buscar por nombre o DNI..."
          className="flex-1 min-w-48 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          name="categoria"
          defaultValue={categoria ?? ""}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select
          name="estado"
          defaultValue={estado ?? ""}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <button
          type="submit"
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          Filtrar
        </button>
        {(buscar || categoria || estado) && (
          <Link
            href="/admin/arqueros"
            className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            Limpiar
          </Link>
        )}
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {arqueros.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">
            No se encontraron arqueros.{" "}
            <Link href="/admin/arqueros/nuevo" className="text-green-700 underline">
              Creá el primero
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">DNI</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">País</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {arqueros.map((arq) => (
                  <tr key={arq.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/arqueros/${arq.id}`} className="font-medium text-slate-800 hover:text-green-700">
                        {nombreCompleto(arq.nombre, arq.apellido)}
                      </Link>
                      <p className="text-xs text-slate-400">{arq.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{arq.dni}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{arq.categoria.nombre}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{arq.pais}</td>
                    <td className="px-4 py-3">
                      <Badge variante={arq.activo ? "activo" : "inactivo"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/arqueros/${arq.id}/editar`}
                          className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          Editar
                        </Link>
                        <ToggleActivoButton id={arq.id} activo={arq.activo} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleActivoButton({ id, activo }: { id: number; activo: boolean }) {
  const action = toggleActivoArquero.bind(null, id, !activo);
  return (
    <form action={action} className="inline">
      <button type="submit" className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors">
        {activo ? "Desactivar" : "Activar"}
      </button>
    </form>
  );
}
