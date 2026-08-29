"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { useSession } from "@/lib/session";
import { navFor, canManageOrders } from "@/lib/permissions";
import { useStoreVersion, getOrders, resetStore } from "@/lib/store";
import { buildAttentionList } from "@/lib/summary";
import { canSeeOrder } from "@/lib/permissions";
import { ROLES } from "@/lib/session";

const SIDEBAR_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Inicio: Icon.home,
  Pedidos: Icon.package,
  Participantes: Icon.users,
  Pendientes: Icon.alert,
  Diseño: Icon.palette,
  Producción: Icon.bolt,
  Finanzas: Icon.wallet,
  Proveedores: Icon.truck,
  Reportes: Icon.chart,
  Configuración: Icon.gear,
  Perfil: Icon.users,
};

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl font-extrabold ${
          light ? "bg-white/15 text-white" : "bg-primary text-white"
        }`}
      >
        S
      </span>
      <div className="leading-tight">
        <p className={`text-sm font-extrabold tracking-wide ${light ? "text-white" : "text-ink"}`}>
          SIPES
        </p>
        <p className={`text-[10px] ${light ? "text-white/60" : "text-ink-mute"}`}>
          Pedidos de ropa deportiva
        </p>
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === href ||
    (href !== "/inicio" && !["/pedidos"].includes(href) && pathname.startsWith(href)) ||
    (href === "/pedidos" &&
      ["/pedidos", "/pedidos/nuevo", "/pedidos/SUB-000842"].some((p) => pathname.startsWith(p)));
  const IconC = SIDEBAR_ICONS[label] ?? Icon.package;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <IconC className="h-[18px] w-[18px]" />
      {label}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { role, reset } = useSession();
  const main = navFor(role.id).filter((i) => i.section === "main");
  const secondary = navFor(role.id).filter((i) => i.section === "secondary");
  const canReset = canManageOrders(role.id);

  return (
    <div className="flex h-full flex-col bg-primary">
      <div className="px-5 pt-5 pb-4">
        <Brand light />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-2 px-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
          Menú
        </div>
        <div className="space-y-0.5">
          {main.map((i) => (
            <NavLink key={i.href} href={i.href} label={i.label} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="mb-2 mt-5 px-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
          Cuenta
        </div>
        <div className="space-y-0.5">
          {secondary.map((i) => (
            <NavLink key={i.href} href={i.href} label={i.label} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
            {role.short}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{role.user}</p>
            <p className="text-xs text-white/60">{role.label}</p>
          </div>
        </div>
        {canReset && (
          <button
            onClick={reset}
            onClickCapture={() => resetStore()}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Icon.logout className="h-4 w-4" />
            Cerrar sesión · Reestablecer demo
          </button>
        )}
        {!canReset && (
          <button
            onClick={() => resetStore()}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Icon.logout className="h-4 w-4" />
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useSession();
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
      <span className="hidden text-xs font-medium text-ink-mute sm:block">Demo · rol:</span>
      <select
        value={role.id}
        onChange={(e) => setRole(e.target.value as (typeof ROLES)[number]["id"])}
        className="cursor-pointer bg-transparent text-sm font-semibold text-ink outline-none"
      >
        {ROLES.filter((r) => r.id !== "participante").map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  useStoreVersion();
  const { role } = useSession();
  const orders = getOrders().filter((o) => canSeeOrder(o, role.id));
  const notes = buildAttentionList(orders);
  const count = notes.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-ink-soft transition-colors hover:text-ink cursor-pointer"
        aria-label="Notificaciones"
      >
        <Icon.bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
            <div className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
              Notificaciones
              <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-600">
                {count}
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {count === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-ink-mute">
                  No hay alertas para tu rol.
                </p>
              ) : (
                notes.map((n) => (
                  <Link
                    key={n.id}
                    href={`/pedidos/${n.orderId}`}
                    onClick={() => setOpen(false)}
                    className="flex gap-2.5 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-canvas"
                  >
                    <Icon.alert
                      className={`mt-0.5 h-4 w-4 shrink-0 ${n.level === "error" ? "text-error" : "text-warn"}`}
                    />
                    <div>
                      <p className="text-xs font-bold text-ink">{n.orderCode}</p>
                      <p className="text-xs text-ink-soft">{n.text}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Topbar() {
  const { role } = useSession();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2 sm:hidden">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">SIPES</span>
      </div>
      <div className="hidden items-center gap-2 text-sm font-semibold text-ink sm:flex lg:hidden">
        <span className="rounded-lg bg-primary-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-600">
          {role.short}
        </span>
        {role.label}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <RoleSwitcher />
        <NotificationsBell />
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const { role } = useSession();
  useStoreVersion();

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 lg:block">
        <SidebarContent />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 shadow-2xl">
            <SidebarContent onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="flex w-full flex-col lg:pl-64">
        <div className="lg:hidden">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-primary px-4 py-3">
            <Brand light />
            <button
              onClick={() => setDrawer(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 cursor-pointer"
              aria-label="Abrir menú"
            >
              <Icon.menu className="h-5 w-5" />
            </button>
          </header>
        </div>
        <Topbar />

        <div className="px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
          {role.id === "coordinador_operativo" || role.id === "administrador" ? (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Link
                href={`/pedido/842/jugador/demo-token`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
              >
                <Icon.shirt className="h-3.5 w-3.5" />
                Probar formulario del participante
              </Link>
              <Link
                href={`/coordinador/842`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
              >
                <Icon.users className="h-3.5 w-3.5" />
                Vista del coordinador del cliente
              </Link>
              <span className="text-xs text-ink-mute">· Data de prueba (demo)</span>
            </div>
          ) : null}
          <main className="px-0 pb-16">{children}</main>
          <footer className="pb-8 text-center text-xs text-ink-mute">
            SIPES · Sistema de Gestión Operativa de Pedidos Sublitex · MVP frontend con datos de
            demostración
          </footer>
        </div>
      </div>
    </div>
  );
}