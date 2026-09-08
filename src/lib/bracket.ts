// Lógica del bracket de eliminación por categoría

export type Contendiente = {
  arqueroId: number;
  seed: number;
  nombre: string;
  apellido: string;
};

export type SiguienteRef = {
  id: string;    // id del partido destino
  pos: 1 | 2;   // posición (a1 o a2)
};

export type PartidoLlave = {
  id: string;                   // "r1m1", "r2m3", etc.
  ronda: number;
  num: number;                  // número dentro de la ronda
  tipo: "normal" | "final" | "bronce";
  a1: Contendiente | null;
  a2: Contendiente | null;
  ganadorId: number | null;
  ganadorA: SiguienteRef | null;   // adónde va el ganador
  perdedorA: SiguienteRef | null;  // adónde va el perdedor (solo en SFs)
};

export type BracketData = PartidoLlave[];

// ── Generación del bracket ────────────────────────────────

export function generarBracket(
  tamano: 4 | 8 | 16 | 24,
  seedings: Contendiente[]
): BracketData {
  const p: BracketData = [];

  function slot(seed: number): Contendiente | null {
    return seedings.find((s) => s.seed === seed) ?? null;
  }

  function mk(
    id: string, ronda: number, num: number, tipo: "normal" | "final" | "bronce",
    s1: number | null, s2: number | null,
    ga: SiguienteRef | null, pa: SiguienteRef | null
  ): PartidoLlave {
    const a1 = s1 !== null ? slot(s1) : null;
    const a2 = s2 !== null ? slot(s2) : null;
    const match: PartidoLlave = { id, ronda, num, tipo, a1, a2, ganadorId: null, ganadorA: ga, perdedorA: pa };

    // Bye: se reservó un puesto de seed que no existe (no llegaron tantos clasificados)
    // y el rival sí está presente → pasa directo de ronda.
    const byeS1 = s1 !== null && a1 === null && a2 !== null;
    const byeS2 = s2 !== null && a2 === null && a1 !== null;
    if (byeS1 || byeS2) match.ganadorId = (byeS1 ? a2! : a1!).arqueroId;

    return match;
  }

  if (tamano === 4) {
    p.push(mk("r1m1", 1, 1, "normal", 1, 4, { id: "r2m1", pos: 1 }, { id: "r2m2", pos: 1 }));
    p.push(mk("r1m2", 1, 2, "normal", 2, 3, { id: "r2m1", pos: 2 }, { id: "r2m2", pos: 2 }));
    p.push(mk("r2m1", 2, 1, "final",  null, null, null, null));
    p.push(mk("r2m2", 2, 2, "bronce", null, null, null, null));

  } else if (tamano === 8) {
    // QF: 1v8, 2v7 en top-half; 3v6, 4v5 en bottom-half → semis separadas
    p.push(mk("r1m1", 1, 1, "normal", 1, 8, { id: "r2m1", pos: 1 }, null));
    p.push(mk("r1m2", 1, 2, "normal", 2, 7, { id: "r2m2", pos: 1 }, null));
    p.push(mk("r1m3", 1, 3, "normal", 3, 6, { id: "r2m2", pos: 2 }, null));
    p.push(mk("r1m4", 1, 4, "normal", 4, 5, { id: "r2m1", pos: 2 }, null));
    p.push(mk("r2m1", 2, 1, "normal", null, null, { id: "r3m1", pos: 1 }, { id: "r3m2", pos: 1 }));
    p.push(mk("r2m2", 2, 2, "normal", null, null, { id: "r3m1", pos: 2 }, { id: "r3m2", pos: 2 }));
    p.push(mk("r3m1", 3, 1, "final",  null, null, null, null));
    p.push(mk("r3m2", 3, 2, "bronce", null, null, null, null));

  } else if (tamano === 16) {
    // Los cruces aseguran que 1 y 2 solo se puedan encontrar en la final
    p.push(mk("r1m1", 1, 1, "normal",  1, 16, { id: "r2m1", pos: 1 }, null));
    p.push(mk("r1m2", 1, 2, "normal",  2, 15, { id: "r2m3", pos: 1 }, null));
    p.push(mk("r1m3", 1, 3, "normal",  3, 14, { id: "r2m4", pos: 1 }, null));
    p.push(mk("r1m4", 1, 4, "normal",  4, 13, { id: "r2m2", pos: 1 }, null));
    p.push(mk("r1m5", 1, 5, "normal",  5, 12, { id: "r2m2", pos: 2 }, null));
    p.push(mk("r1m6", 1, 6, "normal",  6, 11, { id: "r2m4", pos: 2 }, null));
    p.push(mk("r1m7", 1, 7, "normal",  7, 10, { id: "r2m3", pos: 2 }, null));
    p.push(mk("r1m8", 1, 8, "normal",  8,  9, { id: "r2m1", pos: 2 }, null));
    p.push(mk("r2m1", 2, 1, "normal", null, null, { id: "r3m1", pos: 1 }, null));
    p.push(mk("r2m2", 2, 2, "normal", null, null, { id: "r3m1", pos: 2 }, null));
    p.push(mk("r2m3", 2, 3, "normal", null, null, { id: "r3m2", pos: 1 }, null));
    p.push(mk("r2m4", 2, 4, "normal", null, null, { id: "r3m2", pos: 2 }, null));
    p.push(mk("r3m1", 3, 1, "normal", null, null, { id: "r4m1", pos: 1 }, { id: "r4m2", pos: 1 }));
    p.push(mk("r3m2", 3, 2, "normal", null, null, { id: "r4m1", pos: 2 }, { id: "r4m2", pos: 2 }));
    p.push(mk("r4m1", 4, 1, "final",  null, null, null, null));
    p.push(mk("r4m2", 4, 2, "bronce", null, null, null, null));

  } else { // 24
    // Ronda 1: seeds 9-24 (seeds 1-8 bye)
    p.push(mk("r1m1", 1, 1, "normal",  9, 24, { id: "r2m2", pos: 2 }, null));
    p.push(mk("r1m2", 1, 2, "normal", 10, 23, { id: "r2m7", pos: 2 }, null));
    p.push(mk("r1m3", 1, 3, "normal", 11, 22, { id: "r2m6", pos: 2 }, null));
    p.push(mk("r1m4", 1, 4, "normal", 12, 21, { id: "r2m3", pos: 2 }, null));
    p.push(mk("r1m5", 1, 5, "normal", 13, 20, { id: "r2m4", pos: 2 }, null));
    p.push(mk("r1m6", 1, 6, "normal", 14, 19, { id: "r2m5", pos: 2 }, null));
    p.push(mk("r1m7", 1, 7, "normal", 15, 18, { id: "r2m8", pos: 2 }, null));
    p.push(mk("r1m8", 1, 8, "normal", 16, 17, { id: "r2m1", pos: 2 }, null));
    // Ronda 2: seeds 1-8 ingresan (orden: 1,8,5,4,3,6,7,2 para separar 1 y 2 al final)
    p.push(mk("r2m1", 2, 1, "normal",  1, null, { id: "r3m1", pos: 1 }, null));
    p.push(mk("r2m2", 2, 2, "normal",  8, null, { id: "r3m1", pos: 2 }, null));
    p.push(mk("r2m3", 2, 3, "normal",  5, null, { id: "r3m2", pos: 1 }, null));
    p.push(mk("r2m4", 2, 4, "normal",  4, null, { id: "r3m2", pos: 2 }, null));
    p.push(mk("r2m5", 2, 5, "normal",  3, null, { id: "r3m3", pos: 1 }, null));
    p.push(mk("r2m6", 2, 6, "normal",  6, null, { id: "r3m3", pos: 2 }, null));
    p.push(mk("r2m7", 2, 7, "normal",  7, null, { id: "r3m4", pos: 1 }, null));
    p.push(mk("r2m8", 2, 8, "normal",  2, null, { id: "r3m4", pos: 2 }, null));
    // Cuartos
    p.push(mk("r3m1", 3, 1, "normal", null, null, { id: "r4m1", pos: 1 }, null));
    p.push(mk("r3m2", 3, 2, "normal", null, null, { id: "r4m1", pos: 2 }, null));
    p.push(mk("r3m3", 3, 3, "normal", null, null, { id: "r4m2", pos: 1 }, null));
    p.push(mk("r3m4", 3, 4, "normal", null, null, { id: "r4m2", pos: 2 }, null));
    // Semis
    p.push(mk("r4m1", 4, 1, "normal", null, null, { id: "r5m1", pos: 1 }, { id: "r5m2", pos: 1 }));
    p.push(mk("r4m2", 4, 2, "normal", null, null, { id: "r5m1", pos: 2 }, { id: "r5m2", pos: 2 }));
    // Final + Bronce
    p.push(mk("r5m1", 5, 1, "final",  null, null, null, null));
    p.push(mk("r5m2", 5, 2, "bronce", null, null, null, null));
  }

  // Propagar los byes detectados en mk() a la ronda siguiente. Una sola pasada
  // alcanza porque `p` se construye en orden de dependencia (ronda 1 antes que
  // ronda 2, etc.) y solo los partidos con seed directo pueden ser bye real
  // (nunca un partido "normal" a la espera de que se resuelva otro cruce).
  for (const m of p) {
    if (m.ganadorId === null) continue;
    const ganador = m.a1?.arqueroId === m.ganadorId ? m.a1 : m.a2;
    if (m.ganadorA) {
      const next = p.find((x) => x.id === m.ganadorA!.id);
      if (next) { if (m.ganadorA.pos === 1) next.a1 = ganador; else next.a2 = ganador; }
    }
  }

  return p;
}

