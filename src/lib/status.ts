import type { OrderStatus, RoleId } from "./types";

export const STATUS_FLOW: { key: OrderStatus; label: string; phase: string }[] = [
  { key: "creado", label: "Creado", phase: "pedido" },
  { key: "info_pendiente", label: "Información pendiente", phase: "pedido" },
  { key: "diseno_pendiente", label: "Diseño pendiente", phase: "diseno" },
  { key: "diseno_revision", label: "Diseño en revisión", phase: "diseno" },
  { key: "diseno_aprobado", label: "Diseño aprobado", phase: "diseno" },
  { key: "registro_abierto", label: "Registro abierto", phase: "participantes" },
  { key: "participantes_incompletos", label: "Participantes incompletos", phase: "participantes" },
  { key: "lista_validacion", label: "Lista en validación", phase: "validacion" },
  { key: "lista_cerrada", label: "Lista cerrada", phase: "validacion" },
  { key: "diseno_tecnico", label: "En diseño técnico", phase: "produccion" },
  { key: "listo_produccion", label: "Listo para producción", phase: "produccion" },
  { key: "en_produccion", label: "En producción", phase: "produccion" },
  { key: "terminado", label: "Terminado", phase: "produccion" },
  { key: "entregado", label: "Entregado", phase: "cierre" },
  { key: "cerrado", label: "Cerrado", phase: "cierre" },
];

export const statusLabel = (s: OrderStatus): string =>
  STATUS_FLOW.find((f) => f.key === s)?.label ?? s;

export const statusIndex = (s: OrderStatus): number =>
  STATUS_FLOW.findIndex((f) => f.key === s);

export function statusTone(s: OrderStatus): {
  dot: string;
  badge: string;
  chip: string;
} {
  const i = statusIndex(s);
  if (i < 2) return { dot: "bg-ink-mute", badge: "text-ink-soft bg-gray-100", chip: "border-gray-200" };
  if (i < 5) return { dot: "bg-info", badge: "text-info bg-info-bg", chip: "border-blue-100" };
  if (i < 7) return { dot: "bg-ok", badge: "text-ok bg-ok-bg", chip: "border-emerald-100" };
  if (i < 9) return { dot: "bg-warn", badge: "text-warn bg-warn-bg", chip: "border-amber-100" };
  if (i < 12) return { dot: "bg-primary-500", badge: "text-primary-600 bg-primary-100", chip: "border-emerald-100" };
  if (i < 14) return { dot: "bg-ink", badge: "text-ink bg-gray-100", chip: "border-gray-300" };
  return { dot: "bg-ink", badge: "text-ink bg-gray-100", chip: "border-gray-300" };
}

interface Transition {
  to: OrderStatus;
  label: string;
}

const TRANSITIONS: Partial<Record<OrderStatus, Transition[]>> = {
  creado: [{ to: "info_pendiente", label: "Completar información" }],
  info_pendiente: [{ to: "diseno_pendiente", label: "Iniciar diseño" }],
  diseno_pendiente: [{ to: "diseno_revision", label: "Enviar propuesta" }],
  diseno_revision: [{ to: "diseno_aprobado", label: "Aprobar diseño" }],
  diseno_aprobado: [{ to: "registro_abierto", label: "Abrir registro" }],
  registro_abierto: [
    { to: "lista_validacion", label: "Cerrar lista" },
    { to: "participantes_incompletos", label: "Marcar incompletos" },
  ],
  participantes_incompletos: [{ to: "lista_validacion", label: "Cerrar lista" }],
  lista_validacion: [{ to: "lista_cerrada", label: "Validar y cerrar lista" }],
  lista_cerrada: [{ to: "diseno_tecnico", label: "Enviar a diseño técnico" }],
  diseno_tecnico: [{ to: "listo_produccion", label: "Listo para producción" }],
  listo_produccion: [{ to: "en_produccion", label: "Iniciar producción" }],
  en_produccion: [{ to: "terminado", label: "Marcar terminado" }],
  terminado: [{ to: "entregado", label: "Registrar entrega" }],
  entregado: [{ to: "cerrado", label: "Cerrar pedido" }],
};

export function allowedTransitions(
  status: OrderStatus,
  role: RoleId,
  hasCritical: boolean
): Transition[] {
  const base = TRANSITIONS[status] ?? [];
  const editable =
    role === "administrador" || role === "coordinador_operativo";
  if (!editable) return [];

  if (
    hasCritical &&
    (status === "lista_validacion" ||
      status === "diseno_tecnico" ||
      status === "listo_produccion") &&
    role !== "administrador"
  ) {
    return [];
  }

  return base;
}

export function canOpenRegistration(status: OrderStatus): boolean {
  return status === "diseno_aprobado";
}

export function canApproveDesign(status: OrderStatus): boolean {
  return status === "creado" || status === "diseno_revision";
}

export function canEditParticipants(status: OrderStatus): boolean {
  return status === "registro_abierto" || status === "participantes_incompletos";
}

export function isClosedList(status: OrderStatus): boolean {
  return statusIndex(status) >= statusIndex("lista_cerrada");
}

export function registrationOpen(status: OrderStatus): boolean {
  return (
    status === "diseno_aprobado" ||
    status === "registro_abierto" ||
    status === "participantes_incompletos"
  );
}