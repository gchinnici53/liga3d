"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { editarResultado } from "./actions";
import EliminarResultadoButton from "./EliminarResultadoButton";
import { nombreCompleto } from "@/lib/scoring";

type Props = {
  resultado: {
    id: number;
    posicion: number;
    esMedallista: boolean;
    puntajeTotal: number;
    puntosTemporada: number;
    arquero: { id: number; nombre: string; apellido: string };
  };
};

export default function EditarResultadoInline({ resultado }: Props) {
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [posicion, setPosicion] = useState(String(resultado.posicion));
  const [puntaje, setPuntaje] = useState(String(resultado.puntajeTotal));

  function cancelar() {
    setEditando(false);
    setError(null);
    setPosicion(String(resultado.posicion));
    setPuntaje(String(resultado.puntajeTotal));
  }

  function guardar() {
    const pos = parseInt(posicion, 10);
    const pts = parseInt(puntaje, 10);
    if (isNaN(pos) || pos < 1) { setError("Posición inválida."); return; }
    if (isNaN(pts) || pts < 0) { setError("Puntaje inválido."); return; }

    setError(null);
    startTransition(async () => {
      const res = await editarResultado(resultado.id, pos, pts);
      if (res?.error) {
        setError(res.error);
      } else {
        setEditando(false);
      }
    });
  }

  if (editando) {
    return (
      <tr className="bg-blue-50 border-b border-blue-100">
        <td className="px-4 py-2.5">
          <input
            type="number"
            value={posicion}
            onChange={(e) => setPosicion(e.target.value)}
            className="w-14 border border-slate-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
            min={1}
            autoFocus
          />
        </td>
        <td className="px-4 py-2.5 text-sm font-medium text-slate-700">
          {nombreCompleto(resultado.arquero.nombre, resultado.arquero.apellido)}
        </td>
        <td className="px-4 py-2.5 text-right">
          <input
            type="number"
            value={puntaje}
            onChange={(e) => setPuntaje(e.target.value)}
            className="w-20 border border-slate-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
            min={0}
          />
        </td>
        <td className="px-4 py-2.5 text-right text-xs text-slate-400 italic">recalcula</td>
        <td className="px-2 py-2.5">
          <div className="flex flex-col gap-1 items-end">
            <div className="flex gap-1">
              <button
                onClick={guardar}
                disabled={isPending}
                className="bg-green-700 text-white text-xs px-2.5 py-1 rounded hover:bg-green-800 disabled:opacity-50 font-medium"
              >
                {isPending ? "…" : "Guardar"}
              </button>
              <button
                onClick={cancelar}
                disabled={isPending}
                className="bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded hover:bg-slate-300 font-medium"
              >
                Cancelar
              </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={resultado.esMedallista ? "bg-amber-50" : "hover:bg-slate-50"}>
      <td className="px-4 py-2.5">
        <MedallaPosicion posicion={resultado.posicion} />
      </td>
      <td className="px-4 py-2.5">
        <Link href={`/admin/arqueros/${resultado.arquero.id}`} className="text-slate-800 hover:text-green-700">
          {nombreCompleto(resultado.arquero.nombre, resultado.arquero.apellido)}
        </Link>
      </td>
      <td className="px-4 py-2.5 text-right text-slate-800">{resultado.puntajeTotal}</td>
      <td className="px-4 py-2.5 text-right font-semibold text-green-700">{resultado.puntosTemporada}</td>
      <td className="px-2 py-2.5 text-center">
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => setEditando(true)}
            className="text-slate-400 hover:text-blue-600 text-sm px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            title="Editar resultado"
          >
            ✏
          </button>
          <EliminarResultadoButton id={resultado.id} />
        </div>
      </td>
    </tr>
  );
}

function MedallaPosicion({ posicion }: { posicion: number }) {
  if (posicion === 1) return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-white text-xs font-bold shadow-sm">
      🥇
    </span>
  );
  if (posicion === 2) return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-white text-xs font-bold shadow-sm">
      🥈
    </span>
  );
  if (posicion === 3) return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white text-xs font-bold shadow-sm">
      🥉
    </span>
  );
  return <span className="text-sm font-semibold text-slate-500 px-1">{posicion}°</span>;
}
