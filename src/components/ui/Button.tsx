import { type ButtonHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "danger" | "ghost";
type Tamaño = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamaño?: Tamaño;
};

const clasesPorVariante: Record<Variante, string> = {
  primary: "bg-green-700 text-white hover:bg-green-800 border-transparent",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border-slate-300",
  danger: "bg-red-600 text-white hover:bg-red-700 border-transparent",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent",
};

const clasesPorTamaño: Record<Tamaño, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({
  variante = "primary",
  tamaño = "md",
  className = "",
  disabled,
  children,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        clasesPorVariante[variante],
        clasesPorTamaño[tamaño],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
