"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Rol } from "@/types/enums";

type NavItem = { href: string; etiqueta: string; icono: string; soloAdmin?: boolean };

const navItems: NavItem[] = [
  { href: "/admin/dashboard",  etiqueta: "Dashboard",   icono: "⊞" },
  { href: "/admin/arqueros",   etiqueta: "Arqueros",    icono: "🏹" },
  { href: "/admin/categorias", etiqueta: "Categorías",  icono: "◈" },
  { href: "/admin/temporadas", etiqueta: "Temporadas",  icono: "📅" },
  { href: "/admin/torneos",    etiqueta: "Torneos",     icono: "🏆" },
  { href: "/admin/usuarios",   etiqueta: "Usuarios",    icono: "👤", soloAdmin: true },
];

const ETIQUETA_ROL: Record<Rol, string> = {
  ADMIN:    "Administrador",
  CARGA:    "Carga",
  INVITADO: "Invitado",
  ARQUERO:  "Arquero",
};

type Props = { rol: Rol; nombre: string; open: boolean; onClose: () => void };

export default function Sidebar({ rol, nombre, open, onClose }: Props) {
  const pathname = usePathname();

  function activo(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const itemsVisibles = navItems.filter((item) => !item.soloAdmin || rol === "ADMIN");

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-30 w-56 bg-slate-900 flex flex-col h-full",
        "transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full",
        "lg:relative lg:translate-x-0 lg:shrink-0",
      ].join(" ")}
    >
      {/* Logo + botón cerrar (solo mobile) */}
      <div className="px-5 py-5 border-b border-slate-700 flex items-start justify-between shrink-0">
        <div>
          <p className="text-white font-bold text-lg tracking-tight">Liga 3D</p>
          <p className="text-slate-400 text-xs mt-0.5">Panel de administración</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded transition-colors mt-0.5"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {itemsVisibles.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={[
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors",
              activo(item.href)
                ? "bg-green-700 text-white font-medium"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            ].join(" ")}
          >
            <span className="text-base leading-none">{item.icono}</span>
            {item.etiqueta}
          </Link>
        ))}
      </nav>

      {/* Usuario y cerrar sesión */}
      <div className="px-2 py-4 border-t border-slate-700 space-y-1 shrink-0">
        <div className="px-3 py-2">
          <p className="text-xs text-slate-400 truncate">{nombre}</p>
          <span className="inline-block text-xs font-semibold px-1.5 py-0.5 rounded mt-0.5 bg-slate-700 text-slate-300">
            {ETIQUETA_ROL[rol]}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white w-full transition-colors"
        >
          <span className="text-base leading-none">↩</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
