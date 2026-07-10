"use client";

import { useTransition } from "react";
import { eliminarInscripcion } from "./actions";

export default function EliminarInscripcionButton({ id, torneoId, nombre }: { id: number; torneoId: number; nombre: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`¿Eliminar la inscripción de ${nombre}?`)) return;
    startTransition(() => eliminarInscripcion(id, torneoId));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-40"
      title="Eliminar inscripción"
    >
      {isPending ? "…" : "✕"}
    </button>
  );
}
