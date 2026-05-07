"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type NavItem = { href: string; etiqueta: string; icono: string };

const navItems: NavItem[] = [
  { href: "/admin/dashboard",  etiqueta: "Dashboard",   icono: "⊞" },
  { href: "/admin/arqueros",   etiqueta: "Arqueros",    icono: "🏹" },
  { href: "/admin/categorias", etiqueta: "Categorías",  icono: "◈" },
  { href: "/admin/temporadas", etiqueta: "Temporadas",  icono: "📅" },
  { href: "/admin/torneos",    etiqueta: "Torneos",     icono: "🏆" },
  { href: "/admin/usuarios",   etiqueta: "Usuarios",    icono: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function activo(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="w-56 bg-slate-900 flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <p className="text-white font-bold text-lg tracking-tight">Liga 3D</p>
        <p className="text-slate-400 text-xs mt-0.5">Panel de administración</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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

      {/* Cerrar sesión */}
      <div className="px-2 py-4 border-t border-slate-700">
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
