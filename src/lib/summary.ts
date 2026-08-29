import type { Note, Order, OrderStatus, Participant, Size, ValidationItem } from "./types";
import { registrationOpen } from "./status";

export function completed(p?: Participant | null): boolean {
  return !!p && p.registrationStatus === "completo" && p.number !== null && !!p.size && p.shirtName.trim() !== "";
}

export function sizeCounts(participants: Participant[]): Record<Size, number> {
  const out: Record<Size, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  participants.forEach((p) => {
    if (completed(p) && p.size) out[p.size]++;
  });
  return out;
}

export function productCounts(participants: Participant[]): Record<string, number> {
  const out: Record<string, number> = {};
  participants.forEach((p) => {
    if (completed(p)) out[p.product] = (out[p.product] ?? 0) + 1;
  });
  return out;
}

export function componentCounts(order: Order, participants: Participant[]): Record<string, number> {
  const done = participants.filter(completed);
  const camisetas = done.length;
  const shorts = done.filter((p) => order.config.components.short && p.short !== false).length;
  const medias = done.filter((p) => order.config.components.medias && p.medias !== false).length;
  const escudos = done.filter((p) => order.config.components.escudo && p.escudo !== false).length;
  return { Camisetas: camisetas, Shorts: shorts, Medias: medias, Escudos: escudos };
}

export interface OrderAnalytics {
  total: number;
  completo: number;
  pendiente: number;
  camisetas: number;
  conjuntos: number;
  shorts: number;
  medias: number;
  escudos: number;
  porTalla: Record<Size, number>;
  porProducto: Record<string, number>;
  comoComponentes: Record<string, number>;
  pagados: number;
  pendientesPago: number;
}

export function analytics(order: Order, participants: Participant[]): OrderAnalytics {
  const done = participants.filter(completed);
  const ok = done.length;
  return {
    total: participants.length,
    completo: ok,
    pendiente: participants.length - ok,
    camisetas: ok,
    conjuntos: ok,
    shorts: done.filter((p) => order.config.components.short && p.short !== false).length,
    medias: done.filter((p) => order.config.components.medias && p.medias !== false).length,
    escudos: done.filter((p) => order.config.components.escudo && p.escudo !== false).length,
    porTalla: sizeCounts(participants),
    porProducto: productCounts(participants),
    comoComponentes: componentCounts(order, participants),
    pagados: done.filter((p) => p.payment?.estado === "pagado").length,
    pendientesPago: done.filter((p) => p.payment?.estado !== "pagado").length,
  };
}

export function validateOrder(order: Order, participants: Participant[]): ValidationItem[] {
  const out: ValidationItem[] = [];
  const done = participants.filter(completed).filter((p) => !p.invited || p.registrationStatus === "completo");
  void done;
  const registered = participants.filter(
    (p) => p.registrationStatus === "completo" && p.number !== null
  );

  // duplicated numbers
  const seen = new Map<number, string[]>();
  registered.forEach((p) => {
    const arr = seen.get(p.number!) ?? [];
    arr.push(p.shirtName || p.fullName);
    seen.set(p.number!, arr);
  });
  seen.forEach((names, num) => {
    if (names.length > 1) {
      out.push({ level: "error", text: `Número ${num} duplicado (${names.join(", ")})` });
    }
  });

  // incomplete data on invited participants
  participants
    .filter((p) => p.registrationStatus !== "completo")
    .forEach((p) => {
      out.push({ level: "warn", text: `${p.fullName} — registro pendiente` });
    });

  participants
    .filter((p) => p.registrationStatus === "completo")
    .forEach((p) => {
      if (!p.shirtName || !p.shirtName.trim())
        out.push({ level: "error", text: `${p.fullName} — falta nombre para camiseta` });
      if (p.size === null)
        out.push({ level: "error", text: `${p.fullName} — falta talla` });
      if (p.number === null)
        out.push({ level: "error", text: `${p.fullName} — falta número` });
    });

  // exceptions not approved
  order.exceptions
    .filter((e) => !e.approved)
    .forEach((e) =>
      out.push({
        level: "warn",
        text: `Excepción sin confirmar: ${e.participant} — ${e.field}: ${e.value}`,
      })
    );

  // quantity mismatch
  const complete = participants.filter(completed).length;
  if (complete < order.config.quantity) {
    out.push({
      level: "warn",
      text: `Faltan ${order.config.quantity - complete} participantes para completar la cantidad contratada (${order.config.quantity})`,
    });
  } else if (complete > order.config.quantity) {
    out.push({
      level: "error",
      text: `Cantidad superior a la contratada: ${complete} registrados (contratados ${order.config.quantity})`,
    });
  }

  return out;
}

export function hasCritical(order: Order, participants: Participant[]): boolean {
  return validateOrder(order, participants).some((v) => v.level === "error");
}

export function buildAttentionList(orders: Order[]): Note[] {
  const notes: Note[] = [];
  orders.forEach((o) => {
    const p = o.participants;
    const done = p.filter(completed).length;
    const issues: string[] = [];

    p.forEach((x) => {
      if (x.registrationStatus === "completo" && x.number !== null) {
        const dup = p.filter(
          (y) => y !== x && y.number === x.number && y.registrationStatus === "completo"
        );
        if (dup.length > 0 && issues.indexOf(`Número ${x.number} duplicado`) < 0) {
          issues.push(`Número ${x.number} duplicado`);
        }
      }
    });
    if (done < o.config.quantity) issues.push(`Faltan ${o.config.quantity - done} participantes`);
    if (o.design.estado !== "aprobado" && !["creado", "info_pendiente"].includes(o.status))
      issues.push("Diseño pendiente de aprobación");
    if (o.exceptions.some((e) => !e.approved)) issues.push("Excepción pendiente de aprobación");
    if (
      ["diseno_tecnico", "listo_produccion", "en_produccion"].includes(o.status) &&
      (!o.production.metraje || !o.production.proveedorCostura)
    )
      issues.push("Metraje o proveedor pendiente");
    if (["registro_abierto", "participantes_incompletos"].includes(o.status) && done >= 5)
      issues.push("Lista lista para cierre");
    if (
      ["diseno_aprobado"].includes(o.status)
    )
      issues.push("Abrir registro de participantes");

    issues.slice(0, 3).forEach((text) =>
      notes.push({
        id: `${o.id}-${text}`,
        type: "pedido",
        level: text.startsWith("Faltan") ? "warn" : "error",
        orderId: o.id,
        orderCode: o.id,
        text,
      })
    );
  });
  return notes;
}

export function openRegistrationOrders(orders: Order[]): Order[] {
  return orders.filter((o) => registrationOpen(o.status));
}

export function statusOf(orders: Order[], id: string): OrderStatus {
  return orders.find((o) => o.id === id)?.status ?? "creado";
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}