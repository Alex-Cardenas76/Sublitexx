"use client";

import { Badge, Card } from "@/components/ui";
import { analytics } from "@/lib/summary";
import type { Order } from "@/lib/types";

export default function ProductionView({ order }: { order: Order }) {
  const parts = order.participants;
  const a = analytics(order, parts);

  const tables: { title: string; rows: [string, string][] }[] = [
    {
      title: "Cantidades por talla",
      rows: Object.entries(a.porTalla)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => [k, String(n)]),
    },
    {
      title: "Cantidades por producto",
      rows: Object.entries(a.porProducto).map(([k, n]) => [k, String(n)]),
    },
    {
      title: "Componentes",
      rows: Object.entries(a.comoComponentes).map(([k, n]) => [k, String(n)]),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        {tables.map((t) => (
          <Card key={t.title} title={t.title}>
            <table className="w-full px-5 py-2 text-sm">
              <tbody>
                {t.rows.map(([k, v]) => (
                  <tr key={k} className="border-b border-border/60 last:border-0">
                    <td className="py-2 text-ink-soft">{k}</td>
                    <td className="py-2 text-right font-bold text-ink">{v}</td>
                  </tr>
                ))}
                {t.rows.length === 0 && (
                  <tr>
                    <td className="py-3 text-ink-mute">—</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        ))}
      </div>

      <Card title="Información operativa">
        <div className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">Metraje</p>
            <p className="font-semibold text-ink">{order.production.metraje || "Pendiente"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">Proveedor tela</p>
            <p className="font-semibold text-ink">{order.production.proveedorTela || "Pendiente"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">Proveedor costura</p>
            <p className="font-semibold text-ink">{order.production.proveedorCostura || "Pendiente"}</p>
          </div>
        </div>
        <div className="border-t border-border px-5 py-3 text-xs text-ink-soft">
          <p className="mb-1 font-bold uppercase tracking-wide text-ink-mute">Observaciones</p>
          {order.production.notas || "Sin observaciones."}
        </div>
      </Card>

      {order.config.components.escudo && (
        <div className="flex items-center gap-2 rounded-xl bg-info-bg px-4 py-3 text-xs text-info">
          <Badge tone="blue">Referencia diseño</Badge>
          El diseño aprobado ({order.design.version}) es la única fuente para impresión y bordado. No
          se ingresa nuevamente la información.
        </div>
      )}
    </div>
  );
}