// ── Registrar ganador de un partido ──────────────────────

function limpiarAguas(bracket: BracketData, matchId: string): void {
  const m = bracket.find((p) => p.id === matchId);
  if (!m) return;
  m.ganadorId = null;
  if (m.ganadorA) {
    const next = bracket.find((p) => p.id === m.ganadorA!.id);
    if (next) { if (m.ganadorA.pos === 1) next.a1 = null; else next.a2 = null; limpiarAguas(bracket, next.id); }
  }
  if (m.perdedorA) {
    const next = bracket.find((p) => p.id === m.perdedorA!.id);
    if (next) { if (m.perdedorA.pos === 1) next.a1 = null; else next.a2 = null; limpiarAguas(bracket, next.id); }
  }
}

export function registrarGanador(bracket: BracketData, matchId: string, ganadorId: number): BracketData {
  const updated: BracketData = bracket.map((p) => ({
    ...p,
    a1: p.a1 ? { ...p.a1 } : null,
    a2: p.a2 ? { ...p.a2 } : null,
  }));

  const match = updated.find((p) => p.id === matchId);
  if (!match || !match.a1 || !match.a2) return updated;

  // Si ya tenía ganador, limpiar lo que avanzó
  if (match.ganadorId !== null) limpiarAguas(updated, matchId);

  const ganador  = match.a1.arqueroId === ganadorId ? match.a1 : match.a2;
  const perdedor = match.a1.arqueroId === ganadorId ? match.a2 : match.a1;
  match.ganadorId = ganadorId;

  if (match.ganadorA) {
    const next = updated.find((p) => p.id === match.ganadorA!.id);
    if (next) { if (match.ganadorA.pos === 1) next.a1 = ganador; else next.a2 = ganador; }
  }
  if (match.perdedorA) {
    const next = updated.find((p) => p.id === match.perdedorA!.id);
    if (next) { if (match.perdedorA.pos === 1) next.a1 = perdedor; else next.a2 = perdedor; }
  }

  return updated;
}

