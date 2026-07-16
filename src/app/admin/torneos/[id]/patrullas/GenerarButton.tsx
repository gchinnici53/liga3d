"use client";

import { useTransition } from "react";
import { generarPatrullas } from "./actions";

export default function GenerarButton({ torneoId, hayPatrullas }: { torneoId: number; hayPatrullas: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (hayPatrullas && !confirm("¿Regenerar las patrullas? Se perderán los cambios manuales.")) return;
    startTransition(async () => { await generarPatrullas(torneoId); });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50"
    >
      {isPending ? "Generando..." : hayPatrullas ? "↺ Regenerar patrullas" : "⚡ Generar patrullas"}
    </button>
  );
}
