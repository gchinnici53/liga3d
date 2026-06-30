"use client";

import { useState } from "react";

type Resultado = {
  id: number;
  posicion: number;
  esMedallista: boolean;
  puntajeTotal: number;
  puntosTemporada: number;
  arquero: { nombre: string; apellido: string };
};

type CategoriaResultados = {
  nombre: string;
  resultados: Resultado[];
};

const MEDALLA: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉", 4: "🏅" };

export default function ResultadosTabs({ categorias }: { categorias: CategoriaResultados[] }) {
  const [activa, setActiva] = useState(categorias[0]?.nombre ?? "");
  const categoria = categorias.find((c) => c.nombre === activa);

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categorias.map((cat) => (
          <button
            key={cat.nombre}
            onClick={() => setActiva(cat.nombre)}
            className={[
              "px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors shrink-0",
              activa === cat.nombre
                ? "bg-liga text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            {cat.nombre}
            <span className="ml-1 text-xs font-normal opacity-70">({cat.resultados.length})</span>
          </button>
        ))}
      </div>

      {/* Tabla de la categoría seleccionada */}
      {!categoria || categoria.resultados.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
          Sin resultados.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Arquero</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Puntaje</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Pts temp.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoria.resultados.map((r) => (
                <tr key={r.id} className={r.esMedallista ? "bg-amber-50/50" : "hover:bg-slate-50"}>
                  <td className="px-4 py-3 font-semibold text-slate-500">
                    {MEDALLA[r.posicion] ?? `${r.posicion}°`}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {r.arquero.nombre} {r.arquero.apellido}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 hidden sm:table-cell">
                    {r.puntajeTotal}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-liga">
                    +{r.puntosTemporada}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
