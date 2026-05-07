import type {
  Arquero,
  Categoria,
  Temporada,
  Torneo,
  Resultado,
  User,
} from "@prisma/client";

export type { Arquero, Categoria, Temporada, Torneo, Resultado, User };
export * from "./enums";

// ─── Tipos con relaciones ──────────────────────────────────

export type ArqueroConCategoria = Arquero & {
  categoria: Categoria;
};

export type TorneoConTemporada = Torneo & {
  temporada: Temporada;
};

export type ResultadoCompleto = Resultado & {
  arquero: Arquero;
  torneo: Torneo;
  categoria: Categoria;
};

export type TemporadaConTorneos = Temporada & {
  torneos: Torneo[];
};

// ─── Ranking ───────────────────────────────────────────────

export type PosicionRanking = {
  arquero: ArqueroConCategoria;
  puntosTotales: number;
  torneosJugados: number;
  esCampeon?: boolean;
};

export type RankingCategoria = {
  categoria: Categoria;
  posiciones: PosicionRanking[];
};

// ─── Formularios ───────────────────────────────────────────

export type ArqueroFormData = {
  nombre: string;
  apellido: string;
  pais: string;
  dni: string;
  email?: string;
  telefono?: string;
  fechaNacimiento: string;
  sexo: "MASCULINO" | "FEMENINO";
  categoriaId: number;
  activo: boolean;
};

export type ResultadoFormData = {
  arqueroId: number;
  torneoId: number;
  categoriaId: number;
  puntajeRonda1?: number;
  puntajeRonda2?: number;
  puntajeTotal: number;
  posicion: number;
  esMedallista: boolean;
  puntosTemporada: number;
};

// ─── Importación Excel ────────────────────────────────────

// Fila tal como viene del Excel (nombres de columnas originales)
export type ExcelArqueroRow = {
  Nombre: string;
  Apellido: string;
  email?: string;
  tel?: string | number;
  DNI: string | number;
  "Fecha Nacimiento": string | number;
  pais?: string;
};

// Fila parseada y lista para crear en la DB (fechaNacimiento como ISO string para serialización)
export type ArqueroImportRow = {
  nombre: string;
  apellido: string;
  pais: string;
  dni: string;
  email?: string;
  telefono?: string;
  fechaNacimientoISO: string; // ISO 8601, se convierte a Date al insertar
};
