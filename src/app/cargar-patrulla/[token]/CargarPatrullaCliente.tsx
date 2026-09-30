"use client";

import { useRef, useState } from "react";
import { guardarPuntajeQR } from "./actions";
import type { MiembroCarga } from "./page";

type Props = {
  token: string;
  torneoNombre: string;
  fecha: string;
  patrullaNumero: number;
  patrullaBis: boolean;
  estaca: string;
  miembros: MiembroCarga[];
};

const ESTACA_COLOR: Record<string, string> = {
  ROJA:     "bg-red-100 text-red-700 border-red-200",
  AMARILLA: "bg-amber-100 text-amber-700 border-amber-200",
  AZUL:     "bg-blue-100 text-blue-700 border-blue-200",
};

export default function CargarPatrullaCliente({
  token, torneoNombre, fecha, patrullaNumero, patrullaBis, estaca, miembros,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-10">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <p className="text-xs text-slate-400">{torneoNombre} · {fecha}</p>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-bold text-slate-800">
              Patrulla {patrullaNumero}{patrullaBis ? " bis" : ""}
            </h1>
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${ESTACA_COLOR[estaca] ?? ""}`}>
              {estaca}
            </span>
          </div>
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
  const [r1, setR1] = useState(miembro.ocupado && miembro.puntajeRonda1 != null ? String(miembro.puntajeRonda1) : "");
  const [r2, setR2] = useState(miembro.ocupado && miembro.puntajeRonda2 != null ? String(miembro.puntajeRonda2) : "");
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
    const r1str = r1.trim();
    if (r1str === "") return;
    const n1 = Number(r1str);
    if (isNaN(n1) || n1 < 0) return;

    const r2str = r2.trim();
    const n2 = r2str === "" ? null : Number(r2str);
    if (n2 !== null && (isNaN(n2) || n2 < 0)) return;

    const firma = `${n1}|${n2}`;
    if (ultimoGuardado.current === firma) return;
    ultimoGuardado.current = firma;

    setEstado("guardando");
    setErrorMsg(null);
    const res = await guardarPuntajeQR(token, (miembro as { inscripcionId: number }).inscripcionId, n1, n2);
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
        <span className="text-xs px-2 py-0.5 bg-liga/10 text-liga rounded font-semibold">{miembro.categoria}</span>
      </div>

      {miembro.sinArquero ? (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          No encontramos a este arquero en el sistema. Avisale al organizador antes de cargar el puntaje.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Ronda 1</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={r1}
                onChange={(e) => setR1(e.target.value)}
                onBlur={guardar}
                placeholder="0"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base text-center focus:outline-none focus:ring-2 focus:ring-liga/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Ronda 2</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={r2}
                onChange={(e) => setR2(e.target.value)}
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
