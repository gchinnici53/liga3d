"use client";

import { useEffect, useRef, useState } from "react";

export type ArqueroOpt = { id: number; nombre: string; apellido: string; sexo: string };

type Props = {
  label: string;
  arqueros: ArqueroOpt[];
  value: number | null;
  onChange: (id: number | null) => void;
  excludeIds?: number[];
};

export default function SelectorArquero({ label, arqueros, value, onChange, excludeIds = [] }: Props) {
  const seleccionado = arqueros.find((a) => a.id === value) ?? null;
  const [query, setQuery] = useState(seleccionado ? `${seleccionado.nombre} ${seleccionado.apellido}` : "");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(seleccionado ? `${seleccionado.nombre} ${seleccionado.apellido}` : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const disponibles = arqueros.filter((a) => a.id === value || !excludeIds.includes(a.id));
  const filtrados = query.trim()
    ? disponibles.filter((a) => `${a.nombre} ${a.apellido}`.toLowerCase().includes(query.trim().toLowerCase()))
    : disponibles;

  return (
    <div className="flex flex-col gap-1 relative" ref={wrapRef}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar arquero..."
        autoComplete="off"
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {open && filtrados.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtrados.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(a.id);
                  setQuery(`${a.nombre} ${a.apellido}`);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              >
                {a.nombre} {a.apellido}{" "}
                <span className="text-xs text-slate-400">({a.sexo === "FEMENINO" ? "Mujer" : "Varón"})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
