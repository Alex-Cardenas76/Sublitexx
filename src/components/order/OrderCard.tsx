"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { StatusBadge } from "@/components/ui";
import { getParticipants } from "@/lib/store";
import { analytics } from "@/lib/summary";
import type { Order } from "@/lib/types";

export default function OrderCard({ order }: { order: Order }) {
  const participants = getParticipants(order.id);
  const a = analytics(order, participants);
  const pct =
    order.config.quantity > 0
      ? Math.round((Math.min(a.completo, order.config.quantity) / order.config.quantity) * 100)
      : 0;

  return (
    <Link
      href={`/pedidos/${order.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.25)]"
    >
      {/* top accent line on hover */}
      <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Icon.package className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-base font-extrabold tracking-tight text-ink">{order.id}</p>
            <p className="text-sm font-semibold text-ink-soft">{order.client}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* progress */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="text-ink-mute">Avance del registro</span>
          <span className="font-bold tabular-nums text-ink">
            {a.completo}<span className="text-ink-mute">/{order.config.quantity}</span> · {pct}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-4">
        <Meta label="Producto" value={order.config.product} />
        <Meta label="Contratado" value={`${order.config.quantity} pax`} />
        <Meta label="Componentes" value={kitText(order)} />
        <Meta label="Fecha" value={order.date} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="truncate text-xs text-ink-mute">
          {order.seller} · {order.coordinator || "Sin coordinador"}
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
          Ver pedido
          <Icon.chevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function kitText(order: Order): string {
  const parts: string[] = [];
  if (order.config.components.camiseta) parts.push("Camiseta");
  if (order.config.components.short) parts.push("Short");
  if (order.config.components.medias) parts.push("Medias");
  return parts.join(", ") || "—";
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-mute">{label}</p>
      <p className="truncate text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
