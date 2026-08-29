"use client";

import { Btn, Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { allowedTransitions } from "@/lib/status";
import { setStatus, getOrderExceptions, approveException } from "@/lib/store";
import { validateOrder, hasCritical } from "@/lib/summary";
import type { Order, RoleId } from "@/lib/types";

export default function ValidationView({
  order,
  role,
  currentUserName,
  currentUserRoleLabel,
}: {
  order: Order;
  role: RoleId;
  currentUserName: string;
  currentUserRoleLabel: string;
}) {
  const participants = order.participants;
  const issues = validateOrder(order, participants);
  const critical = hasCritical(order, participants);
  const exceptions = getOrderExceptions(order.id);

  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level !== "error");
  const transitions = allowedTransitions(order.status, role, critical);

  function advance(to: Parameters<typeof setStatus>[1]) {
    setStatus(order.id, to, currentUserName, currentUserRoleLabel);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <Card title="Problemas pendientes" className="overflow-hidden">
        {issues.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-soft">
            ✓ No se detectaron problemas. El pedido está consistente.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {[...errors, ...warns].map((v, i) => (
              <li key={i} className="flex items-start gap-2.5 px-5 py-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                    v.level === "error" ? "bg-error" : "bg-warn"
                  }`}
                >
                  !
                </span>
                <span className={`text-sm ${v.level === "error" ? "font-semibold text-error" : "text-ink-soft"}`}>
                  {v.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="space-y-5">
        <Card title="Gestión de estados">
          <div className="space-y-3 px-5 py-4">
            {critical && (
              <div className="rounded-xl border border-error/20 bg-error-bg px-4 py-3 text-xs font-medium text-error">
                El pedido tiene errores críticos. No puede avanzar a producción hasta resolverlos.
              </div>
            )}
            {transitions.length === 0 && (
              <p className="text-sm text-ink-mute">
                No hay acciones permitidas para tu rol en este estado.
              </p>
            )}
            {transitions.map((t) => (
              <Btn
                key={t.to}
                onClick={() => advance(t.to)}
                disabled={critical && role !== "administrador" && ["lista_validacion", "diseno_tecnico", "listo_produccion"].includes(order.status)}
                className="w-full"
              >
                {t.label} <Icon.chevronRight className="h-4 w-4" />
              </Btn>
            ))}
          </div>
        </Card>

        <Card title="Excepciones del pedido">
          <div className="px-5 py-4 text-sm">
            {exceptions.length === 0 ? (
              <p className="text-ink-mute">Sin excepciones.</p>
            ) : (
              <ul className="space-y-3">
                {exceptions.map((e) => (
                  <li key={e.id} className="rounded-xl border border-border bg-canvas px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {e.participant} — {e.field}: {e.value}
                        </p>
                        <p className="text-xs text-ink-mute">
                          Solicitada por {e.requestedBy ?? "—"} el {e.date}
                        </p>
                      </div>
                      {e.approved ? (
                        <span className="rounded-full bg-ok-bg px-2.5 py-1 text-xs font-semibold text-ok">
                          Aprobada
                        </span>
                      ) : (
                        <Btn
                          variant="ghost"
                          className="!px-3 !py-1.5 !text-xs"
                          onClick={() => approveException(order.id, e.id, currentUserName)}
                        >
                          Aprobar
                        </Btn>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}