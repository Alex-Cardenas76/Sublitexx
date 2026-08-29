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

  return (
    <Link
      href={`/pedidos/${order.id}`}
      className="block rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-extrabold text-ink">{order.id}</p>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm font-semibold text-ink-soft">Cliente: {order.client}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Meta label="Producto" value={order.config.product} />
        <Meta label="Contratado" value={`${order.config.quantity} pax`} />
        <Meta label="Registrados" value={`${a.completo}/${order.config.quantity}`} />
        <Meta label="Fecha" value={order.date} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <p className="text-xs text-ink-mute">
          {order.seller} · {order.coordinator || "Sin coordinador"}
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Ver pedido <Icon.chevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-mute">{label}</p>
      <p className="truncate text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}