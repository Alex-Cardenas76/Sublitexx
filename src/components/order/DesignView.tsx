"use client";

import { Badge, Card } from "@/components/ui";
import { statusTone } from "@/lib/status";
import type { Order } from "@/lib/types";

export default function DesignView({ order }: { order: Order }) {
  const d = order.design;
  const tone = statusTone(order.status);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <Card title="Propuesta de diseño" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <p className="text-sm font-bold text-ink">{d.propuesta}</p>
            <p className="text-xs text-ink-mute">
              Versión {d.version || "—"} · archivo: {d.archivo || "—"}
            </p>
          </div>
          <Badge tone={d.estado === "aprobado" ? "green" : d.estado === "revision" ? "amber" : "gray"}>
            {d.estado === "aprobado" ? "Aprobado" : d.estado === "revision" ? "En revisión" : "Pendiente"}
          </Badge>
        </div>
        <div className="bg-canvas px-5 py-6">
          <div className="mx-auto flex h-52 w-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-mute/40 bg-white">
            <p className="px-3 text-center text-[10px] uppercase tracking-wide text-ink-mute">
              Vista previa del diseño aprobado <span className="font-bold">v1</span>
            </p>
            <div className="mt-4 flex gap-2">
              {d.colores.map((c) => (
                <span
                  key={c}
                  className="h-8 w-8 rounded-full border border-black/10"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <p className="mt-4 text-[10px] text-ink-mute">Bobina {order.id}</p>
          </div>
        </div>
        <div className="grid gap-2 border-t border-border px-5 py-3 text-xs sm:grid-cols-2">
          <Kv label="Aprobado por" value={d.aprobadoPor ?? "—"} />
          <Kv label="Fecha de aprobación" value={d.fechaAprobacion ?? "—"} />
          <Kv label="Telas / colores" value={order.config.colors.join(", ") || "—"} />
          <Kv label="Collar" value={order.config.collar || "—"} />
        </div>
      </Card>

      <div className="space-y-5">
        <Card title="Características para diseño y producción">
          <ul className="space-y-2 px-5 py-4 text-sm text-ink-soft">
            <li>· Tela: <b>{order.config.tela || "—"}</b></li>
            <li>· Cuello: <b>{order.config.collar || "—"}</b></li>
            <li>· Especiales: <b>{order.config.specialFeatures.join(", ") || "—"}</b></li>
            <li>
              · Colores de arquero: <b>{order.config.goalkeeperColors.join(", ")}</b>
            </li>
          </ul>
        </Card>

        <Card title="Información para diseño (sin datos comerciales)">
          <div className="px-5 py-4 text-xs">
            <p className="mb-2 text-sm font-bold text-ink">
              {order.config.product} · {order.config.quantity} participantes
            </p>
            <p className="mb-3 flex items-center gap-2 text-ink-soft">
              Estado del pedido:
              <Badge tone={tone.badge.includes("green") ? "green" : "gray"}> {order.status}</Badge>
            </p>
            {order.exceptions.length > 0 && (
              <div className="rounded-lg bg-warn-bg px-3 py-2 text-warn">
                Hay {order.exceptions.length} excepción(es) que considerar.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-1 last:border-0">
      <span className="text-ink-mute">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}