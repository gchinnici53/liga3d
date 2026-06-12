import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { actualizarArquero } from "../../actions";
import ArqueroForm from "@/components/forms/ArqueroForm";
import SubirFotoForm from "./SubirFotoForm";
import Link from "next/link";
import { nombreCompleto } from "@/lib/scoring";

type Props = { params: { id: string } };

export default async function EditarArqueroPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const arquero = await prisma.arquero.findUnique({ where: { id } });
  if (!arquero) notFound();

  const action = actualizarArquero.bind(null, id);

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <Link href={`/admin/arqueros/${id}`} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
          ← Volver a {nombreCompleto(arquero.nombre, arquero.apellido)}
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">Editar arquero</h1>
      </div>

      <div className="space-y-6">
        <SubirFotoForm arqueroId={arquero.id} fotoActual={arquero.foto} />
        <ArqueroForm
          action={action}
          defaultValues={arquero}
          submitLabel="Guardar cambios"
          cancelHref={`/admin/arqueros/${id}`}
        />
      </div>
    </div>
  );
}
