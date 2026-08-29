"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { PageHeader, Input } from "@/components/ui";
import OrderCard from "@/components/order/OrderCard";
import { useSession } from "@/lib/session";
import { useStoreVersion, getOrders } from "@/lib/store";
import { canSeeOrder, canManageOrders } from "@/lib/permissions";
import { useMounted } from "@/lib/hooks";
import { statusIndex } from "@/lib/status";

type Filter = "todos" | "activos" | "pendientes" | "cerrados";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "activos", label: "Activos" },
  { id: "pendientes", label: "Pendientes" },
  { id: "cerrados", label: "Cerrados" },
];

export default function OrdersPage() {
  const mounted = useMounted();
  const { role } = useSession();
  useStoreVersion();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");

  if (!mounted) return <div className="h-64" />;

  const all = getOrders().filter((o) => canSeeOrder(o, role.id));
  const canCreate = canManageOrders(role.id);

  const filtered = all.filter((o) => {
    const i = statusIndex(o.status);
    const isActive = i >= 2 && i <= 12;
    const isPending = o.status === "lista_validacion" || o.status === "participantes_incompletos" || o.status === "creado" || o.status === "info_pendiente" || o.status === "diseno_aprobado";
    const isClosed = i >= 13;
    const inFilter =
      filter === "todos" ||
      (filter === "activos" && isActive) ||
      (filter === "pendientes" && isPending) ||
      (filter === "cerrados" && isClosed);
    const inQuery =
      !q ||
      o.id.toLowerCase().includes(q.toLowerCase()) ||
      o.client.toLowerCase().includes(q.toLowerCase()) ||
      o.config.product.toLowerCase().includes(q.toLowerCase());
    return inFilter && inQuery;
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Operación"
        title="Pedidos"
        description="Único pedido central por cliente. Toda la información vive dentro de él."
        actions={
          canCreate ? (
            <Link
              href="/pedidos/nuevo"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
            >
              + Nuevo pedido
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon.search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <Input
            placeholder="Buscar por pedido, cliente o producto..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ${
                filter === f.id ? "bg-primary text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-mute/40 bg-surface px-6 py-10 text-center text-sm text-ink-mute">
          No hay pedidos que coincidan con tu búsqueda.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}