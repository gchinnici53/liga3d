"use client";

import { useState } from "react";
import Image from "next/image";

type Campeon = {
  arquero: { id: number; nombre: string; apellido: string; foto: string | null };
  total: number;
} | null;

type Temporada = {
  id: number;
  nombre: string;
  anio: number;
  campeones: Record<string, Campeon>;
};

const CATEGORIAS = ["CM", "CW", "BM", "BW", "LM", "LW", "TM", "TW"] as const;

const NOMBRE_CAT: Record<string, string> = {
  CM: "Compuesto M", CW: "Compuesto W",
  BM: "Barebow M",   BW: "Barebow W",
  LM: "Longbow M",  LW: "Longbow W",
  TM: "Tradicional M", TW: "Tradicional W",
};

function Avatar({ foto, nombre }: { foto: string | null; nombre: string }) {
  if (foto) {
    return (
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg mx-auto">
        <Image src={foto} alt={nombre} width={96} height={96} className="object-cover w-full h-full" />
      </div>
    );
  }
  const iniciales = nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
  return (
    <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center shadow mx-auto">
      <span className="text-slate-500 font-bold text-2xl">{iniciales || "?"}</span>
    </div>
  );
}

export default function CampeonesTabs({ temporadas }: { temporadas: Temporada[] }) {
  const [activa, setActiva] = useState(temporadas[0]?.id ?? 0);
  const temporada = temporadas.find((t) => t.id === activa);

  if (temporadas.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        Aún no hay temporadas cerradas con campeones.
      </div>
    );
  }

  return (
    <>
      {/* Tabs de temporada */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-10 scrollbar-hide">
        {temporadas.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiva(t.id)}
            className={[
              "px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors shrink-0",
              activa === t.id
                ? "bg-liga text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            {t.nombre}
          </button>
        ))}
      </div>

      {temporada && (
        <>
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="text-4xl">🏆</span>
            <h2 className="font-horta text-3xl text-slate-800">Campeones {temporada.anio}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIAS.map((cat) => {
              const campeon = temporada.campeones[cat];
              return (
                <div
                  key={cat}
                  className={[
                    "rounded-2xl border p-5 flex flex-col items-center text-center gap-3",
                    campeon
                      ? "bg-white border-amber-200 shadow-sm"
                      : "bg-slate-50 border-slate-200",
                  ].join(" ")}
                >
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat}</div>
                  <div className="text-xs text-slate-400">{NOMBRE_CAT[cat]}</div>

                  {campeon ? (
                    <>
                      <Avatar foto={campeon.arquero.foto} nombre={`${campeon.arquero.nombre} ${campeon.arquero.apellido}`} />
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">
                          {campeon.arquero.nombre} {campeon.arquero.apellido}
                        </p>
                        <p className="text-liga font-semibold text-sm mt-1">{campeon.total} pts</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-200 flex items-center justify-center mx-auto">
                        <span className="text-3xl">—</span>
                      </div>
                      <p className="text-xs text-slate-400 italic">Sin campeón</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
