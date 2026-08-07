import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import CargarManualCliente from "./CargarManualCliente";

type Props = { params: { id: string } };

// Una fila inicial para el cliente: puede venir de un Resultado ya cargado
// (valores pre-llenados) o de una Inscripción sin resultado todavía (vacía).
export type FilaInicial = {
  resultadoId:    number | null;   // si ya existe un Resultado en la DB
  arqueroId:      number | null;
  arqueroLabel:   string | null;   // "Apellido, Nombre" del arquero en DB
  inscriptoLabel: string | null;   // "Apellido, Nombre" tal como vino en la inscripción
  posicion:       number | null;
  puntajeRonda1:  number | null;
  puntajeRonda2:  number | null;
};

export default async function CargarResultadosPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const [torneo, categorias, arqueros] = await Promise.all([
    prisma.torneo.findUnique({
      where: { id },
      include: {
        temporada: true,
        inscripciones: {
          select: { id: true, nombre: true, apellido: true, dni: true, categoria: true },
          orderBy: [{ categoria: "asc" }, { apellido: "asc" }, { nombre: "asc" }],
        },
        resultados: {
          include: { arquero: true, categoria: true },
          orderBy: [{ categoria: { nombre: "asc" } }, { posicion: "asc" }],
        },
      },
    }),
    prisma.categoria.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
    prisma.arquero.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, apellido: true, dni: true },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    }),
  ]);

  if (!torneo) notFound();

  // Índice para auto-match inscripción → arquero
  const porDni    = new Map(arqueros.filter((a) => a.dni).map((a) => [a.dni!.trim(), a]));
  const porNombre = new Map(
    arqueros.map((a) => [`${a.apellido.toLowerCase().trim()}|${a.nombre.toLowerCase().trim()}`, a])
  );

  // ── Resultados ya cargados, agrupados por categoría ──────
  const resultadosPorCat: Record<string, FilaInicial[]> = {};
  const arqueroConResultadoEnCat: Record<string, Set<number>> = {}; // cat → Set<arqueroId>

  for (const r of torneo.resultados) {
    const cat = r.categoria.nombre;
    if (!resultadosPorCat[cat]) {
      resultadosPorCat[cat] = [];
      arqueroConResultadoEnCat[cat] = new Set();
    }
    resultadosPorCat[cat].push({
      resultadoId:    r.id,
      arqueroId:      r.arqueroId,
      arqueroLabel:   `${r.arquero.apellido}, ${r.arquero.nombre}`,
      inscriptoLabel: null,
      posicion:       r.posicion,
      puntajeRonda1:  r.puntajeRonda1,
      puntajeRonda2:  r.puntajeRonda2,
    });
    arqueroConResultadoEnCat[cat].add(r.arqueroId);
  }

  // ── Inscripciones sin resultado todavía ─────────────────
  for (const insc of torneo.inscripciones) {
    const cat = insc.categoria;

    const matched =
      (insc.dni ? porDni.get(insc.dni.trim()) : undefined) ??
      porNombre.get(`${insc.apellido.toLowerCase().trim()}|${insc.nombre.toLowerCase().trim()}`) ??
      null;

    // Si el arquero ya tiene resultado en esta categoría, no duplicar
    if (matched && arqueroConResultadoEnCat[cat]?.has(matched.id)) continue;

    if (!resultadosPorCat[cat]) resultadosPorCat[cat] = [];

    resultadosPorCat[cat].push({
      resultadoId:    null,
      arqueroId:      matched?.id ?? null,
      arqueroLabel:   matched ? `${matched.apellido}, ${matched.nombre}` : null,
      inscriptoLabel: `${insc.apellido}, ${insc.nombre}`,
      posicion:       null,
      puntajeRonda1:  null,
      puntajeRonda2:  null,
    });
  }

  const categoriasConDatos = Object.keys(resultadosPorCat);

  return (
    <div className="p-6 max-w-5xl">
      <Link href={`/admin/torneos/${id}`} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Volver a {torneo.nombre}
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mt-2 mb-1">Cargar resultados</h1>
      <p className="text-slate-500 text-sm mb-6">
        {torneo.nombre} · {torneo.temporada.nombre} ·{" "}
        <span className={torneo.tipo === "FINAL" ? "text-amber-700 font-semibold" : "text-slate-400"}>
          {torneo.tipo === "FINAL" ? "Final (pts ×2)" : "Torneo regular"}
        </span>
      </p>

      <CargarManualCliente
        torneoId={id}
        tipoTorneo={torneo.tipo}
        categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
        categoriasConDatos={categoriasConDatos}
        filasPorCategoria={resultadosPorCat}
        arqueros={arqueros.map((a) => ({ id: a.id, nombre: a.nombre, apellido: a.apellido }))}
      />
    </div>
  );
}
