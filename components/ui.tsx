import clsx from "clsx";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={clsx(
        "rounded-2xl bg-white/80 backdrop-blur border border-slate-200 shadow-soft",
        props.className
      )}
    />
  );
}

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium",
        "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}

export function GhostButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium",
        "bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-200",
        className
      )}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none",
        "focus:ring-2 focus:ring-sky-300 focus:border-sky-300",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full min-h-[170px] rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 text-sm outline-none",
        "focus:ring-2 focus:ring-sky-300 focus:border-sky-300",
        props.className
      )}
    />
  );
}

export function Label(props: HTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={clsx("text-sm font-medium text-slate-700", props.className)}
    />
  );
}
