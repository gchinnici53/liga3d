type Variante = "activo" | "inactivo" | "final" | "regular" | "abierta" | "cerrada" | "neutral";

type Props = {
  variante: Variante;
  texto?: string;
};

const config: Record<Variante, { clases: string; textoDefault: string }> = {
  activo:   { clases: "bg-green-100 text-green-800",  textoDefault: "Activo" },
  inactivo: { clases: "bg-slate-100 text-slate-600",  textoDefault: "Inactivo" },
  final:    { clases: "bg-amber-100 text-amber-800",  textoDefault: "Final" },
  regular:  { clases: "bg-blue-100 text-blue-800",    textoDefault: "Regular" },
  abierta:  { clases: "bg-green-100 text-green-800",  textoDefault: "Activa" },
  cerrada:  { clases: "bg-slate-100 text-slate-600",  textoDefault: "Cerrada" },
  neutral:  { clases: "bg-slate-100 text-slate-600",  textoDefault: "" },
};

export default function Badge({ variante, texto }: Props) {
  const { clases, textoDefault } = config[variante];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${clases}`}>
      {texto ?? textoDefault}
    </span>
  );
}
