import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { etiquetaPosicion } from "@/lib/scoring";
import GraficoResultados from "./GraficoResultados";
import type { Metadata } from "next";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await prisma.arquero.findUnique({ where: { id: Number(params.id) } });
  return { title: a ? `${a.nombre} ${a.apellido} — Liga 3D` : "Arquero" };
}

export default async function FichaArqueroPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const arquero = await prisma.arquero.findUnique({
    where: { id },
    include: {
      resultados: {
        include: {
          torneo:    { include: { temporada: true } },
          categoria: true,
        },
        orderBy: { torneo: { fecha: "desc" } },
      },
    },
  });

  if (!arquero || !arquero.activo) notFound();

  const totalTorneos  = arquero.resultados.length;
  const categorias    = Array.from(new Set(arquero.resultados.map((r) => r.categoria.nombre))).join(", ");
  const mejorPuntaje  = arquero.resultados.length > 0
    ? Math.max(...arquero.resultados.map((r) => r.puntajeTotal))
    : 0;

  // Datos para el gráfico (orden cronológico)
  const puntosGrafico = [...arquero.resultados]
    .sort((a, b) => new Date(a.torneo.fecha).getTime() - new Date(b.torneo.fecha).getTime())
    .map((r) => ({
      label: r.torneo.nombre.replace(/torneo\s*/i, "").replace(/fecha\s*/i, "F").trim().slice(0, 6),
      valor: r.puntajeTotal,
      esFinal: r.torneo.tipo === "FINAL",
    }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/ranking" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Volver al ranking
      </Link>

      {/* Header */}
      <div className="flex items-center gap-6 mt-6 mb-8">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 shadow">
          {arquero.foto ? (
            <Image src={arquero.foto} alt={`${arquero.nombre} ${arquero.apellido}`} width={96} height={96} className="object-cover w-full h-full" />
          ) : (
            <span className="text-slate-400 font-bold text-3xl">
              {arquero.nombre[0]}{arquero.apellido[0]}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {arquero.nombre} {arquero.apellido}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{arquero.pais}</p>
          {categorias && <p className="text-slate-500 text-sm mt-0.5">{categorias}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{totalTorneos}</p>
          <p className="text-xs text-slate-400 mt-0.5">Torneos</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-liga">{mejorPuntaje}</p>
          <p className="text-xs text-slate-400 mt-0.5">Mejor puntaje</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {arquero.resultados.filter((r) => r.posicion === 1).length}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">1° puestos</p>
        </div>
      </div>

      {/* Gráfico */}
      {puntosGrafico.length >= 3 && (
        <div className="mb-8">
          <GraficoResultados puntos={puntosGrafico} />
        </div>
      )}

      {/* Historial */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Historial de torneos</h2>
        </div>
        {arquero.resultados.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Sin resultados todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Torneo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Cat.</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Puntaje</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Posición</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Pts temp.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {arquero.resultados.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{r.torneo.nombre}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(r.torneo.fecha).toLocaleDateString("es-AR")} · {r.torneo.temporada.nombre}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{r.categoria.nombre}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{r.puntajeTotal}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={r.esMedallista ? "font-semibold text-amber-600" : "text-slate-500"}>
                      {etiquetaPosicion(r.posicion)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-liga hidden sm:table-cell">
                    +{r.puntosTemporada}
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
