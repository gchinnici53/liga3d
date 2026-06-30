import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { etiquetaPosicion } from "@/lib/scoring";
import type { Metadata } from "next";

type Props = { params: { torneoId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const torneo = await prisma.torneo.findUnique({ where: { id: Number(params.torneoId) } });
  return { title: torneo ? `Resultados — ${torneo.nombre}` : "Resultados" };
}

export default async function ResultadosTorneoPage({ params }: Props) {
  const torneoId = Number(params.torneoId);
  if (isNaN(torneoId)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: {
      temporada: true,
      resultados: {
        include: { arquero: true, categoria: true },
        orderBy: [{ categoria: { nombre: "asc" } }, { posicion: "asc" }],
      },
    },
  });

  if (!torneo) notFound();
  if (torneo.resultados.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🏹</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{torneo.nombre}</h1>
        <p className="text-slate-500 mb-6">Los resultados aún no están disponibles.</p>
        <Link href="/calendario" className="text-liga hover:underline text-sm">← Volver al calendario</Link>
      </div>
    );
  }

  // Agrupar por categoría
  const porCategoria = torneo.resultados.reduce<Record<string, typeof torneo.resultados>>(
    (acc, r) => {
      const key = r.categoria.nombre;
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {}
  );

  const MEDALLA: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉", 4: "🏅" };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/calendario" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Volver al calendario
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">{torneo.nombre}</h1>
        <p className="text-slate-500 text-sm">
          {new Date(torneo.fecha).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {torneo.lugar && ` · ${torneo.lugar}`}
          {" · "}{torneo.temporada.nombre}
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(porCategoria).map(([categoria, resultados]) => (
          <div key={categoria} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <span className="font-bold text-slate-700">{categoria}</span>
              <span className="text-slate-400 text-sm ml-2">· {resultados.length} arqueros</span>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {resultados.map((r) => (
                  <tr key={r.id} className={r.esMedallista ? "bg-amber-50/50" : "hover:bg-slate-50"}>
                    <td className="px-4 py-3 w-10 font-semibold text-slate-500">
                      {MEDALLA[r.posicion] ?? `${r.posicion}°`}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {r.arquero.nombre} {r.arquero.apellido}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 hidden sm:table-cell">
                      {r.puntajeTotal} pts
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-liga">
                      +{r.puntosTemporada}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
