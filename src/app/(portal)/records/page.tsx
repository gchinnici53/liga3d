import Link from "next/link";
import type { Metadata } from "next";
import {
  calcularRecordsPorCategoria,
  listarPasesDeCategoriaEscuela,
  CATEGORIAS_RECORD,
  PASE_CATEGORIA_ESC,
} from "@/lib/records";

export const metadata: Metadata = { title: "Récords — Liga 3D" };

const NOMBRE_CATEGORIA: Record<string, string> = {
  CM: "Compuesto M",
  CW: "Compuesto W",
  BM: "Barebow M",
  BW: "Barebow W",
  LM: "Longbow M",
  LW: "Longbow W",
  TM: "Tradicional M",
  TW: "Tradicional W",
};

export default async function RecordsPage() {
  const [recordsPorCategoria, pasesEscuela] = await Promise.all([
    calcularRecordsPorCategoria(),
    listarPasesDeCategoriaEscuela(),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-horta text-4xl text-slate-800 mb-2">Récords</h1>
      <p className="text-slate-500 text-sm mb-8">
        Mejor puntaje de una ronda por categoría, de toda la historia de la liga
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {CATEGORIAS_RECORD.map((cat) => {
          const record = recordsPorCategoria.get(cat);
          return (
            <div key={cat} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{NOMBRE_CATEGORIA[cat] ?? cat}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat}</span>
              </div>
              {!record ? (
                <p className="text-sm text-slate-400 italic p-4">Sin datos todavía</p>
              ) : (
                <div className="p-4 flex items-center gap-4">
                  <p className="text-3xl font-bold text-liga leading-none shrink-0">{record.puntaje}</p>
                  <div className="min-w-0">
                    <Link
                      href={`/arqueros/${record.arquero.id}`}
                      className="block font-semibold text-slate-800 hover:text-liga transition-colors truncate"
                    >
                      {record.arquero.nombre} {record.arquero.apellido}
                    </Link>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {record.torneo.nombre} ·{" "}
                      {new Date(record.torneo.fecha).toLocaleDateString("es-AR", { year: "numeric", timeZone: "UTC" })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="font-horta text-2xl text-slate-800 mb-1">
        Pases de categoría — Escuela
      </h2>
      <p className="text-slate-500 text-sm mb-4">
        Arqueros que llegaron a {PASE_CATEGORIA_ESC} puntos o más en una ronda ({pasesEscuela.length})
      </p>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {pasesEscuela.length === 0 ? (
          <p className="text-sm text-slate-400 text-center p-8">Todavía nadie llegó a {PASE_CATEGORIA_ESC} puntos.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pasesEscuela.map((p, i) => (
              <li key={p.arquero.id} className="px-4 py-3 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300 w-5 shrink-0">{i + 1}</span>
                <Link
                  href={`/arqueros/${p.arquero.id}`}
                  className="flex-1 text-sm text-slate-800 hover:text-liga font-medium truncate transition-colors"
                >
                  {p.arquero.nombre} {p.arquero.apellido}
                </Link>
                <span className="text-xs text-slate-400 shrink-0">{p.torneo.nombre}</span>
                <span className="text-sm font-bold text-liga shrink-0 w-10 text-right">{p.puntaje}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
