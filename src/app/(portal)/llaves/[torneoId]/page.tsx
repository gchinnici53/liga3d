import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { rondaNombre } from "@/lib/bracket";
import type { BracketData, PartidoLlave, Contendiente } from "@/lib/bracket";

export const dynamic = "force-dynamic";

type Props = { params: { torneoId: string } };

const CATEGORIAS_ORDEN = ["CM","CW","BM","BW","LM","LW","TM","TW","ESC","JUN"];

export default async function LlavesPortalPage({ params }: Props) {
  const torneoId = Number(params.torneoId);
  if (isNaN(torneoId)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: {
      temporada: true,
      eliminatorias: { include: { categoria: true } },
    },
  });
  if (!torneo || torneo.eliminatorias.length === 0) notFound();

  const eliminatorias = torneo.eliminatorias.sort(
    (a, b) => CATEGORIAS_ORDEN.indexOf(a.categoria.nombre) - CATEGORIAS_ORDEN.indexOf(b.categoria.nombre)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/resultados/${torneoId}`} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Resultados
      </Link>
      <h1 className="text-3xl font-bold text-slate-800 mt-3 mb-1">Llaves de eliminación</h1>
      <p className="text-slate-500 text-sm mb-10">
        {torneo.nombre} · {torneo.temporada.nombre}
      </p>

      {eliminatorias.map((elim) => {
        const bracket = JSON.parse(elim.llave) as BracketData;
        const rondas  = Array.from(new Set(bracket.map((p) => p.ronda))).sort((a, b) => a - b);
        const maxRonda = Math.max(...rondas);

        return (
          <div key={elim.id} className="mb-12">
            <h2 className="text-lg font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
              Categoría {elim.categoria.nombre} — Top {elim.tamano}
            </h2>

            <div className="space-y-3">
              {rondas.map((ronda) => {
                const partidos = bracket.filter((p) => p.ronda === ronda).sort((a, b) => a.num - b.num);
                const normales = partidos.filter((p) => p.tipo === "normal");
                const finalP   = partidos.find((p) => p.tipo === "final");
                const bronceP  = partidos.find((p) => p.tipo === "bronce");

                return (
                  <div key={ronda} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {rondaNombre(ronda, maxRonda, elim.tamano)}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {normales.map((p) => <FilaPartido key={p.id} partido={p} />)}
                      {finalP  && <FilaPartido partido={finalP}  label="🥇 Final" />}
                      {bronceP && <FilaPartido partido={bronceP} label="🥉 Bronce" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FilaPartido({ partido, label }: { partido: PartidoLlave; label?: string }) {
  const { a1, a2, ganadorId } = partido;

  function slot(c: Contendiente | null, esGanador: boolean) {
    if (!c) return <span className="text-sm text-slate-300 italic">Pendiente</span>;
    return (
      <span className={["text-sm", esGanador ? "font-bold text-green-700" : "text-slate-700"].join(" ")}>
        <span className="text-xs text-slate-400 mr-1">{c.seed}.</span>
        {c.apellido}, {c.nombre}
        {esGanador && <span className="ml-1">🏆</span>}
      </span>
    );
  }

  return (
    <div className="px-5 py-3 flex items-center gap-3 flex-wrap">
      {label && <span className="text-xs font-semibold text-slate-400 w-14 shrink-0">{label}</span>}
      <div className="flex-1 min-w-[140px]">
        {slot(a1, ganadorId === a1?.arqueroId && ganadorId !== null)}
      </div>
      <span className="text-slate-300 text-sm font-bold">vs</span>
      <div className="flex-1 min-w-[140px]">
        {slot(a2, ganadorId === a2?.arqueroId && ganadorId !== null)}
      </div>
      {!ganadorId && !!a1 && !!a2 && (
        <span className="text-xs text-slate-300 italic">por jugarse</span>
      )}
    </div>
  );
}