// ── Helpers de display ───────────────────────────────────

export function rondaNombre(ronda: number, maxRonda: number, tamano: number): string {
  const offset = maxRonda - ronda;
  if (offset === 0) return "Final";
  if (offset === 1) return "Semifinales";
  if (offset === 2) return "Cuartos";
  if (tamano === 24 && ronda === 1) return "Primera ronda";
  return `Ronda ${ronda}`;
}

export function isBracketComplete(bracket: BracketData): boolean {
  return !!(
    bracket.find((p) => p.tipo === "final")?.ganadorId &&
    bracket.find((p) => p.tipo === "bronce")?.ganadorId
  );
}

// Retorna mapa arqueroId → posición final (1-4) basado en el bracket
export function posicionesFinales(bracket: BracketData): Map<number, number> {
  const pos = new Map<number, number>();
  const final  = bracket.find((p) => p.tipo === "final");
  const bronce = bracket.find((p) => p.tipo === "bronce");

  if (final?.ganadorId && final.a1 && final.a2) {
    pos.set(final.ganadorId, 1);
    pos.set(final.a1.arqueroId === final.ganadorId ? final.a2.arqueroId : final.a1.arqueroId, 2);
  }
  if (bronce?.ganadorId && bronce.a1 && bronce.a2) {
    pos.set(bronce.ganadorId, 3);
    pos.set(bronce.a1.arqueroId === bronce.ganadorId ? bronce.a2.arqueroId : bronce.a1.arqueroId, 4);
  }
  return pos;
}
