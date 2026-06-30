import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ResultadosTabs from "./ResultadosTabs";
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

  const categorias = Object.entries(porCategoria).map(([nombre, resultados]) => ({
    nombre,
    resultados: resultados.map((r) => ({
      id: r.id,
      posicion: r.posicion,
      esMedallista: r.esMedallista,
      puntajeTotal: r.puntajeTotal,
      puntosTemporada: r.puntosTemporada,
      arquero: { id: r.arquero.id, nombre: r.arquero.nombre, apellido: r.arquero.apellido },
    })),
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/calendario" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Volver al calendario
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">{torneo.nombre}</h1>
        <p className="text-slate-500 text-sm">
          {new Date(torneo.fecha).toLocaleDateString("es-AR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })}
          {torneo.lugar && ` · ${torneo.lugar}`}
          {` · ${torneo.temporada.nombre}`}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {torneo.resultados.length} participantes · {categorias.length} categorías
        </p>
      </div>

      <ResultadosTabs categorias={categorias} />
    </div>
  );
}
