"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/session";
import { useStoreVersion, getOrders, getParticipants, getOrderStatus } from "@/lib/store";
import { canSeeOrder, canSeeMargin } from "@/lib/permissions";
import { useMounted } from "@/lib/hooks";
import type { Order } from "@/lib/types";

/* ─── color helpers ─────────────────────────────────────────────── */

const COLOR_HEX: Record<string, string> = {
  "Azul marino": "#1e3a8a",
  "Rojo": "#dc2626",
  "Blanco": "#ffffff",
  "Negro": "#111827",
  "Verde": "#16a34a",
  "Amarillo": "#eab308",
  "Celeste": "#0ea5e9",
  "Gris": "#6b7280",
  "Naranja": "#f97316",
  "Morado": "#7c3aed",
};

function statusDisplay(order: Order): { label: string; color: string; dot: string } {
  const st = order.status;
  const ds = order.design.estado;
  if (st === "creado" || st === "info_pendiente" || st === "diseno_pendiente")
    return { label: "Pendiente", color: "bg-canvas text-ink-soft border-gray-200", dot: "bg-ink-mute" };
  if (st === "diseno_revision" || ds === "revision")
    return { label: "En Revisión", color: "bg-canvas text-ink border-gray-300", dot: "bg-ink" };
  if (ds === "aprobado" && ["registro_abierto", "participantes_incompletos", "lista_validacion"].includes(st))
    return { label: "Aprobado — En Registro", color: "bg-canvas text-ink border-gray-300", dot: "bg-ink" };
  if (st === "lista_validacion" || st === "lista_cerrada" || st === "diseno_tecnico")
    return { label: "Listo para Imprenta", color: "bg-white text-ink border-gray-300", dot: "bg-ink" };
  return { label: getOrderStatus(order.id).replaceAll("_", " "), color: "bg-gray-100 text-ink-soft border-gray-200", dot: "bg-gray-400" };
}

function colorName(hex: string): string {
  const entry = Object.entries(COLOR_HEX).find(([, v]) => v === hex);
  return entry ? entry[0] : hex;
}

/* ─── tabs ──────────────────────────────────────────────────────── */

type TabId = "todos" | "formulario" | "vectorizacion" | "excepciones" | "listos";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "todos", label: "Todos", icon: "" },
  { id: "formulario", label: "Esperando Formulario", icon: "" },
  { id: "vectorizacion", label: "En Vectorización", icon: "" },
  { id: "excepciones", label: "Con Excepciones", icon: "⚠️" },
  { id: "listos", label: "Listos para Imprenta", icon: "✅" },
];

/* ─── design phase filter ───────────────────────────────────────── */

function designPhaseFilter(o: Order, tab: TabId): boolean {
  if (tab === "todos") return true;
  if (tab === "excepciones") return o.exceptions.length > 0;
  if (tab === "formulario")
    return ["registro_abierto", "participantes_incompletos", "lista_validacion"].includes(o.status);
  if (tab === "vectorizacion")
    return ["creado", "info_pendiente", "diseno_pendiente", "diseno_revision"].includes(o.status);
  if (tab === "listos") return o.design.estado === "aprobado";
  return true;
}

/* ═════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                 */
/* ═════════════════════════════════════════════════════════════════ */

