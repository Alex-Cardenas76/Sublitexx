"use client";

import { useSyncExternalStore } from "react";
import { ORDERS } from "@/data/orders";
import type { HistoryEntry, Order, OrderException, OrderStatus, Participant } from "./types";

interface DesignOverlay {
  estado: "aprobado";
  aprobadoPor: string;
  fechaAprobacion: string;
}

interface Overlay {
  participants: Record<string, Record<string, Participant>>;
  statuses: Record<string, OrderStatus>;
  history: Record<string, HistoryEntry[]>;
  exceptions: Record<string, OrderException[]>;
  newOrders: Record<string, Order>;
  designs: Record<string, DesignOverlay>;
}

const BASE: Overlay = {
  participants: {},
  statuses: {},
  history: {},
  exceptions: {},
  newOrders: {},
  designs: {},
};

const KEY = "sipes.mock.v1";

function read(): Overlay {
  if (typeof window === "undefined") return BASE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return BASE;
    const parsed = JSON.parse(raw) as Partial<Overlay>;
    return {
      participants: parsed.participants ?? {},
      statuses: parsed.statuses ?? {},
      history: parsed.history ?? {},
      exceptions: parsed.exceptions ?? {},
      newOrders: parsed.newOrders ?? {},
      designs: parsed.designs ?? {},
    };
  } catch {
    return BASE;
  }
}

function write(overlay: Overlay) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(overlay));
  } catch {
    /* ignore */
  }
}

let overlay: Overlay = BASE;
let version = 0;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getVersion() {
  return version;
}

function commit() {
  version++;
  listeners.forEach((l) => l());
}

export function useStoreVersion(): number {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}

export function getOrders(): Order[] {
  const data = read();
  const base = [...ORDERS];
  const extra = Object.values(data.newOrders);
  return [...base, ...extra].map((o) => mergeOrder(o));
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function getBaseOrder(id: string): Order | undefined {
  return ORDERS.find((o) => o.id === id);
}

function mergeOrder(order: Order): Order {
  const d = read().designs[order.id];
  if (!d) return order;
  return {
    ...order,
    design: {
      ...order.design,
      estado: d.estado,
      aprobadoPor: order.design.aprobadoPor ?? d.aprobadoPor,
      fechaAprobacion: order.design.fechaAprobacion ?? d.fechaAprobacion,
    },
  };
}

export function getParticipants(orderId: string): Participant[] {
  const order = ORDERS.find((o) => o.id === orderId) ?? (read().newOrders[orderId] as Order | undefined);
  if (!order) return [];
  const stored = read().participants[orderId] ?? {};
  return order.participants.map((p) => stored[p.id] ?? p);
}

export function getOrderStatus(orderId: string): OrderStatus {
  const stored = read().statuses[orderId];
  if (stored) return stored;
  const order = getBaseOrder(orderId) ?? read().newOrders[orderId];
  return order?.status ?? "creado";
}

export function getOrderHistory(orderId: string): HistoryEntry[] {
  const order = getBaseOrder(orderId) ?? read().newOrders[orderId];
  const base = order?.history ?? [];
  return [...base, ...(read().history[orderId] ?? [])];
}

export function getOrderExceptions(orderId: string): OrderException[] {
  const order = getBaseOrder(orderId) ?? read().newOrders[orderId];
  const base = order?.exceptions ?? [];
  return [...base, ...(read().exceptions[orderId] ?? [])];
}

export function getOrderAnalytics(orderId: string) {
  const participants = getParticipants(orderId);
  const status = getOrderStatus(orderId);
  const history = getOrderHistory(orderId);
  const exceptions = getOrderExceptions(orderId);
  return { participants, status, history, exceptions };
}

export function setStatus(orderId: string, status: OrderStatus, user: string, role: string) {
  const prev = getOrderStatus(orderId);
  const data = read();
  data.statuses[orderId] = status;
  data.history[orderId] = [
    ...(data.history[orderId] ?? []),
    {
      id: `h-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      user,
      role,
      field: "Estado",
      oldValue: prev,
      newValue: status,
    },
  ];
  write(data);
  commit();
}

export function approveDesign(orderId: string, approver: string) {
  const data = read();
  data.designs[orderId] = {
    estado: "aprobado",
    aprobadoPor: approver,
    fechaAprobacion: new Date().toISOString().slice(0, 10),
  };
  data.statuses[orderId] = "diseno_aprobado";
  data.history[orderId] = [
    ...(data.history[orderId] ?? []),
    {
      id: `h-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      user: approver,
      role: "Coordinador del cliente",
      field: "Diseño",
      oldValue: "En revisión",
      newValue: "Aprobado (abre registro)",
    },
  ];
  write(data);
  commit();
}

export function saveParticipant(orderId: string, participant: Participant): Participant {
  const data = read();
  data.participants[orderId] = { ...(data.participants[orderId] ?? {}), [participant.id]: participant };
  data.history[orderId] = [
    ...(data.history[orderId] ?? []),
    {
      id: `h-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      user: participant.fullName || participant.shirtName,
      role: "Participante",
      field: "Registro",
      oldValue: "Pendiente",
      newValue: "Datos completados",
    },
  ];
  write(data);
  commit();
  return participant;
}

export function updateParticipant(
  orderId: string,
  id: string,
  patch: Partial<Participant>,
  log?: { user: string; role: string; field: string; oldValue: string; newValue: string }
) {
  const data = read();
  const current = getParticipants(orderId).find((p) => p.id === id);
  if (!current) return;
  data.participants[orderId] = {
    ...(data.participants[orderId] ?? {}),
    [id]: { ...current, ...patch },
  };
  if (log) {
    data.history[orderId] = [
      ...(data.history[orderId] ?? []),
      { id: `h-${Date.now()}`, date: new Date().toISOString().slice(0, 10), ...log },
    ];
  }
  write(data);
  commit();
}

export function markPayment(
  orderId: string,
  participantId: string,
  estado: "pagado" | "pendiente",
  comprobante?: string
) {
  const data = read();
  const current = getParticipants(orderId).find((p) => p.id === participantId);
  if (!current) return;
  data.participants[orderId] = {
    ...(data.participants[orderId] ?? {}),
    [participantId]: {
      ...current,
      payment: {
        monto: current.payment?.monto ?? 45,
        fecha: new Date().toISOString().slice(0, 10),
        comprobante,
        estado,
      },
    },
  };
  write(data);
  commit();
}

export function approveException(orderId: string, exceptionId: string, approver: string) {
  const data = read();
  const current = getOrderExceptions(orderId);
  const updated = current.map((e) =>
    e.id === exceptionId ? { ...e, approved: true, approvedBy: approver } : e
  );
  if (orderId in data.exceptions) {
    data.exceptions[orderId] = updated;
  } else {
    const base = getBaseOrder(orderId)?.exceptions ?? [];
    const stored = data.exceptions[orderId] ?? [];
    data.exceptions[orderId] = [...base, ...stored].map((e) => {
      const changed = updated.find((u) => u.id === e.id);
      return changed ?? e;
    });
  }
  write(data);
  commit();
}

export function createOrder(order: Order) {
  const data = read();
  data.newOrders[order.id] = order;
  write(data);
  commit();
}

export function resetStore() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  overlay = BASE;
  commit();
}

export function nextOrderId(): string {
  const orders = getOrders();
  const max = orders.reduce((acc, o) => {
    const n = parseInt(o.code, 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 837);
  return `SUB-000${max + 1}`;
}