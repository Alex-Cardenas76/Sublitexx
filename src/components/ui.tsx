"use client";

import type { ReactNode } from "react";
import { statusLabel, statusTone } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";

export function Card({
  children,
  className = "",
  title,
  subtitle,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ${className}`}>
      {title && (
        <header className="border-b border-border/70 px-5 pt-4 pb-3">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-mute">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    gray: "bg-gray-100 text-ink-soft",
    green: "bg-ok-bg text-ok",
    amber: "bg-warn-bg text-warn",
    red: "bg-error-bg text-error",
    blue: "bg-info-bg text-info",
    dark: "bg-ink text-white",
  };  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone] ?? tones.gray}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = statusTone(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {statusLabel(status)}
    </span>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "dark";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-primary text-white hover:bg-primary-600 shadow-sm disabled:opacity-50",
    dark: "bg-ink text-white hover:bg-black disabled:opacity-50",
    ghost:
      "bg-surface border border-border text-ink hover:bg-canvas disabled:opacity-50",
    danger: "bg-white border border-error text-error hover:bg-error-bg disabled:opacity-50",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-mute">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px cursor-pointer rounded-t-lg px-4 py-2.5 text-sm font-medium ${
            active === t.id
              ? "border-b-2 border-primary text-primary"
              : "text-ink-soft hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyModule({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-mute/40 bg-surface px-6 py-12 text-center">
      <p className="text-sm font-semibold text-ink-soft">{title}</p>
      {children && (
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-ink-mute">{children}</p>
      )}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-error"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-mute">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-primary focus:ring-2 focus:ring-primary/15 ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-primary focus:ring-2 focus:ring-primary/15 ${props.className ?? ""}`}
    />
  );
}

export function Check({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}