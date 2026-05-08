"use client";

import { cerrarTemporada, reabrirTemporada } from "./actions";

type Props = { id: number; estado: "ACTIVA" | "CERRADA" };

export default function CambiarEstadoButton({ id, estado }: Props) {
  const action = estado === "ACTIVA"
    ? cerrarTemporada.bind(null, id)
    : reabrirTemporada.bind(null, id);

  return (
    <form action={action} className="inline">
      <button
        type="submit"
        className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
      >
        {estado === "ACTIVA" ? "Cerrar" : "Reabrir"}
      </button>
    </form>
  );
}
