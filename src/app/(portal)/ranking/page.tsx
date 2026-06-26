import { prisma } from "@/lib/prisma";
import { calcularTotalTemporada, calificaParaCampeon } from "@/lib/scoring";
import type { TipoTorneo } from "@/types/enums";
import type { Metadata } from "next";
import RankingTabs from "./RankingTabs";

export const metadata: Metadata = {
  title: "Ranking — Liga 3D",
};

const TODAS_CATEGORIAS = ["CM", "CW", "BM", "BW", "LM", "LW", "TM", "TW", "ESC", "JUN"] as const;
const CATEGORIAS_CON_CAMPEON = ["CM", "CW", "BM", "BW", "LM", "LW", "TM", "TW"];

type ArqueroRanking = {
  id: number;
  nombre: string;
  apellido: string;
  foto: string | null;
  total: number;
  torneosRegulares: number;
  tiroFinal: boolean;
  califica: boolean;
};

type CategoriaRanking = {
  nombre: string;
  ranking: ArqueroRanking[];
  tieneCampeon: boolean;
};

export default async function RankingPage() {
  const temporadaActiva = await prisma.temporada.findFirst({
    where: { estado: "ACTIVA" },
    orderBy: { anio: "desc" },
  });

  if (!temporadaActiva) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Ranking</h1>
        <p className="text-slate-500">No hay temporada activa en este momento.</p>
      </div>
    );
  }

  const resultados = await prisma.resultado.findMany({
    where: {
      torneo: { temporadaId: temporadaActiva.id },
      categoria: { nombre: { in: [...TODAS_CATEGORIAS] } },
    },
    include: {
      arquero: { select: { id: true, nombre: true, apellido: true, foto: true } },
      torneo: { select: { tipo: true } },
      categoria: { select: { nombre: true } },
    },
  });

  const agrupado = new Map<
    string,
    Map<number, {
      arquero: { id: number; nombre: string; apellido: string; foto: string | null };
      res: { puntosTemporada: number; tipoTorneo: TipoTorneo }[];
    }>
  >();

  for (const r of resultados) {
    const cat = r.categoria.nombre;
    if (!agrupado.has(cat)) agrupado.set(cat, new Map());
    const porArquero = agrupado.get(cat)!;
    if (!porArquero.has(r.arqueroId)) {
      porArquero.set(r.arqueroId, { arquero: r.arquero, res: [] });
    }
    porArquero.get(r.arqueroId)!.res.push({
      puntosTemporada: r.puntosTemporada,
      tipoTorneo: r.torneo.tipo as TipoTorneo,
    });
  }

  const categorias: CategoriaRanking[] = TODAS_CATEGORIAS.map((cat) => {
    const porArquero = agrupado.get(cat);
    const tieneCampeon = CATEGORIAS_CON_CAMPEON.includes(cat);

    if (!porArquero) {
      return { nombre: cat, ranking: [], tieneCampeon };
    }

    const ranking = Array.from(porArquero.values())
      .map(({ arquero, res }) => {
        const torneosRegulares = res.filter((r) => r.tipoTorneo === "REGULAR").length;
        const tiroFinal = res.some((r) => r.tipoTorneo === "FINAL");
        return {
          id: arquero.id,
          nombre: arquero.nombre,
          apellido: arquero.apellido,
          foto: arquero.foto,
          total: calcularTotalTemporada(res),
          torneosRegulares,
          tiroFinal,
          califica: calificaParaCampeon(res),
        };
      })
      .sort((a, b) => b.total - a.total);

    return { nombre: cat, ranking, tieneCampeon };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-1">Ranking</h1>
      <p className="text-slate-500 text-sm mb-8">
        Temporada {temporadaActiva.nombre} — Top 2 regulares + final
      </p>

      <RankingTabs categorias={categorias} />
    </div>
  );
}
