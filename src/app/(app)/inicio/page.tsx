"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Card } from "@/components/ui";
import OrderCard from "@/components/order/OrderCard";
import { useSession } from "@/lib/session";
import { useStoreVersion, getOrders, getParticipants } from "@/lib/store";
import { buildAttentionList, analytics } from "@/lib/summary";
import { statusIndex } from "@/lib/status";
import { canSeeOrder } from "@/lib/permissions";
import { useMounted } from "@/lib/hooks";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function Stat({ label, value, tone = "dark" }: { label: string; value: number; tone?: string }) {
  const tones: Record<string, string> = {
    dark: "bg-ink text-white",
    green: "bg-primary text-white",
    amber: "bg-warn text-white",
    red: "bg-error text-white",
  };
  return (
    <div className={`rounded-2xl px-5 py-4 ${tones[tone]}`}>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold opacity-80">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const mounted = useMounted();
  const { role } = useSession();
  useStoreVersion();

  if (!mounted) return <div className="h-64" />;

  const orders = getOrders().filter((o) => canSeeOrder(o, role.id));
  const recent = [...orders].sort((a, b) => (a.date < b.date ? 1 : -1));
  const notes = buildAttentionList(orders);

  const children = orders.map((o) => {
    const p = getParticipants(o.id);
    return { o, a: analytics(o, p), i: statusIndex(o.status) };
  });

  const enProcesoCount = children.filter((c) => c.i >= 2 && c.i <= 11).length;
  const porRevisar = children.filter(
    (c) => c.o.status === "lista_validacion" || c.o.status === "participantes_incompletos" || notes.some((n) => n.orderId === c.o.id && n.level === "error")
  ).length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{greeting()}</h1>
        <p className="text-sm text-ink-soft">
          {role.label} · Resumen operativo del día
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="PEDIDOS" value={orders.length} tone="dark" />
        <Stat label="EN PROCESO" value={enProcesoCount} tone="green" />
        <Stat label="POR REVISAR" value={porRevisar} tone={porRevisar > 0 ? "amber" : "green"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-mute">
              Pedidos recientes
            </h2>
            <Link
              href="/pedidos"
              className="text-sm font-semibold text-primary hover:text-primary-600"
            >
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {recent.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-mute">
            <Icon.alert className="h-4 w-4" /> Requieren atención
          </h2>
          <Card className="overflow-hidden">
            {notes.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-mute">
                Sin pendientes para tu rol.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {notes.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/pedidos/${n.orderId}`}
                      className="flex items-start gap-2.5 px-5 py-3 hover:bg-canvas"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                          n.level === "error" ? "bg-error" : "bg-warn"
                        }`}
                      >
                        !
                      </span>
                      <div>
                        <p className="text-xs font-bold text-ink">{n.orderCode}</p>
                        <p className="text-xs leading-relaxed text-ink-soft">{n.text}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

