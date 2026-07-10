"use client";

import { useState } from "react";

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("");
}

export default function PersonaCard({ nombre, foto }: { nombre: string; foto: string }) {
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-liga/10 border-2 border-liga/20 flex items-center justify-center shrink-0">
        {error ? (
          <span className="text-liga font-bold text-xl">{iniciales(nombre)}</span>
        ) : (
          <img
            src={foto}
            alt=""
            className="object-cover w-full h-full"
            onError={() => setError(true)}
          />
        )}
      </div>
      <p className="text-sm font-semibold text-slate-700">{nombre}</p>
    </div>
  );
}
