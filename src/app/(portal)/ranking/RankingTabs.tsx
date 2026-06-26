"use client";

import { useState } from "react";
import Image from "next/image";

type ArqueroRanking = {
  id: number;
  nombre: string;
  apellido: string;
  foto: string | null;
  total: number;
  torneosRegulares: number;
  tiroFinal: boolean;
  califica: boolean;
};

type CategoriaRanking = {
  nombre: string;
  ranking: ArqueroRanking[];
  tieneCampeon: boolean;
};

const NOMBRE_CATEGORIA: Record<string, string> = {
  CM: "Compuesto M",
  CW: "Compuesto W",
  BM: "Barebow M",
  BW: "Barebow W",
  LM: "Longbow M",
  LW: "Longbow W",
  TM: "Tradicional M",
  TW: "Tradicional W",
  ESC: "Escuela",
  JUN: "Junior",
};

const MEDALLA: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default function RankingTabs({ categorias }: { categorias: CategoriaRanking[] }) {
  const [activa, setActiva] = useState(categorias[0]?.nombre ?? "CM");

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
          </button>
        ))}
      </div>

      {/* Nombre largo de la categoría */}
      <h2 className="text-lg font-bold text-slate-800 mb-4">
        {NOMBRE_CATEGORIA[activa] ?? activa}
      </h2>

      {/* Tabla de ranking */}
      {!categoria || categoria.ranking.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
          Sin resultados en esta categoría.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Arquero</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Regulares</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Final</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoria.ranking.map((arq, i) => {
                const pos = i + 1;
                return (
                  <tr key={arq.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-500">
                      {MEDALLA[pos] ?? pos}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {arq.foto ? (
                            <Image
                              src={arq.foto}
                              alt={`${arq.nombre} ${arq.apellido}`}
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-xs text-slate-400 font-bold">
                              {arq.nombre[0]}{arq.apellido[0]}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-slate-800">
                          {arq.nombre} {arq.apellido}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 hidden sm:table-cell">
                      {arq.torneosRegulares}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {arq.tiroFinal ? (
                        <span className="text-green-600 font-medium">Si</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-liga text-base">
                      {arq.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Leyenda */}
      <p className="text-xs text-slate-400 mt-4">
        Puntaje = mejores 2 torneos regulares + final (x2). {categoria?.tieneCampeon ? "Campeón: requiere 2 regulares + final." : ""}
      </p>
    </>
  );
}
