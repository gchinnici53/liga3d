import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import LlavesAdmin from "./LlavesAdmin";
import type { BracketData } from "@/lib/bracket";

type Props = { params: { id: string } };

const CATEGORIAS_ORDEN = ["CM","CW","BM","BW","LM","LW","TM","TW","ESC","JUN"];

export default async function LlavesPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id },
    include: {
      temporada: true,
      resultados: {
        select: { categoriaId: true, categoria: { select: { nombre: true } } },
        distinct: ["categoriaId"],
      },
      eliminatorias: {
        include: { categoria: true },
      },
    },
  });
  if (!torneo) notFound();

  // Categorías con resultados cargados (son candidatas a tener llave)
  const categoriasConResultados = torneo.resultados
    .map((r) => ({ id: r.categoriaId, nombre: r.categoria.nombre }))
    .sort((a, b) => CATEGORIAS_ORDEN.indexOf(a.nombre) - CATEGORIAS_ORDEN.indexOf(b.nombre));

  // Conteo de resultados por categoría (para validar tamaño del bracket)
  const conteos = await prisma.resultado.groupBy({
    by: ["categoriaId"],
    where: { torneoId: id },
    _count: { id: true },
  });
  const conteoPorCat = new Map(conteos.map((c) => [c.categoriaId, c._count.id]));

  // Eliminatorias existentes
  const elimPorCat = new Map(
    torneo.eliminatorias.map((e) => [
      e.categoriaId,
      { id: e.id, tamano: e.tamano, bracket: JSON.parse(e.llave) as BracketData },
    ])
  );

  return (
    <div className="p-6 max-w-5xl">
      <Link href={`/admin/torneos/${id}`} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Volver a {torneo.nombre}
      </Link>
      <div className="flex items-center justify-between mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Llaves de eliminación</h1>
          <p className="text-slate-500 text-sm">{torneo.nombre} · {torneo.temporada.nombre}</p>
        </div>
        <Link
          href={`/llaves/${id}`}
          target="_blank"
          className="text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
        >
          Ver portal →
        </Link>
      </div>

      {categoriasConResultados.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
          Este torneo no tiene resultados de clasificación cargados todavía.
        </div>
      ) : (
        <LlavesAdmin
          torneoId={id}
          categorias={categoriasConResultados}
          conteoPorCat={Object.fromEntries(conteoPorCat)}
          elimPorCat={Object.fromEntries(
            Array.from(elimPorCat.entries()).map(([k, v]) => [k, v])
          )}
        />
      )}
    </div>
  );
}
