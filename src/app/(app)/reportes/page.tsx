"use client";

import Link from "next/link";
import { Card, EmptyModule, PageHeader } from "@/components/ui";
import { useSession } from "@/lib/session";
import { useStoreVersion, getOrders, getParticipants } from "@/lib/store";
import { analytics } from "@/lib/summary";
import { canSeeFinanceModule } from "@/lib/permissions";
import { useMounted } from "@/lib/hooks";

export default function ReportsPage() {
  const mounted = useMounted();
  const { role } = useSession();
  useStoreVersion();

  if (!mounted) return <div className="h-64" />;

  if (!canSeeFinanceModule(role.id)) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Reportes" />
        <EmptyModule title="Módulo restringido">
          Los reportes consolidados están disponibles para roles autorizados.
        </EmptyModule>
      </div>
    );
  }

  const orders = getOrders();
  const rows = orders.map((o) => {
    const a = analytics(o, getParticipants(o.id));
    return { o, a };
  });
  const totals = rows.reduce(
    (acc, r) => ({
      participants: acc.participants + r.a.total,
      completo: acc.completo + r.a.completo,
      prendas: acc.prendas + r.a.camisetas,
    }),
    { participants: 0, completo: 0, prendas: 0 }
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Información"
        title="Reportes"
        description="Resúmenes operativos consolidados, calculados desde el pedido central."
      />

      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Participantes invitados" value={totals.participants} />
        <Stat label="Registros completos" value={totals.completo} />
        <Stat label="Prendas (camisetas)" value={totals.prendas} tone="green" />
      </div>

      <Card title="Resumen por pedido" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas text-[11px] uppercase tracking-wide text-ink-mute">
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Tallaje</th>
                <th className="px-4 py-3 font-semibold">Registrados</th>
                <th className="px-4 py-3 font-semibold">Pendientes</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ o, a }) => {
                const tallas = Object.entries(a.porTalla)
                  .filter(([, n]) => n > 0)
                  .map(([k, n]) => `${k}:${n}`)
                  .join(" · ");
                return (
                  <tr key={o.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-bold text-ink">{o.id}</td>
                    <td className="px-4 py-3 text-ink-soft">{o.client}</td>
                    <td className="px-4 py-3 text-ink-soft">{tallas || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-ok">{a.completo}</td>
                    <td className="px-4 py-3 text-warn">{a.pendiente}</td>
                    <td className="px-4 py-3">
                      <Link href={`/pedidos/${o.id}`} className="text-xs font-semibold text-primary hover:text-primary-600">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone = "dark" }: { label: string; value: number; tone?: string }) {
  const tones: Record<string, string> = {
    dark: "bg-ink text-white",
    green: "bg-ink text-white",
  };
  return (
    <div className={`rounded-2xl px-4 py-4 ${tones[tone]}`}>
      <p className="text-xl font-extrabold tabular-nums sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">{label}</p>
    </div>
  );
}