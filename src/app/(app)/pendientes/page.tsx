"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import OrderCard from "@/components/order/OrderCard";
import { useSession } from "@/lib/session";
import { useStoreVersion, getOrders, getParticipants } from "@/lib/store";
import { buildAttentionList, validateOrder } from "@/lib/summary";
import { canSeeOrder, canValidate } from "@/lib/permissions";
import { useMounted } from "@/lib/hooks";

export default function PendingPage() {
  const mounted = useMounted();
  const { role } = useSession();
  useStoreVersion();

  if (!mounted) return <div className="h-64" />;

  const orders = getOrders().filter((o) => canSeeOrder(o, role.id));
  const notes = buildAttentionList(orders);
  const reviewOrders = orders.filter((o) => {
    const issues = validateOrder(o, getParticipants(o.id));
    return o.status === "lista_validacion" || issues.some((i) => i.level === "error");
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Cola de trabajo"
        title="Pendientes / Validaciones"
        description="Problemas detectados automáticamente desde el pedido central."
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-mute">
            Requieren atención
          </h2>
          <Card className="overflow-hidden">
            {notes.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-mute">
                ✓ Todo en orden para tu rol.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {notes.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/pedidos/${n.orderId}`}
                      className="flex items-start gap-3 px-5 py-3.5 hover:bg-canvas"
                    >
                      <Icon.alert
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          n.level === "error" ? "text-error" : "text-warn"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink">{n.orderCode}</p>
                        <p className="text-sm text-ink-soft">{n.text}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-mute">
            Pedidos por revisar
          </h2>
          <div className="space-y-3">
            {(canValidate(role.id) ? reviewOrders : []).map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
            {reviewOrders.length === 0 && (
              <p className="text-sm text-ink-mute">Nada por revisar.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-mute">
            Todos los pedidos activos
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-mute">
            {orders.length} pedidos visibles para el rol actual.
          </p>
        </div>
      </div>
    </div>
  );
}