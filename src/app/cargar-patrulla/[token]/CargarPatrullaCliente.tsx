"use client";

import { useRef, useState } from "react";
import { guardarPuntajeQR } from "./actions";
import { estacaDeCategoria } from "@/lib/estaca";
import type { MiembroCarga } from "./page";

type Props = {
  token: string;
  torneoNombre: string;
  fecha: string;
  patrullaNumero: number;
  patrullaBis: boolean;
  miembros: MiembroCarga[];
};

const ESTACA_COLOR: Record<string, string> = {
  ROJA:     "bg-red-100 text-red-700 border-red-200",
  AMARILLA: "bg-amber-100 text-amber-700 border-amber-200",
  AZUL:     "bg-blue-100 text-blue-700 border-blue-200",
};

export default function CargarPatrullaCliente({
  token, torneoNombre, fecha, patrullaNumero, patrullaBis, miembros,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <p className="text-xs text-slate-400">{torneoNombre} · {fecha}</p>
          <h1 className="text-xl font-bold text-slate-800 mt-1">
            Patrulla {patrullaNumero}{patrullaBis ? " bis" : ""}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cargá el puntaje de cada arquero. Se guarda solo al salir del campo.
          </p>
        </div>

        <div className="space-y-3">
          {miembros.map((m) => (
            <TarjetaMiembro key={m.posicion} token={token} miembro={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TarjetaMiembro({ token, miembro }: { token: string; miembro: MiembroCarga }) {
  const [puntaje, setPuntaje]   = useState(miembro.ocupado && miembro.puntajeRonda1 != null ? String(miembro.puntajeRonda1) : "");
  const [c11, setC11]           = useState(miembro.ocupado && miembro.cantidad11s != null ? String(miembro.cantidad11s) : "");
  const [c10, setC10]           = useState(miembro.ocupado && miembro.cantidad10s != null ? String(miembro.cantidad10s) : "");
  const [estado, setEstado] = useState<"guardando" | "guardado" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const ultimoGuardado = useRef<string | null>(null);

  if (!miembro.ocupado) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-300">
        Posición {miembro.posicion} — vacante
      </div>
    );
  }

  async function guardar() {
    const pStr = puntaje.trim();
    if (pStr === "") return;
    const nPuntaje = Number(pStr);
    if (isNaN(nPuntaje) || nPuntaje < 0) return;

    const c11Str = c11.trim();
    const nC11 = c11Str === "" ? null : Number(c11Str);
    if (nC11 !== null && (isNaN(nC11) || nC11 < 0)) return;

    const c10Str = c10.trim();
    const nC10 = c10Str === "" ? null : Number(c10Str);
    if (nC10 !== null && (isNaN(nC10) || nC10 < 0)) return;

    const firma = `${nPuntaje}|${nC11}|${nC10}`;
    if (ultimoGuardado.current === firma) return;
    ultimoGuardado.current = firma;

    setEstado("guardando");
    setErrorMsg(null);
    const res = await guardarPuntajeQR(token, (miembro as { inscripcionId: number }).inscripcionId, nPuntaje, nC11, nC10);
    if (res.error) {
      setEstado("error");
      setErrorMsg(res.error);
    } else {
      setEstado("guardado");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-400">Posición {miembro.posicion}</p>
          <p className="font-semibold text-slate-800">{miembro.apellido}, {miembro.nombre}</p>
        </div>
        <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border font-medium ${ESTACA_COLOR[estacaDeCategoria(miembro.categoria)]}`}>
          {miembro.categoria}
        </span>
      </div>

      {miembro.sinArquero ? (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          No encontramos a este arquero en el sistema. Avisale al organizador antes de cargar el puntaje.
        </p>
      ) : (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Puntaje</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={puntaje}
              onChange={(e) => setPuntaje(e.target.value)}
              onBlur={guardar}
              placeholder="0"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base text-center focus:outline-none focus:ring-2 focus:ring-liga/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Cantidad de 11&apos;s</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={c11}
                onChange={(e) => setC11(e.target.value)}
                onBlur={guardar}
                placeholder="—"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base text-center focus:outline-none focus:ring-2 focus:ring-liga/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Cantidad de 10&apos;s</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={c10}
                onChange={(e) => setC10(e.target.value)}
                onBlur={guardar}
                placeholder="—"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base text-center focus:outline-none focus:ring-2 focus:ring-liga/40"
              />
            </div>
          </div>
          <div className="mt-2 text-right h-4">
            {estado === "guardando" && <span className="text-xs text-slate-400">Guardando...</span>}
            {estado === "guardado"  && <span className="text-xs text-green-600 font-medium">✓ Guardado</span>}
            {estado === "error"     && <span className="text-xs text-red-500">⚠ {errorMsg}</span>}
          </div>
        </>
      )}
    </div>
  );
}
