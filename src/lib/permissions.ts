import type { Order, RoleId } from "./types";

export interface NavItem {
  href: string;
  label: string;
  section: "main" | "secondary";
}

const ITEMS: Record<string, Omit<NavItem, "section">> = {
  inicio: { href: "/inicio", label: "Inicio" },
  pedidos: { href: "/pedidos", label: "Pedidos" },
  participantes: { href: "/pedidos/SUB-000842", label: "Participantes" },
  pendientes: { href: "/pendientes", label: "Pendientes" },
  diseno: { href: "/diseno", label: "Diseño" },
  produccion: { href: "/produccion", label: "Producción" },
  finanzas: { href: "/finanzas", label: "Finanzas" },
  proveedores: { href: "/proveedores", label: "Proveedores" },
  reportes: { href: "/reportes", label: "Reportes" },
  configuracion: { href: "/configuracion", label: "Configuración" },
  perfil: { href: "/configuracion", label: "Perfil" },
};

export function navFor(role: RoleId): NavItem[] {
  const pick = (...keys: string[]): NavItem[] =>
    keys.map((k) => ({ ...ITEMS[k], section: "main" }));

  switch (role) {
    case "coordinador_operativo":
      return [
        ...pick("inicio", "pedidos", "pendientes", "diseno", "produccion"),
        { ...ITEMS.configuracion, section: "secondary" },
        { ...ITEMS.perfil, section: "secondary" },
      ];
    case "vendedora":
      return [
        ...pick("inicio", "pedidos"),
        { ...ITEMS.configuracion, section: "secondary" },
        { ...ITEMS.perfil, section: "secondary" },
      ];
    case "diseno":
      return [...pick("inicio", "diseno"), { ...ITEMS.configuracion, section: "secondary" }];
    case "produccion":
      return [...pick("inicio", "produccion"), { ...ITEMS.configuracion, section: "secondary" }];
    case "administrador":
    default:
      return [
        ...pick("inicio", "pedidos", "diseno", "produccion", "finanzas", "proveedores", "reportes"),
        { ...ITEMS.configuracion, section: "secondary" },
        { ...ITEMS.perfil, section: "secondary" },
      ];
  }
}

export function canSeeMargin(role: RoleId): boolean {
  return role === "administrador" || role === "vendedora";
}

export function canSeeCostBreakdown(role: RoleId): boolean {
  return role === "administrador" || role === "vendedora";
}

export function canSeeCommercial(role: RoleId): boolean {
  return role === "administrador" || role === "vendedora";
}

export function canManageOrders(role: RoleId): boolean {
  return role === "administrador" || role === "coordinador_operativo";
}

export function canValidate(role: RoleId): boolean {
  return role === "administrador" || role === "coordinador_operativo";
}

export function canApproveDesign(role: RoleId): boolean {
  return (
    role === "administrador" ||
    role === "coordinador_operativo" ||
    role === "coordinador_cliente"
  );
}

export function canManageParticipants(role: RoleId): boolean {
  return (
    role === "administrador" ||
    role === "coordinador_operativo" ||
    role === "vendedora"
  );
}

export function canSeeFinanceModule(role: RoleId): boolean {
  return role === "administrador" || role === "vendedora";
}

export function canSeeSipesInternal(role: RoleId): boolean {
  return role !== "coordinador_cliente";
}

export function canSeeParticipantPayment(role: RoleId): boolean {
  return role === "administrador" || role === "vendedora";
}

export function canSeeOrder(order: Order, role: RoleId): boolean {
  if (role === "vendedora") return order.seller === "María Paredes";
  if (role === "diseno") {
    return ["diseno_pendiente", "diseno_revision", "diseno_aprobado", "registro_abierto", "participantes_incompletos", "lista_validacion"].includes(order.status);
  }
  if (role === "produccion") {
    return ["lista_validacion", "lista_cerrada", "diseno_tecnico", "listo_produccion", "en_produccion", "terminado", "entregado"].includes(order.status);
  }
  return true;
}

export function canExport(role: RoleId): boolean {
  return true;
}

export function canApproveExceptions(role: RoleId): boolean {
  return role === "administrador" || role === "coordinador_operativo";
}