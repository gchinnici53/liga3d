import type { Arquero, Categoria } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Link from "next/link";

type Props = {
  action: (formData: FormData) => Promise<void>;
  categorias: Categoria[];
  defaultValues?: Partial<Arquero>;
  submitLabel?: string;
  cancelHref?: string;
};

export default function ArqueroForm({
  action,
  categorias,
  defaultValues,
  submitLabel = "Guardar",
  cancelHref = "/admin/arqueros",
}: Props) {
  const fechaNacDefault = defaultValues?.fechaNacimiento
    ? new Date(defaultValues.fechaNacimiento).toISOString().split("T")[0]
    : "";

  return (
    <form action={action} className="space-y-6">
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

      {/* Liga */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Configuración de liga</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Categoría"
            name="categoriaId"
            required
            defaultValue={defaultValues?.categoriaId ?? ""}
            placeholder="Seleccioná..."
            opciones={categorias.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
          />
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

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <Button type="submit" variante="primary">
          {submitLabel}
        </Button>
        <Link href={cancelHref}>
          <Button type="button" variante="secondary">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}
