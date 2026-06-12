"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import Image from "next/image";
import type { Arquero } from "@/types";
import type { ArqueroFormState } from "@/app/admin/arqueros/actions";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Link from "next/link";

type Props = {
  action: (prev: ArqueroFormState, formData: FormData) => Promise<ArqueroFormState>;
  defaultValues?: Partial<Arquero>;
  submitLabel?: string;
  cancelHref?: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variante="primary" disabled={pending}>
      {pending ? "Guardando..." : label}
    </Button>
  );
}

export default function ArqueroForm({
  action,
  defaultValues,
  submitLabel = "Guardar",
  cancelHref = "/admin/arqueros",
}: Props) {
  const [rawState, formAction] = useFormState(action, {});
  const state = rawState ?? {};

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fechaNacDefault = defaultValues?.fechaNacimiento
    ? new Date(defaultValues.fechaNacimiento).toISOString().split("T")[0]
    : "";

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
          {state.error}
        </div>
      )}

      {/* Datos personales */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Datos personales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            name="nombre"
            required
            defaultValue={defaultValues?.nombre}
            placeholder="Juan"
          />
          <Input
            label="Apellido"
            name="apellido"
            required
            defaultValue={defaultValues?.apellido}
            placeholder="Pérez"
          />
          <Input
            label="DNI"
            name="dni"
            required
            defaultValue={defaultValues?.dni}
            placeholder="12345678"
          />
          <Input
            label="Fecha de nacimiento"
            name="fechaNacimiento"
            type="date"
            required
            defaultValue={fechaNacDefault}
          />
          <Select
            label="Sexo"
            name="sexo"
            required
            defaultValue={defaultValues?.sexo ?? ""}
            placeholder="Seleccioná..."
            opciones={[
              { valor: "MASCULINO", etiqueta: "Masculino" },
              { valor: "FEMENINO",  etiqueta: "Femenino" },
            ]}
          />
          <Input
            label="País"
            name="pais"
            defaultValue={defaultValues?.pais ?? "Argentina"}
          />
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            defaultValue={defaultValues?.email ?? ""}
            placeholder="juan@email.com"
          />
          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            defaultValue={defaultValues?.telefono ?? ""}
            placeholder="+54 11 1234-5678"
          />
        </div>
      </div>

      {/* Estado */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Estado</h2>
        <div className="max-w-xs">
          <Select
            label="Estado"
            name="activo"
            defaultValue={defaultValues?.activo === false ? "false" : "true"}
            opciones={[
              { valor: "true",  etiqueta: "Activo" },
              { valor: "false", etiqueta: "Inactivo" },
            ]}
          />
        </div>
      </div>

      {/* Foto */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : defaultValues?.foto ? (
              <Image src={defaultValues.foto} alt="Foto actual" width={80} height={80} className="object-cover" />
            ) : (
              <span className="text-slate-400 text-xs text-center px-1">Sin foto</span>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {defaultValues?.foto ? "Cambiar foto" : "Subir foto"}
            </label>
            <input
              name="foto"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreviewUrl(URL.createObjectURL(file));
              }}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <p className="text-xs text-slate-400 mt-1">JPG, PNG o WEBP. Se guarda en el servidor.</p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href={cancelHref}>
          <Button type="button" variante="secondary">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}
