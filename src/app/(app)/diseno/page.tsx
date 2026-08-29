"use client";

import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/ui";
import { useSession } from "@/lib/session";
import { useStoreVersion, getOrders, getParticipants, getOrderStatus } from "@/lib/store";
import { canSeeOrder, canSeeMargin } from "@/lib/permissions";
import { useMounted } from "@/lib/hooks";

export default function DesignModulePage() {
  const mounted = useMounted();
  const { role } = useSession();
  useStoreVersion();

  if (!mounted) return <div className="h-64" />;

  const orders = getOrders().filter((o) => canSeeOrder(o, "diseno"));
  const confidential = canSeeMargin(role.id);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Creación"
        title="Diseño"
        description="Solo información necesaria para diseño y producción. Sin datos comerciales."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {orders.map((o) => {
          const status = getOrderStatus(o.id);
          const participants = getParticipants(o.id);
          const done = participants.filter((p) => p.registrationStatus === "completo").length;
          const tone =
            o.design.estado === "aprobado" ? "green" : o.design.estado === "revision" ? "amber" : "gray";
          return (
            <Card key={o.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2 px-5 py-4">
                <div>
                  <Link href={`/pedidos/${o.id}`} className="text-base font-extrabold text-ink hover:text-primary">
                    {o.id}
                  </Link>
                  <p className="text-sm text-ink-soft">{o.client}</p>
                </div>
                <Badge tone={tone}>
                  {o.design.estado === "aprobado" ? "Aprobado" : o.design.estado === "revision" ? "En revisión" : "Pendiente"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3 text-xs">
                <span className="rounded-lg bg-canvas px-2.5 py-1 text-ink">
                  {o.design.propuesta}
                </span>
                <span className="rounded-lg bg-canvas px-2.5 py-1 text-ink">{o.design.version || "sin versión"}</span>
                <span className="rounded-lg bg-canvas px-2.5 py-1 text-ink">
                  {done}/{o.config.quantity} registrados
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-ink-mute">
                <span>Estado: {status.replaceAll("_", " ")}</span>
                {o.exceptions.length > 0 && (
                  <span className="font-semibold text-warn">
                    {o.exceptions.length} excepción(es) a considerar
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 px-5 pb-4">
                {o.design.colores.map((c) => (
                  <span key={c} className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                ))}
              </div>
            </Card>
          );
        })}
        {orders.length === 0 && (
          <Card className="p-8 text-center text-sm text-ink-mute col-span-2">
            No hay pedidos en fase de diseño para este rol.
          </Card>
        )}
      </div>

      {confidential && (
        <p className="mt-4 text-xs text-ink-mute">
          Nota para administración: el módulo de Diseño oculta los datos comerciales de forma
          automática por permisos.
        </p>
      )}
    </div>
  );
}