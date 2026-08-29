"use client";

import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/ui";
import { useSession } from "@/lib/session";
import { useStoreVersion, getOrders, getParticipants, getOrderStatus } from "@/lib/store";
import { canSeeOrder } from "@/lib/permissions";
import { analytics } from "@/lib/summary";
import { useMounted } from "@/lib/hooks";

const PROD_STATUS = [
  "lista_validacion",
  "lista_cerrada",
  "diseno_tecnico",
  "listo_produccion",
  "en_produccion",
  "terminado",
  "entregado",
];

export default function ProductionModulePage() {
  const mounted = useMounted();
  const { role } = useSession();
  useStoreVersion();

  if (!mounted) return <div className="h-64" />;

  const orders = getOrders().filter(
    (o) => canSeeOrder(o, "produccion") || PROD_STATUS.includes(o.status)
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Ejecución"
        title="Producción"
        description="Cantidades, tallas, componentes y diseño aprobado. Sin información comercial."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {orders.map((o) => {
          const status = getOrderStatus(o.id);
          const a = analytics(o, getParticipants(o.id));
          const tallas = Object.entries(a.porTalla)
            .filter(([, n]) => n > 0)
            .map(([k, n]) => `${k}:${n}`);
          return (
            <Card key={o.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2 px-5 py-4">
                <div>
                  <Link href={`/pedidos/${o.id}`} className="text-base font-extrabold text-ink hover:text-primary">
                    {o.id}
                  </Link>
                  <p className="text-sm text-ink-soft">{o.client}</p>
                </div>
                <Badge tone="blue">{status.replaceAll("_", " ")}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 px-5 pb-3 text-xs">
                <span className="rounded-lg bg-canvas px-2.5 py-1 text-ink">
                  Camisetas: {a.camisetas}
                </span>
                <span className="rounded-lg bg-canvas px-2.5 py-1 text-ink">
                  Shorts: {a.shorts}
                </span>
                <span className="rounded-lg bg-canvas px-2.5 py-1 text-ink">
                  Medias: {a.medias}
                </span>
                {tallas.length > 0 && (
                  <span className="rounded-lg bg-canvas px-2.5 py-1 text-ink">{tallas.join(" · ")}</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-border px-5 py-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase text-ink-mute">Metraje</p>
                  <p className="font-semibold text-ink">{o.production.metraje || "Pendiente"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-ink-mute">Tela</p>
                  <p className="font-semibold text-ink">{o.production.proveedorTela || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-ink-mute">Costura</p>
                  <p className="truncate font-semibold text-ink">{o.production.proveedorCostura || "—"}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}