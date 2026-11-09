import { prisma } from "@/lib/prisma";
import { PREFIJO_TIPO_ARCO, type TipoArco, type TipoTorneo } from "@/types/enums";

export const TIPO_ARCO_LABEL: Record<TipoArco, string> = {
  COMPUESTO: "Compuesto",
  RASO: "Raso",
  LONGBOW: "Longbow",
  TRADICIONAL: "Tradicional",
};

export type MiembroEquipoInfo = {
  id: number;
  nombre: string;
  apellido: string;
  sexo: string;
  torneosRegulares: number;
  tiroFinal: boolean;
  califica: boolean;
  total: number;
};

export type EquipoRanking = {
  id: number;
  nombre: string;
  tipoArco: TipoArco;
  miembros: MiembroEquipoInfo[];
  total: number;
  califica: boolean;
};

// Un arquero califica si tiró al menos 2 torneos REGULAR + la FINAL en la
// categoría que le corresponde dentro del tipo de arco del equipo.
function calificaMiembro(torneosRegulares: number, tiroFinal: boolean): boolean {
  return torneosRegulares >= 2 && tiroFinal;
}

export async function calcularRankingEquipos(temporadaId: number): Promise<EquipoRanking[]> {
  const equipos = await prisma.equipo.findMany({
    where: { temporadaId },
    include: { miembros: { include: { arquero: true } } },
    orderBy: { nombre: "asc" },
  });

  if (equipos.length === 0) return [];

  const arqueroIds = Array.from(
    new Set(equipos.flatMap((e) => e.miembros.map((m) => m.arqueroId)))
  );

  // Puntaje de tirada (puntajeTotal), no los puntos de campeonato.
  const resultados = await prisma.resultado.findMany({
    where: { arqueroId: { in: arqueroIds }, torneo: { temporadaId } },
    select: {
      arqueroId: true,
      puntajeTotal: true,
      torneoId: true,
      torneo: { select: { tipo: true } },
      categoria: { select: { nombre: true } },
    },
  });

  // arqueroId -> categoriaNombre -> lista de resultados
  const porArquero = new Map<
    number,
    { categoriaNombre: string; torneoId: number; tipo: TipoTorneo; puntajeTotal: number }[]
  >();
  for (const r of resultados) {
    if (!porArquero.has(r.arqueroId)) porArquero.set(r.arqueroId, []);
    porArquero.get(r.arqueroId)!.push({
      categoriaNombre: r.categoria.nombre,
      torneoId: r.torneoId,
      tipo: r.torneo.tipo as TipoTorneo,
      puntajeTotal: r.puntajeTotal,
    });
  }

  return equipos.map((equipo) => {
    const tipoArco = equipo.tipoArco as TipoArco;
    const prefijo = PREFIJO_TIPO_ARCO[tipoArco];
    const categoriasValidas = new Set([`${prefijo}M`, `${prefijo}W`]);

    const miembrosInfo: MiembroEquipoInfo[] = equipo.miembros.map((m) => {
      const resultadosMiembro = (porArquero.get(m.arqueroId) ?? []).filter((r) =>
        categoriasValidas.has(r.categoriaNombre)
      );

      // Mismo criterio que el ranking individual: 2 mejores puntajes de
      // tirada entre los torneos regulares + el puntaje de tirada de la final.
      const mejoresRegulares = resultadosMiembro
        .filter((r) => r.tipo === "REGULAR")
        .map((r) => r.puntajeTotal)
        .sort((a, b) => b - a)
        .slice(0, 2);
      const puntajeFinal = resultadosMiembro
        .filter((r) => r.tipo === "FINAL")
        .reduce((sum, r) => sum + r.puntajeTotal, 0);

      const torneosRegulares = resultadosMiembro.filter((r) => r.tipo === "REGULAR").length;
      const tiroFinal = resultadosMiembro.some((r) => r.tipo === "FINAL");

      return {
        id: m.arquero.id,
        nombre: m.arquero.nombre,
        apellido: m.arquero.apellido,
        sexo: m.arquero.sexo,
        torneosRegulares,
        tiroFinal,
        califica: calificaMiembro(torneosRegulares, tiroFinal),
        total: mejoresRegulares.reduce((sum, p) => sum + p, 0) + puntajeFinal,
      };
    });

    const total = miembrosInfo.reduce((sum, m) => sum + m.total, 0);
    const califica = miembrosInfo.every((m) => m.califica);

    return {
      id: equipo.id,
      nombre: equipo.nombre,
      tipoArco,
      miembros: miembrosInfo,
      total,
      califica,
    };
  });
}

export async function listarArquerosParaEquipo() {
  return prisma.arquero.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, apellido: true, sexo: true },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
  });
}
