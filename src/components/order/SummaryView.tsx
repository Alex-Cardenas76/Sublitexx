"use client";

import { Card } from "@/components/ui";
import { analytics } from "@/lib/summary";
import type { Order } from "@/lib/types";

export default function SummaryView({
  order,
  variant = "full",
}: {
  order: Order;
  variant?: "full" | "compact";
}) {
  const participants = order.participants;
  const a = analytics(order, participants);

  const blocks: { title: string; rows: [string, string][] }[] = [
    {
      title: "Resumen general",
      rows: [
        ["Total de prendas", String(a.camisetas)],
        ["Total de camisetas", String(a.camisetas)],
        ["Total de conjuntos", String(a.conjuntos)],
        ["Total de shorts", String(a.shorts)],
        ["Total de medias", String(a.medias)],
      ],
    },
    {
      title: "Resumen por talla",
      rows: Object.entries(a.porTalla)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => [`Talla ${k}`, String(n)]),
    },
    {
      title: "Resumen por producto",
      rows: Object.entries(a.porProducto).map(([k, n]) => [k, String(n)]),
    },
    {
      title: "Resumen por componente",
      rows: Object.entries(a.comoComponentes).map(([k, n]) => [k, String(n)]),
    },
    {
      title: "Resumen de participantes",
      rows: [
        ["Completos", String(a.completo)],
        ["Pendientes", String(a.pendiente)],
        ["Contratados", String(order.config.quantity)],
      ],
    },
  ];

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-6">
        {blocks.map((b) => (
          <div key={b.title}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink-mute">{b.title}</p>
            <div className="flex flex-wrap gap-3">
              {b.rows.map(([k, v]) => (
                <span key={k} className="rounded-lg bg-canvas px-2.5 py-1 text-xs text-ink">
                  {k}: <b>{v}</b>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {blocks.map((b) => (
        <Card key={b.title} title={b.title}>
          <table className="w-full px-5 py-2 text-sm">
            <tbody>
              {b.rows.map(([k, v]) => (
                <tr key={k} className="border-b border-border/60 last:border-0">
                  <td className="py-2 text-ink-soft">{k}</td>
                  <td className="py-2 text-right font-bold text-ink">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
}