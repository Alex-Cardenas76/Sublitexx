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
  const completado = children.filter((c) => c.a.completo > 0).reduce((s, c) => s + c.a.completo, 0);

  const initials = role.user.split(" ").map((w) => w[0]).join("");

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-ink px-6 py-8 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/[0.06] blur-2xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-white/[0.05] blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {role.label}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {greeting()}, {initials || role.user}
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/60">
              Resumen operativo del día · {orders.length} pedido(s) a tu alcance
            </p>
          </div>
          <div className="flex gap-6 text-right">
            <HeroStat value={orders.length} label="Pedidos" />
            <HeroStat value={enProcesoCount} label="En proceso" />
            <HeroStat value={porRevisar} label="Por revisar" tone={porRevisar > 0 ? "alert" : "ok"} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink-mute">
              Pedidos recientes
            </h2>
            <Link
              href="/pedidos"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors hover:text-primary"
            >
              Ver todos
              <Icon.chevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recent.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-ink-mute">
            <Icon.alert className="h-4 w-4" /> Requieren atención
          </h2>
          <Card className="overflow-hidden">
            {notes.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ok-bg text-ok">
                  <Icon.check className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-ink">Sin pendientes</p>
                <p className="text-xs text-ink-mute">Todo listo para tu rol.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notes.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/pedidos/${n.orderId}`}
                      className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-canvas"
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                          n.level === "error" ? "bg-ink" : "bg-ink-soft"
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

function HeroStat({
  value,
  label,
  tone = "ok",
}: {
  value: number;
  label: string;
  tone?: "ok" | "alert";
}) {
  return (
    <div>
      <p className={`text-3xl font-extrabold tabular-nums sm:text-4xl ${tone === "alert" ? "text-white" : "text-white"}`}>
        {value}
      </p>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${tone === "alert" ? "text-white/90" : "text-white/60"}`}>
        {label}
      </p>
    </div>
  );
}