export default function DesignDashboard() {
  const mounted = useMounted();
  const { role } = useSession();
  useStoreVersion();
  const confidential = canSeeMargin(role.id);

  const [tab, setTab] = useState<TabId>("todos");
  const [query, setQuery] = useState("");

  if (!mounted) return <div className="h-64" />;

  const base = getOrders().filter((o) => canSeeOrder(o, "diseno"));
  const q = query.trim().toLowerCase();
  const filtered = base.filter((o) => {
    if (!designPhaseFilter(o, tab)) return false;
    if (q && !o.id.toLowerCase().includes(q) && !o.client.toLowerCase().includes(q)) return false;
    return true;
  });

  const kpi = {
    enCola: base.filter((o) => ["creado", "info_pendiente", "diseno_pendiente", "diseno_revision"].includes(o.status)).length,
    enTrabajo: base.filter((o) => o.design.estado === "aprobado" && ["registro_abierto", "participantes_incompletos", "lista_validacion"].includes(o.status)).length,
    listos: base.filter((o) => o.design.estado === "aprobado" && ["lista_validacion", "lista_cerrada", "diseno_tecnico", "listo_produccion", "en_produccion"].includes(o.status)).length,
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            Bandeja de Diseño
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            Pedidos pendientes, en revisión y aprobados del área de Diseño
          </p>
        </div>
      </div>

      {/* ── KPI CHIPS ───────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-ink-soft">
          📋 {base.length} en cola
        </span>
        <span className="rounded-full border border-gray-300 bg-canvas px-3.5 py-1.5 text-ink">
          🎨 {kpi.enCola} en diseño
        </span>
        <span className="rounded-full border border-gray-300 bg-canvas px-3.5 py-1.5 text-ink">
          ✏️ {kpi.enTrabajo} en registro
        </span>
        <span className="rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-ink">
          ✅ {kpi.listos} listos
        </span>
      </div>

      {/* ── FILTER TABS ─────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => {
          const active = tab === t.id;
          const count =
            t.id === "excepciones"
              ? base.filter((o) => o.exceptions.length > 0).length
              : t.id === "formulario"
                ? base.filter((o) => ["registro_abierto", "participantes_incompletos", "lista_validacion"].includes(o.status)).length
                : t.id === "vectorizacion"
                  ? base.filter((o) => ["creado", "info_pendiente", "diseno_pendiente", "diseno_revision"].includes(o.status)).length
                  : t.id === "listos"
                    ? base.filter((o) => o.design.estado === "aprobado").length
                    : base.length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px cursor-pointer whitespace-nowrap rounded-t-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                active
                  ? "border-b-2 border-primary bg-white text-primary"
                  : "text-ink-soft hover:bg-slate-50 hover:text-ink"
              }`}
            >
              {t.icon && <span className="mr-1">{t.icon}</span>}
              {t.label}
              <span className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                active ? "bg-primary/10 text-primary" : "bg-slate-100 text-ink-mute"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── SEARCH BAR ──────────────────────────────────────────── */}
      <div className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código o cliente…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink-mute focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-ink-soft transition-colors hover:border-primary/30 hover:text-ink cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros Avanzados
        </button>
      </div>

      {/* ── CARDS ───────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-ink-soft">No hay pedidos en esta vista</p>
          <p className="mt-1 text-xs text-ink-mute">Intenta cambiar el filtro o la búsqueda.</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((order) => {
          const st = statusDisplay(order);
          const participants = getParticipants(order.id);
          const done = participants.filter((p) => p.registrationStatus === "completo").length;
          const total = order.config.quantity;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const hasExc = order.exceptions.length > 0;
          const designColors = order.design.colores.map((c) => (COLOR_HEX[c] ?? c));

          return (
            <Link
              key={order.id}
              href={`/pedidos/${order.id}/diseno`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-ink group-hover:text-primary transition-colors">{order.id}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink-soft">{order.client}</p>
                  <p className="mt-0.5 text-[11px] text-ink-mute">
                    {order.config.quantity} prendas · {order.config.product}
                  </p>
                </div>
                <span className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${st.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                  {st.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="px-5 pb-3">
                <div className="flex items-center justify-between text-[11px] text-ink-mute">
                  <span>Registro: <span className="font-bold text-ink">{done}/{total}</span> participantes</span>
                  <span className="font-semibold text-ink">{pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100 ? "#16a34a" : pct > 50 ? "#0ea5e9" : "#f59e0b",
                    }}
                  />
                </div>
              </div>

              {/* Design Info Chips */}
              <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-5 py-2.5">
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                  🎨 {order.design.propuesta}
                </span>
                <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                  {order.design.version || "Sin versión"}
                </span>
                {designColors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-block h-5 w-5 rounded-full border border-black/10"
                    style={{ backgroundColor: c }}
                    title={colorName(c)}
                  />
                ))}
              </div>

              {/* Exception Banner */}
              {hasExc && (
                <div className="mx-5 my-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-medium text-ink-soft">
                  ⚠️ {order.exceptions.length} excepción(es):{" "}
                  {order.exceptions.map((e) => `${e.participant} — ${e.field}`).join(", ")}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                <span className="text-[11px] font-semibold text-primary group-hover:underline">
                  Ver diseño →
                </span>
                <span className="text-[10px] text-ink-mute">
                  {order.design.archivo || "Sin archivo"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {confidential && (
        <p className="mt-4 text-xs text-ink-mute">
          Nota para administración: el módulo de Diseño oculta los datos comerciales de forma automática por permisos.
        </p>
      )}
    </div>
  );
}