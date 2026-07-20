"use client";

import { useState, useTransition } from "react";
import { togglePresente } from "./actions";

export default function PresenceCheckbox({
  id,
  torneoId,
  inicial,
}: {
  id: number;
  torneoId: number;
  inicial: boolean;
}) {
  const [presente, setPresente] = useState(inicial);
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={presente}
      disabled={isPending}
      onChange={(e) => {
        const nuevo = e.target.checked;
        setPresente(nuevo);
        startTransition(async () => {
          await togglePresente(id, nuevo, torneoId);
        });
      }}
      className="w-4 h-4 accent-blue-600 cursor-pointer disabled:opacity-50"
    />
  );
}
