import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [totalArqueros, temporadaActiva, proximoTorneo] = await Promise.all([
    prisma.arquero.count({ where: { activo: true } }),
    prisma.temporada.findFirst({ where: { estado: "ACTIVA" }, orderBy: { anio: "desc" } }),
    prisma.torneo.findFirst({
      where: { fecha: { gte: new Date() } },
      orderBy: { fecha: "asc" },
      include: { temporada: true },
    }),
  ]);

  const totalCategorias = await prisma.categoria.count({ where: { activa: true } });

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
      <p className="text-slate-500 text-sm mb-6">Resumen general de la liga</p>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Tarjeta icono="🏹" titulo="Arqueros activos" valor={totalArqueros} />
        <Tarjeta icono="◈" titulo="Categorías" valor={totalCategorias} />
        <Tarjeta
          icono="📅"
          titulo="Temporada activa"
          valor={temporadaActiva ? temporadaActiva.nombre : "—"}
        />
        <Tarjeta
          icono="🏆"
          titulo="Próximo torneo"
          valor={proximoTorneo ? proximoTorneo.nombre : "—"}
        />
      </div>

      {/* Accesos rápidos */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Accesos rápidos
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Acceso href="/admin/arqueros/nuevo" etiqueta="Nuevo arquero" />
        <Acceso href="/admin/arqueros/importar" etiqueta="Importar desde Excel" />
        <Acceso href="/admin/temporadas/nueva" etiqueta="Nueva temporada" />
        <Acceso href="/admin/torneos/nuevo" etiqueta="Nuevo torneo" />
        <Acceso href="/admin/categorias" etiqueta="Gestionar categorías" />
      </div>
    </div>
  );
}

function Tarjeta({ icono, titulo, valor }: { icono: string; titulo: string; valor: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-2xl mb-1">{icono}</p>
      <p className="text-xs text-slate-500 mb-1">{titulo}</p>
      <p className="text-lg font-bold text-slate-800 truncate">{valor}</p>
    </div>
  );
}

function Acceso({ href, etiqueta }: { href: string; etiqueta: string }) {
  return (
    <a
      href={href}
      className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:border-green-300 transition-colors"
    >
      {etiqueta} →
    </a>
  );
}
