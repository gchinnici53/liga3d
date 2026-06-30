import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

export default async function TorneosPage() {
  const torneos = await prisma.torneo.findMany({
    orderBy: [{ fecha: "desc" }],
    include: {
      temporada: true,
      _count: { select: { resultados: true, inscripciones: true } },
    },
  });

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Torneos</h1>
      <p className="text-slate-500 text-sm mb-6">Todos los torneos registrados</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {torneos.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">No hay torneos.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Torneo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Temporada</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Fecha</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Inscriptos</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Afiche</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {torneos.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{t.nombre}</span>
                      <Badge variante={t.tipo === "FINAL" ? "final" : "regular"} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{t.lugar}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600 hidden sm:table-cell">{t.temporada.nombre}</td>
                  <td className="px-5 py-3 text-slate-600 hidden md:table-cell">
                    {new Date(t.fecha).toLocaleDateString("es-AR")}
                    {t.horario && <span className="text-slate-400 ml-1">· {t.horario}</span>}
                  </td>
                  <td className="px-5 py-3 text-center hidden md:table-cell">
                    <span className={t._count.inscripciones > 0 ? "text-green-700 font-semibold" : "text-slate-300"}>
                      {t._count.inscripciones}
                    </span>
                    <span className="text-slate-300 text-xs">/{t.maxInscriptos}</span>
                  </td>
                  <td className="px-5 py-3 text-center hidden sm:table-cell">
                    {t.afiche
                      ? <span className="text-green-600 text-xs font-medium">✓</span>
                      : <span className="text-slate-300 text-xs">—</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/torneos/${t.id}`}
                      className="text-xs text-green-700 hover:text-green-900 font-medium border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Editar
                    </Link>
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
