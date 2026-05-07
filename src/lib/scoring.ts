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
