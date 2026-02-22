"use client";

import clsx from "clsx";

export function ModeSwitch({
  value,
  onChange,
  leftLabel = "Dictar",
  rightLabel = "Escribir",
}: {
  value: "dictate" | "type";
  onChange: (v: "dictate" | "type") => void;
  leftLabel?: string;
  rightLabel?: string;
}) {
  const isType = value === "type";
  return (
    <button
      type="button"
      onClick={() => onChange(isType ? "dictate" : "type")}
      className={clsx(
        "flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-2 py-1",
        "shadow-sm hover:bg-white transition"
      )}
      aria-label="Cambiar modo de entrada"
    >
      <span className={clsx("text-xs font-medium", !isType ? "text-slate-900" : "text-slate-400")}>
        {leftLabel}
      </span>
      <span className="relative inline-flex h-5 w-10 items-center rounded-full bg-slate-200">
        <span
          className={clsx(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
            isType ? "translate-x-5" : "translate-x-1"
          )}
        />
      </span>
      <span className={clsx("text-xs font-medium", isType ? "text-slate-900" : "text-slate-400")}>
        {rightLabel}
      </span>
    </button>
  );
}
