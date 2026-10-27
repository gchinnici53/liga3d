import { prisma } from "@/lib/prisma";

export const ZONAS_VITALES_MAX = 5;

export type UsoZona = {
  zonaVital: number;
  nombre: string;
  torneosUsada: number;
  vidaRestante: number | null;
};

export type DianaConUso = {
  id: number;
  nombre: string;
  cantidadZonas: number;
  nombresZonas: string | null;
  cantidad: number;
  costoCompra: number | null;
  vidaUtilUsosZona: number | null;
  activa: boolean;
  zonas: UsoZona[];
  costoPorUso: number | null;
};

// nombresZonas se guarda como JSON array de strings (una por zona). Si falta
// el nombre de una zona (o el campo entero), se muestra "Zona N".
export function parseNombresZonas(nombresZonas: string | null, cantidadZonas: number): string[] {
  let nombres: string[] = [];
  if (nombresZonas) {
    try {
      const parsed = JSON.parse(nombresZonas);
      if (Array.isArray(parsed)) nombres = parsed.map((n) => String(n ?? ""));
    } catch {
      nombres = [];
    }
  }
  return Array.from({ length: cantidadZonas }, (_, i) => nombres[i]?.trim() || `Zona ${i + 1}`);
}

// Nombres tal cual fueron guardados (sin fallback "Zona N"), para precargar
// un formulario de edición.
export function parseNombresZonasRaw(nombresZonas: string | null): string[] {
  if (!nombresZonas) return [];
  try {
    const parsed = JSON.parse(nombresZonas);
    return Array.isArray(parsed) ? parsed.map((n) => String(n ?? "")) : [];
  } catch {
    return [];
  }
}

export function serializarNombresZonas(nombres: string[]): string | null {
  const limpio = nombres.map((n) => n.trim());
  if (limpio.every((n) => n === "")) return null;
  return JSON.stringify(limpio);
}

// Cantidad de torneos distintos en los que se usó cada combinación
// diana+zona vital (nunca por tiro ni por arquero presente: el desgaste
// no es proporcional a eso en este club).
async function calcularUsoPorDianaYZona(): Promise<Map<string, number>> {
  const estaciones = await prisma.recorridoEstacion.findMany({
    select: { dianaId: true, zonaVital: true, recorridoId: true },
  });

  const recorridosPorClave = new Map<string, Set<number>>();
  for (const e of estaciones) {
    const clave = `${e.dianaId}-${e.zonaVital}`;
    if (!recorridosPorClave.has(clave)) recorridosPorClave.set(clave, new Set());
    recorridosPorClave.get(clave)!.add(e.recorridoId);
  }

  const usoPorClave = new Map<string, number>();
  for (const [clave, recorridos] of Array.from(recorridosPorClave.entries())) {
    usoPorClave.set(clave, recorridos.size);
  }
  return usoPorClave;
}

export async function listarDianasConUso(): Promise<DianaConUso[]> {
  const [dianas, usoPorClave] = await Promise.all([
    prisma.diana.findMany({ orderBy: { nombre: "asc" } }),
    calcularUsoPorDianaYZona(),
  ]);

  return dianas.map((d) => {
    const nombresZonas = parseNombresZonas(d.nombresZonas, d.cantidadZonas);
    const zonas: UsoZona[] = Array.from({ length: d.cantidadZonas }, (_, i) => i + 1).map((zonaVital) => {
      const torneosUsada = usoPorClave.get(`${d.id}-${zonaVital}`) ?? 0;
      const vidaRestante = d.vidaUtilUsosZona != null ? d.vidaUtilUsosZona - torneosUsada : null;
      return { zonaVital, nombre: nombresZonas[zonaVital - 1], torneosUsada, vidaRestante };
    });

    const costoPorUso =
      d.costoCompra != null && d.vidaUtilUsosZona
        ? d.costoCompra / (d.cantidadZonas * d.vidaUtilUsosZona)
        : null;

    return { ...d, zonas, costoPorUso };
  });
}

export async function obtenerUsoDianaZona(dianaId: number, zonaVital: number): Promise<number> {
  const usoPorClave = await calcularUsoPorDianaYZona();
  return usoPorClave.get(`${dianaId}-${zonaVital}`) ?? 0;
}
