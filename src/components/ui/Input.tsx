import { type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export default function Input({ label, error, hint, id, className = "", ...props }: Props) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        className={[
          "border rounded-lg px-3 py-2 text-sm text-slate-800",
          "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
          "disabled:bg-slate-50 disabled:text-slate-400",
          error ? "border-red-400 bg-red-50" : "border-slate-300 bg-white",
          className,
        ].join(" ")}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
