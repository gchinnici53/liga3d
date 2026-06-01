"use client";

import { useTransition } from "react";
import { eliminarResultado } from "./actions";

export default function EliminarResultadoButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("¿Eliminar este resultado del torneo?")) return;
    startTransition(() => eliminarResultado(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-slate-300 hover:text-red-500 disabled:opacity-40 transition-colors"
      title="Eliminar resultado"
    >
      {isPending ? "…" : "✕"}
    </button>
  );
}
