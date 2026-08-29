"use client";

import { Card } from "@/components/ui";
import { getOrderHistory } from "@/lib/store";

export default function HistoryView({ orderId }: { orderId: string }) {
  const history = getOrderHistory(orderId);

  return (
    <Card title="Historial de cambios" subtitle="Auditoría: quién modificó un dato y su versión anterior.">
      {history.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-mute">Sin cambios registrados.</p>
      ) : (
        <ul className="divide-y divide-border">
          {[...history].reverse().map((h) => (
            <li key={h.id} className="flex flex-wrap items-start gap-3 px-5 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-600">
                {h.role.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  {h.field}: <span className="text-error line-through">{h.oldValue}</span>{" "}
                  <span className="text-ink-mute">→</span>{" "}
                  <span className="text-ok">{h.newValue}</span>
                </p>
                <p className="mt-0.5 text-xs text-ink-mute">
                  {h.user} · {h.role} · {h.date}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}