import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import CargarManualCliente from "./CargarManualCliente";

type Props = { params: { id: string } };

export type InscriptoConMatch = {
  inscripcionId: number;
  nombre: string;
  apellido: string;
  arqueroId: number | null;
  arqueroLabel: string | null;
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
  const porDni     = new Map(arqueros.filter((a) => a.dni).map((a) => [a.dni!.trim(), a]));
  const porNombre  = new Map(
    arqueros.map((a) => [`${a.apellido.toLowerCase().trim()}|${a.nombre.toLowerCase().trim()}`, a])
  );

  // Agrupar inscripciones por categoría con match automático
  const inscriptosPorCategoria: Record<string, InscriptoConMatch[]> = {};
  for (const insc of torneo.inscripciones) {
    if (!inscriptosPorCategoria[insc.categoria]) inscriptosPorCategoria[insc.categoria] = [];

    const matched =
      (insc.dni ? porDni.get(insc.dni.trim()) : undefined) ??
      porNombre.get(`${insc.apellido.toLowerCase().trim()}|${insc.nombre.toLowerCase().trim()}`) ??
      null;

    inscriptosPorCategoria[insc.categoria].push({
      inscripcionId: insc.id,
      nombre:        insc.nombre,
      apellido:      insc.apellido,
      arqueroId:     matched?.id ?? null,
      arqueroLabel:  matched ? `${matched.apellido}, ${matched.nombre}` : null,
    });
  }

  const categoriasConInscriptos = Object.keys(inscriptosPorCategoria);

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
        categoriasConInscriptos={categoriasConInscriptos}
        inscriptosPorCategoria={inscriptosPorCategoria}
        arqueros={arqueros.map((a) => ({ id: a.id, nombre: a.nombre, apellido: a.apellido }))}
      />
    </div>
  );
}
