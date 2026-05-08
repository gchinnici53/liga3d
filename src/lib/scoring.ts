import type { TipoTorneo } from "@/types/enums";

// Tabla fija de puntos base por posición
const PUNTOS_BASE: Record<number, number> = {
  1: 18,
  2: 16,
  3: 15,
  4: 12,
  5: 11,
  6: 10,
  7: 9,
  8: 8,
};

const PUNTOS_RESTO = 7;

// En la Final los puntos se duplican
export function calcularPuntosTemporada(
  posicion: number,
  tipo: TipoTorneo = "REGULAR"
): number {
  const base = PUNTOS_BASE[posicion] ?? PUNTOS_RESTO;
  return tipo === "FINAL" ? base * 2 : base;
}

export function esMedallista(posicion: number): boolean {
  return posicion >= 1 && posicion <= 4;
}

// Etiqueta de posición para mostrar en UI
export function etiquetaPosicion(posicion: number): string {
  const etiquetas: Record<number, string> = {
    1: "Oro",
    2: "Plata",
    3: "Bronce",
    4: "4°",
  };
  return etiquetas[posicion] ?? `${posicion}°`;
}

// Nombre completo del arquero (calculado, no almacenado)
export function nombreCompleto(nombre: string, apellido: string): string {
  return `${nombre} ${apellido}`;
}

// Mes de nacimiento para saludos (1-12)
export function mesNacimiento(fechaNacimiento: Date): number {
  return fechaNacimiento.getMonth() + 1;
}

// ─── Cálculo de puntos de temporada ──────────────────────
// Solo los 2 mejores puntajes de torneos REGULAR + el puntaje de la FINAL.
// Los puntos ya vienen calculados (con el x2 de la final incluido).

type ResultadoParaRanking = {
  puntosTemporada: number;
  tipoTorneo: TipoTorneo;
};

export function calcularTotalTemporada(resultados: ResultadoParaRanking[]): number {
  const regulares = resultados
    .filter((r) => r.tipoTorneo === "REGULAR")
    .map((r) => r.puntosTemporada)
    .sort((a, b) => b - a)
    .slice(0, 2);

  const final = resultados
    .filter((r) => r.tipoTorneo === "FINAL")
    .reduce((sum, r) => sum + r.puntosTemporada, 0);

  return regulares.reduce((sum, p) => sum + p, 0) + final;
}

// Un arquero califica como campeón si tiró al menos 2 REGULAR + la FINAL
export function calificaParaCampeon(resultados: ResultadoParaRanking[]): boolean {
  const regulares = resultados.filter((r) => r.tipoTorneo === "REGULAR").length;
  const tiroFinal = resultados.some((r) => r.tipoTorneo === "FINAL");
  return regulares >= 2 && tiroFinal;
}
