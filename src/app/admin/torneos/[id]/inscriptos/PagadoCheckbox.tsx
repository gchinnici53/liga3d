"use client";

import { useState, useTransition } from "react";
import { togglePagado } from "./actions";

export default function PagadoCheckbox({ id, torneoId, inicial }: { id: number; torneoId: number; inicial: boolean }) {
  const [pagado, setPagado] = useState(inicial);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nuevo = e.target.checked;
    setPagado(nuevo);
    startTransition(() => togglePagado(id, nuevo, torneoId));
  }

  return (
    <label className="flex items-center justify-center cursor-pointer">
      <input
        type="checkbox"
        checked={pagado}
        onChange={handleChange}
        disabled={isPending}
        className="w-4 h-4 accent-green-600 cursor-pointer disabled:opacity-50"
      />
    </label>
  );
}
