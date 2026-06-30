import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import EliminarTorneoButton from "./EliminarTorneoButton";
import EliminarResultadoButton from "./EliminarResultadoButton";
import SubirAfficheForm from "./SubirAfficheForm";
import { nombreCompleto } from "@/lib/scoring";

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
        <div className="flex gap-2">
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

      {/* Afiche y datos del calendario */}
      <SubirAfficheForm torneoId={torneo.id} afficheActual={torneo.afiche} />

      {/* Datos del calendario */}
      {(torneo.horario || torneo.direccion) && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {torneo.horario && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Horario</p>
              <p className="font-medium text-slate-800">{torneo.horario}</p>
            </div>
          )}
          {torneo.direccion && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Dirección</p>
              <p className="font-medium text-slate-800">{torneo.direccion}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Máx. inscriptos</p>
            <p className="font-medium text-slate-800">{torneo.maxInscriptos}</p>
          </div>
        </div>
      )}

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
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultados.map((r) => (
                    <tr key={r.id} className={r.esMedallista ? "bg-amber-50" : "hover:bg-slate-50"}>
                      <td className="px-4 py-2.5">
                        <MedallaPosicion posicion={r.posicion} />
                      </td>
                      <td className="px-4 py-2.5">
                        <Link href={`/admin/arqueros/${r.arqueroId}`} className="text-slate-800 hover:text-green-700">
                          {nombreCompleto(r.arquero.nombre, r.arquero.apellido)}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-800">{r.puntajeTotal}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-green-700">{r.puntosTemporada}</td>
                      <td className="px-2 py-2.5 text-center">
                        <EliminarResultadoButton id={r.id} />
                      </td>
                    </tr>
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

function MedallaPosicion({ posicion }: { posicion: number }) {
  if (posicion === 1) return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-white text-xs font-bold shadow-sm" title="Oro">
      🥇
    </span>
  );
  if (posicion === 2) return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-white text-xs font-bold shadow-sm" title="Plata">
      🥈
    </span>
  );
  if (posicion === 3) return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white text-xs font-bold shadow-sm" title="Bronce">
      🥉
    </span>
  );
  return <span className="text-sm font-semibold text-slate-500 px-1">{posicion}°</span>;
}
