"use client";

import { useState } from "react";

type Props = { nombres: string[] };

export default function SorteoClient({ nombres }: Props) {
  const [pendientes, setPendientes] = useState<string[]>(nombres);
  const [sacados, setSacados] = useState<string[]>([]);
  const [actual, setActual] = useState<string | null>(null);

  function reiniciar() {
    setPendientes(nombres);
    setSacados([]);
    setActual(null);
  }

  function sacarSiguiente() {
    if (pendientes.length === 0) return;
    const idx = Math.floor(Math.random() * pendientes.length);
    const elegido = pendientes[idx];
    setPendientes((prev) => prev.filter((_, i) => i !== idx));
    setSacados((prev) => [...prev, elegido]);
    setActual(elegido);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        {actual ? (
          <p className="text-3xl font-bold text-green-700">{actual}</p>
        ) : (
          <p className="text-slate-400 text-sm">Tocá &quot;Sacar siguiente&quot; para empezar el sorteo</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={sacarSiguiente}
          disabled={pendientes.length === 0}
          className="flex-1 bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pendientes.length === 0 ? "No quedan más" : `Sacar siguiente (quedan ${pendientes.length})`}
        </button>
        <button
          onClick={reiniciar}
          className="bg-slate-200 text-slate-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
        >
          Reiniciar
        </button>
      </div>

      {sacados.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Orden del sorteo</h2>
          <ol className="space-y-1.5">
            {sacados.map((n, i) => (
              <li key={`${n}-${i}`} className="flex items-center gap-3 text-sm">
                <span className="text-xs font-bold text-slate-300 w-5 shrink-0">{i + 1}</span>
                <span className={i === sacados.length - 1 ? "font-semibold text-green-700" : "text-slate-700"}>{n}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
