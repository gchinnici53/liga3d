import { type SelectHTMLAttributes } from "react";

type Opcion = { valor: string | number; etiqueta: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  opciones: Opcion[];
  placeholder?: string;
  error?: string;
};

export default function Select({
  label,
  opciones,
  placeholder,
  error,
  id,
  className = "",
  ...props
}: Props) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={selectId}
        className={[
          "border rounded-lg px-3 py-2 text-sm text-slate-800 bg-white",
          "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
          "disabled:bg-slate-50 disabled:text-slate-400",
          error ? "border-red-400 bg-red-50" : "border-slate-300",
          className,
        ].join(" ")}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {opciones.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.etiqueta}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
