// La estaca (color de blanco) depende de la categoría del arquero, no de la
// patrulla — por eso se calcula siempre a partir de la categoría en vez de
// guardarse a nivel patrulla (una patrulla puede terminar con arqueros de
// más de un color, por ejemplo tras mover gente entre patrullas).
export const ESTACA_POR_CATEGORIA: Record<string, string> = {
  CW: "ROJA",      CM: "ROJA",
  ESC: "AMARILLA", JUN: "AMARILLA",
  BW: "AZUL",      BM: "AZUL",
  TW: "AZUL",      TM: "AZUL",
  LW: "AZUL",      LM: "AZUL",
};

export function estacaDeCategoria(categoria: string): string {
  return ESTACA_POR_CATEGORIA[categoria] ?? "AZUL";
}
