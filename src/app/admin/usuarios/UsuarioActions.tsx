"use client";

import { useState, useTransition } from "react";
import { eliminarUsuario, resetearPassword } from "./actions";

type Props = { usuarioId: number; esPropio: boolean };

export default function UsuarioActions({ usuarioId, esPropio }: Props) {
  const [mostrarReset, setMostrarReset] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mensajeReset, setMensajeReset] = useState<string | null>(null);
  const [isPendingDelete, startDelete] = useTransition();
  const [isPendingReset, startReset] = useTransition();

  function handleEliminar() {
    if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    startDelete(async () => {
      const result = await eliminarUsuario(usuarioId);
      if (result.error) alert(result.error);
    });
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    startReset(async () => {
      const result = await resetearPassword(usuarioId, nuevaPassword);
      if (result.error) {
        setMensajeReset(result.error);
      } else {
        setMensajeReset("Contraseña actualizada.");
        setNuevaPassword("");
        setTimeout(() => {
          setMostrarReset(false);
          setMensajeReset(null);
        }, 1500);
      }
    });
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {mostrarReset ? (
        <form onSubmit={handleReset} className="flex items-center gap-2">
          <input
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            placeholder="Nueva contraseña"
            minLength={6}
            required
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-600 w-36"
          />
          <button
            type="submit"
            disabled={isPendingReset}
            className="text-xs bg-green-700 text-white px-2 py-1 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {isPendingReset ? "..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => { setMostrarReset(false); setMensajeReset(null); }}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Cancelar
          </button>
          {mensajeReset && (
            <span className={`text-xs ${mensajeReset.includes("actualizada") ? "text-green-700" : "text-red-600"}`}>
              {mensajeReset}
            </span>
          )}
        </form>
      ) : (
        <button
          onClick={() => setMostrarReset(true)}
          className="text-xs text-slate-500 hover:text-blue-700 transition-colors border border-slate-200 px-2 py-1 rounded-lg hover:border-blue-300"
        >
          Resetear contraseña
        </button>
      )}

      {!esPropio && (
        <button
          onClick={handleEliminar}
          disabled={isPendingDelete}
          className="text-slate-400 hover:text-red-600 disabled:opacity-40 transition-colors"
          title="Eliminar usuario"
        >
          {isPendingDelete ? "…" : "✕"}
        </button>
      )}
    </div>
  );
}
