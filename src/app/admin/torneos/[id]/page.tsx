import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import EliminarTorneoButton from "./EliminarTorneoButton";
import SubirAfficheForm from "./SubirAfficheForm";
import EditarTorneoForm from "./EditarTorneoForm";
import EditarResultadoInline from "./EditarResultadoInline";

type Props = { params: { id: string } };

export default async function DetalleTorneoPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id },
    include: {
      temporada: true,
      _count: { select: { resultados: true } },
      resultados: {
        include: { categoria: true, arquero: true },
        orderBy: [{ categoria: { nombre: "asc" } }, { posicion: "asc" }],
      },
    },
  });

  if (!torneo) notFound();

  const tienResultados = torneo._count.resultados > 0;

  // Agrupar resultados por categoría
  const porCategoria = torneo.resultados.reduce<Record<string, typeof torneo.resultados>>((acc, r) => {
    const key = r.categoria.nombre;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl">
      <Link
        href={`/admin/temporadas/${torneo.temporadaId}`}
        className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        ← Volver a {torneo.temporada.nombre}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-3 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{torneo.nombre}</h1>
            <Badge variante={torneo.tipo === "FINAL" ? "final" : "regular"} />
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {torneo.lugar} · {new Date(torneo.fecha).toLocaleDateString("es-AR")} · {torneo.temporada.nombre}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/torneos/${torneo.id}/inscriptos`}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            👥 Ver inscriptos
          </Link>
          <Link
            href={`/admin/torneos/${torneo.id}/importar`}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            ↑ Importar resultados
          </Link>
          {!tienResultados && (
            <EliminarTorneoButton id={torneo.id} />
          )}
        </div>
      </div>

      {/* Editar datos del torneo */}
      <EditarTorneoForm torneo={torneo} />

      {/* Subir afiche */}
      <SubirAfficheForm torneoId={torneo.id} afficheActual={torneo.afiche} />

      {/* Resultados */}
      {!tienResultados ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          Este torneo no tiene resultados cargados todavía.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(porCategoria).map(([categoria, resultados]) => (
            <div key={categoria} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-700">{categoria}</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">Pos</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Arquero</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Puntaje</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pts temp.</th>
                    <th className="w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultados.map((r) => (
                    <EditarResultadoInline
                      key={r.id}
                      resultado={{
                        id: r.id,
                        posicion: r.posicion,
                        esMedallista: r.esMedallista,
                        puntajeTotal: r.puntajeTotal,
                        puntosTemporada: r.puntosTemporada,
                        arquero: { id: r.arqueroId, nombre: r.arquero.nombre, apellido: r.arquero.apellido },
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
