// Valores válidos para los campos String del schema de Prisma (SQLite no soporta enums nativos)

export type Rol = "ADMIN" | "CARGA" | "INVITADO" | "ARQUERO";
export type Sexo = "MASCULINO" | "FEMENINO";
export type EstadoTemporada = "ACTIVA" | "CERRADA";
export type TipoTorneo = "REGULAR" | "FINAL";

export const ROL_VALUES: Rol[] = ["ADMIN", "CARGA", "INVITADO", "ARQUERO"];
export const SEXO_VALUES: Sexo[] = ["MASCULINO", "FEMENINO"];
export const ESTADO_TEMPORADA_VALUES: EstadoTemporada[] = ["ACTIVA", "CERRADA"];
export const TIPO_TORNEO_VALUES: TipoTorneo[] = ["REGULAR", "FINAL"];
