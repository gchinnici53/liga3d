"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { actualizarDiana, eliminarDiana, toggleActivaDiana, type DianaFormState } from "./actions";
import type { DianaConUso } from "@/lib/dianas";
import { ZONAS_VITALES_MAX } from "@/lib/dianas";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-green-700 text-white text-xs px-2.5 py-1 rounded hover:bg-green-800 disabled:opacity-50 font-medium"
    >
      {pending ? "…" : "Guardar"}
    </button>
  );
}

export default function DianaRow({ diana }: { diana: DianaConUso }) {
  const [editando, setEditando] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const actionConId = (_prev: DianaFormState, formData: FormData) => actualizarDiana(diana.id, formData);
  const [state, formAction] = useFormState(actionConId, {});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted && !state?.error) {
      setEditando(false);
      setSubmitted(false);
    }
  }, [state, submitted]);

  function handleEliminar() {
    if (!confirm(`¿Eliminar la diana "${diana.nombre}"?`)) return;
    setErrorEliminar(null);
    startTransition(async () => {
      const res = await eliminarDiana(diana.id);
      if (res?.error) setErrorEliminar(res.error);
    });
  }

  if (editando) {
    return (
      <tr className="bg-blue-50 border-b border-blue-100">
        <td className="px-4 py-2.5" colSpan={8}>
          <form action={formAction} onSubmit={() => setSubmitted(true)} className="flex flex-wrap items-end gap-3">
            {state?.error && (
              <p className="w-full text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                {state.error}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-slate-500">Nombre</label>
              <input
                name="nombre"
                defaultValue={diana.nombre}
                required
                className="border border-slate-300 rounded px-2 py-1 text-sm w-40"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-slate-500">Zonas</label>
              <select
                name="cantidadZonas"
                defaultValue={diana.cantidadZonas}
                className="border border-slate-300 rounded px-2 py-1 text-sm"
              >
                {Array.from({ length: ZONAS_VITALES_MAX }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-slate-500">Inventario</label>
              <input
                name="cantidad"
                type="number"
                min={1}
                defaultValue={diana.cantidad}
                required
                className="border border-slate-300 rounded px-2 py-1 text-sm w-20"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-slate-500">Costo ($)</label>
              <input
                name="costoCompra"
                type="number"
                min={0}
                step="0.01"
                defaultValue={diana.costoCompra ?? ""}
                className="border border-slate-300 rounded px-2 py-1 text-sm w-24"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-slate-500">Vida útil/zona</label>
              <input
                name="vidaUtilUsosZona"
                type="number"
                min={1}
                defaultValue={diana.vidaUtilUsosZona ?? ""}
                className="border border-slate-300 rounded px-2 py-1 text-sm w-24"
              />
            </div>
            <div className="flex gap-1">
              <SaveButton />
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded hover:bg-slate-300 font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className={diana.activa ? "hover:bg-slate-50" : "bg-slate-50 text-slate-400"}>
      <td className="px-4 py-2.5 font-medium text-slate-800">{diana.nombre}</td>
      <td className="px-4 py-2.5 text-center">{diana.cantidadZonas}</td>
      <td className="px-4 py-2.5 text-center">{diana.cantidad}</td>
      <td className="px-4 py-2.5 text-right">{diana.costoCompra != null ? `$${diana.costoCompra.toFixed(2)}` : "—"}</td>
      <td className="px-4 py-2.5 text-right">
        {diana.costoPorUso != null ? `$${diana.costoPorUso.toFixed(2)}` : "—"}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex flex-wrap gap-1">
          {diana.zonas.map((z) => (
            <span
              key={z.zonaVital}
              title={z.vidaRestante != null ? `Vida restante: ${z.vidaRestante} torneos` : undefined}
              className={[
                "px-1.5 py-0.5 rounded text-xs font-semibold",
                z.vidaRestante != null && z.vidaRestante <= 0
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              Z{z.zonaVital}: {z.torneosUsada}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-2.5 text-center">
        <button
          onClick={() => startTransition(() => toggleActivaDiana(diana.id, !diana.activa))}
          disabled={isPending}
          className={[
            "px-2 py-0.5 rounded-full text-xs font-semibold transition-colors",
            diana.activa ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-200 text-slate-500 hover:bg-slate-300",
          ].join(" ")}
        >
          {diana.activa ? "Activa" : "Inactiva"}
        </button>
      </td>
      <td className="px-2 py-2.5 text-center">
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-1 justify-center">
            <button
              onClick={() => setEditando(true)}
              className="text-slate-400 hover:text-blue-600 text-sm px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              title="Editar diana"
            >
              ✏
            </button>
            <button
              onClick={handleEliminar}
              disabled={isPending}
              className="text-slate-400 hover:text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
              title="Eliminar diana"
            >
              🗑
            </button>
          </div>
          {errorEliminar && <p className="text-xs text-red-500 text-right">{errorEliminar}</p>}
        </div>
      </td>
    </tr>
  );
}
