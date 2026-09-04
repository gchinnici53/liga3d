"use client";

import { useState, useTransition } from "react";
import { agregarInscripcion } from "./actions";

const CATEGORIAS = [
  { value: "CM", label: "CM — Compuesto Masculino" },
  { value: "CW", label: "CW — Compuesto Femenino" },
  { value: "BM", label: "BM — Barebow Masculino" },
  { value: "BW", label: "BW — Barebow Femenino" },
  { value: "LM", label: "LM — Longbow Masculino" },
  { value: "LW", label: "LW — Longbow Femenino" },
  { value: "TM", label: "TM — Tradicional Masculino" },
  { value: "TW", label: "TW — Tradicional Femenino" },
  { value: "ESC", label: "ESC — Escuela" },
  { value: "JUN", label: "JUN — Junior" },
];

export default function AgregarInscripcionForm({ torneoId }: { torneoId: number }) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [ok, setOk]           = useState(false);
  const [isPending, start]    = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await agregarInscripcion(torneoId, fd);
      if (res.error) {
        setError(res.error);
      } else {
        setOk(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
      >
        + Agregar inscripto
      </button>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Agregar inscripto manualmente</h2>
        <button
          onClick={() => { setAbierto(false); setError(null); setOk(false); }}
          className="text-slate-400 hover:text-slate-700 text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {ok && (
        <p className="text-sm text-green-700 font-medium bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
          ✓ Inscripto agregado correctamente.
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
          <input
            name="nombre"
            type="text"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Apellido *</label>
          <input
            name="apellido"
            type="text"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Categoría *</label>
          <select
            name="categoria"
            required
            defaultValue=""
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="" disabled>Seleccioná...</option>
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">DNI</label>
          <input
            name="dni"
            type="text"
            placeholder="Sin puntos"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de nacimiento</label>
          <input
            name="fechaNacimiento"
            type="date"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Club</label>
          <input
            name="club"
            type="text"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
          <input
            name="telefono"
            type="text"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {error && (
          <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => { setAbierto(false); setError(null); setOk(false); }}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Guardando..." : "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
}
