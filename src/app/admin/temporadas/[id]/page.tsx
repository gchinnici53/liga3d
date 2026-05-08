import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import NuevoTorneoForm from "./NuevoTorneoForm";

type Props = { params: { id: string } };

export default async function DetalleTemporadaPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const temporada = await prisma.temporada.findUnique({
    where: { id },
    include: {
      torneos: { orderBy: { fecha: "asc" } },
    },
  });

  if (!temporada) notFound();

  const regulares = temporada.torneos.filter((t) => t.tipo === "REGULAR");
  const final     = temporada.torneos.find((t) => t.tipo === "FINAL");

  return (
    <div className="p-6 max-w-4xl">
      <Link href="/admin/temporadas" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Volver a temporadas
      </Link>

      <div className="flex items-center gap-3 mt-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{temporada.nombre}</h1>
        <Badge variante={temporada.estado === "ACTIVA" ? "abierta" : "cerrada"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Torneos */}
        <div className="lg:col-span-2 space-y-4">

          {/* Regulares */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">
                Torneos regulares
                <span className="ml-2 text-slate-400 font-normal">({regulares.length})</span>
              </h2>
            </div>
            {regulares.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">Sin torneos regulares.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Lugar</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {regulares.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{t.nombre}</td>
                      <td className="px-4 py-2.5 text-slate-600 hidden sm:table-cell">{t.lugar}</td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {new Date(t.fecha).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Link
                          href={`/admin/torneos/${t.id}`}
                          className="text-xs text-green-700 hover:underline"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Final */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">Torneo Final</h2>
            </div>
            {!final ? (
              <p className="text-slate-500 text-sm text-center py-6">Sin final cargada.</p>
            ) : (
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{final.nombre}</p>
                  <p className="text-xs text-slate-400">
                    {final.lugar} · {new Date(final.fecha).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <Link href={`/admin/torneos/${final.id}`} className="text-xs text-green-700 hover:underline">
                  Ver →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Form nuevo torneo */}
        <div>
          <NuevoTorneoForm temporadaId={temporada.id} />
        </div>
      </div>
    </div>
  );
}
