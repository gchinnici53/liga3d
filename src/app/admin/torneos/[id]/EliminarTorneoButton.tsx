"use client";

import { eliminarTorneo } from "./actions";

export default function EliminarTorneoButton({ id }: { id: number }) {
  const action = eliminarTorneo.bind(null, id);
  return (
    <form action={action} className="inline">
      <button
        type="submit"
        className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors"
      >
        Eliminar torneo
      </button>
    </form>
  );
}
