"use client";

import { Icon } from "@/components/icons";
import { STATUS_FLOW, statusIndex } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";

interface Phase {
  key: string;
  label: string;
  keys: OrderStatus[];
}

const PHASES: Phase[] = [
  { key: "pedido", label: "Pedido", keys: ["creado", "info_pendiente"] },
  { key: "diseno", label: "Diseño", keys: ["diseno_pendiente", "diseno_revision", "diseno_aprobado"] },
  { key: "participantes", label: "Participantes", keys: ["registro_abierto", "participantes_incompletos"] },
  { key: "validacion", label: "Validación", keys: ["lista_validacion", "lista_cerrada"] },
  { key: "produccion", label: "Producción", keys: ["diseno_tecnico", "listo_produccion", "en_produccion", "terminado"] },
  { key: "cierre", label: "Cierre", keys: ["entregado", "cerrado"] },
];

const PHASE_META: Record<string, string> = {
  pedido: "Datos base del pedido e información del cliente",
  diseno: "Propuesta, revisión y aprobación del arte",
  participantes: "Registro de jugadores y cobros",
  validacion: "Revisión y cierre de la lista",
  produccion: "Diseño técnico, producción y terminado",
  cierre: "Entrega y cierre del pedido",
};

export default function StatusStepper({ status }: { status: OrderStatus }) {
  const current = statusIndex(status);

  const currentStatus = STATUS_FLOW.find((s) => s.key === status)!;
  const currentPhase = currentStatus.phase;
  const activePhaseIndex = PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <div>
      {/* Phase-level progress */}
      <div className="overflow-x-auto pb-2">
        <ol className="flex min-w-max items-center">
          {PHASES.map((phase, i) => {
            const isDone = i < activePhaseIndex;
            const isActive = i === activePhaseIndex;
            return (
              <li key={phase.key} className="flex items-center">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-primary text-white ring-4 ring-primary/20"
                        : isDone
                          ? "bg-primary-100 text-primary-600"
                          : "bg-gray-100 text-ink-mute"
                    }`}
                  >
                    {isDone ? (
                      <Icon.check className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className={`whitespace-nowrap text-xs font-semibold ${
                      isActive ? "text-primary" : isDone ? "text-ink" : "text-ink-mute"
                    }`}
                  >
                    {phase.label}
                  </span>
                </div>
                {i < PHASES.length - 1 && (
                  <span
                    className={`mx-3 h-0.5 w-8 sm:w-14 ${i < activePhaseIndex ? "bg-primary-500" : "bg-gray-200"}`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Current phase detail */}
      <div className="mt-3 rounded-xl border border-border bg-canvas px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">
              {currentPhase !== "cierre" ? `Fase de ${currentStatus.phase}. ` : "Fase final. "}
              <span className="text-primary">{currentStatus.label}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-ink-mute">{PHASE_META[currentPhase]}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
            Paso {current + 1} de {STATUS_FLOW.length}
          </span>
        </div>

        {/* Statuses within the active phase */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {PHASES[activePhaseIndex].keys.map((k) => {
            const idx = statusIndex(k);
            const isDone = idx < current;
            const isActive = idx === current;
            const s = STATUS_FLOW.find((f) => f.key === k)!;
            return (
              <span
                key={k}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                  isActive
                    ? "bg-primary text-white"
                    : isDone
                      ? "bg-primary-100 text-primary-600"
                      : "bg-white text-ink-mute"
                }`}
              >
                {isDone && <Icon.check className="h-3 w-3" />}
                {s.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
