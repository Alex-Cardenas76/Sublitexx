"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Badge, Card, PageHeader, StatusBadge } from "@/components/ui";
import StatusStepper from "@/components/order/StatusStepper";
import DesignView from "@/components/order/DesignView";
import ParticipantsView from "@/components/order/ParticipantsView";
import ValidationView from "@/components/order/ValidationView";
import ProductionView from "@/components/order/ProductionView";
import HistoryView from "@/components/order/HistoryView";
import SummaryView from "@/components/order/SummaryView";
import ExportButtons from "@/components/order/ExportButtons";
import { useSession } from "@/lib/session";
import {
  useStoreVersion,
  getOrder,
  getParticipants,
  getOrderStatus,
  getOrderExceptions,
  setStatus,
} from "@/lib/store";
import {
  canSeeCommercial,
  canSeeMargin,
  canSeeCostBreakdown,
  canSeeParticipantPayment,
  canManageOrders,
  canManageParticipants,
  canApproveDesign,
  canValidate,
} from "@/lib/permissions";
import { canOpenRegistration, registrationOpen, isClosedList } from "@/lib/status";
import { useMounted } from "@/lib/hooks";
import type { Order, RoleId } from "@/lib/types";

type SectionId =
  | "info"
  | "diseno"
  | "participantes"
  | "validacion"
  | "produccion"
  | "historial";

const ALL_SECTIONS: Record<SectionId, string> = {
  info: "Información",
  diseno: "Diseño",
  participantes: "Participantes",
  validacion: "Validación",
  produccion: "Producción",
  historial: "Historial",
};

function roleSections(role: RoleId): SectionId[] {
  switch (role) {
    case "diseno":
      return ["info", "diseno", "participantes"];
    case "produccion":
      return ["info", "participantes", "produccion"];
    case "vendedora":
      return ["info", "participantes"];
    default:
      return ["info", "diseno", "participantes", "validacion", "produccion", "historial"];
  }
}

export default function OrderSection({
  orderId,
  tab,
}: {
  orderId: string;
  tab: SectionId;
}) {
  const mounted = useMounted();
  const { role } = useSession();
  useStoreVersion();
  const [copied, setCopied] = useState(false);

  if (!mounted) return <div className="h-64" />;

  const order = getOrder(orderId);
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 text-center">
          <p className="mb-2 text-sm font-semibold">Pedido no encontrado</p>
          <Link href="/pedidos" className="text-sm font-semibold text-primary">
            ← Volver a pedidos
          </Link>
        </Card>
      </div>
    );
  }

  const status = getOrderStatus(orderId);
  const participants = getParticipants(orderId);
  const exceptions = getOrderExceptions(orderId);

  const canViewValidation = canValidate(role.id);
  const canViewHistory = canManageOrders(role.id) || canApproveDesign(role.id);

  const sections = roleSections(role.id)
    .filter((s) => s !== "validacion" || canViewValidation)
    .filter((s) => s !== "historial" || canViewHistory);

  const forbidden =
    (tab === "validacion" && !canViewValidation) ||
    (tab === "historial" && !canViewHistory);

  const showCommercial = canSeeCommercial(role.id);
  const link = `https://sipes.pe/pedido/${order.code}/jugador/${participants[0]?.link ?? "demo-token"}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(link).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/pedidos"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <Icon.chevronLeft className="h-4 w-4" /> Pedidos
      </Link>

      <PageHeader
        eyebrow={`Pedido ${order.id}`}
        title={order.client}
        description={`${order.config.product} · ${order.config.quantity} participantes contratados · ${order.date}`}
        actions={<StatusBadge status={status} />}
      />

      <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-surface p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Kv label="Contacto" value={order.contact} />
        <Kv label="Vendedora" value={order.seller} />
        <Kv label="Coordinador operativo" value={order.coordinator || "Sin asignar"} />
        <Kv label="Origen" value={`${order.source} · ${order.ghlContactId} / ${order.ghlOpportunityId}`} />
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">
            Flujo del pedido
          </p>
          <p className="text-xs text-ink-mute">
            Estado actual: <b className="text-ink">{status.replaceAll("_", " ")}</b>
          </p>
        </div>
        <div className="px-5 py-4">
          <StatusStepper status={status} />
        </div>
      </div>

      <nav className="mb-6 flex flex-wrap gap-1.5">
        {sections.map((id) => (
          <Link
            key={id}
            href={id === "info" ? `/pedidos/${order.id}` : `/pedidos/${order.id}/${id}`}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              tab === id
                ? "bg-primary text-white"
                : "border border-border bg-surface text-ink-soft hover:text-ink"
            }`}
          >
            {ALL_SECTIONS[id]}
          </Link>
        ))}
      </nav>

      {forbidden && (
        <Card className="p-8 text-center">
          <p className="text-sm font-semibold text-ink">Sección restringida</p>
          <p className="mt-1 text-sm text-ink-soft">
            El rol {role.label} no tiene acceso a esta información.
          </p>
        </Card>
      )}

      {!forbidden && (
        <div className="mt-2">
          {tab === "info" && (
            <Resumen
              order={{ ...order, participants }}
              exceptions={exceptions}
              showCommercial={showCommercial}
              roleLabel={role.label}
              canCost={canSeeCostBreakdown(role.id)}
              canMargin={canSeeMargin(role.id)}
            />
          )}

          {tab === "diseno" && <DesignView order={{ ...order, participants }} />}

          {tab === "participantes" && (
            <div className="space-y-6">
              <Card title="Resúmenes automáticos" subtitle="Calculados del pedido central — no se reingresan datos.">
                <div className="px-5 py-4">
                  <SummaryView order={{ ...order, participants }} variant="compact" />
                </div>
              </Card>

              <RegistroCard
                status={status}
                orderId={order.id}
                link={link}
                copied={copied}
                onCopy={copyLink}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">
                  Base única de participantes —{" "}
                  {participants.filter((p) => p.registrationStatus === "completo").length} completos /{" "}
                  {participants.length} invitados
                </p>
                <ExportButtons order={{ ...order, participants }} />
              </div>

              <ParticipantsView
                order={{ ...order, participants }}
                status={status}
                canEdit={canManageParticipants(role.id)}
                fullName={role.user}
                showPayment={canSeeParticipantPayment(role.id)}
              />
            </div>
          )}

          {tab === "validacion" && (
            <ValidationView
              order={{ ...order, participants }}
              role={role.id}
              currentUserName={role.user}
              currentUserRoleLabel={role.label}
            />
          )}

          {tab === "produccion" && <ProductionView order={{ ...order, participants }} />}

          {tab === "historial" && <HistoryView orderId={order.id} />}
        </div>
      )}
    </div>
  );
}

function Resumen({
  order,
  exceptions,
  showCommercial,
  roleLabel,
  canCost,
  canMargin,
}: {
  order: Order;
  exceptions: ReturnType<typeof getOrderExceptions>;
  showCommercial: boolean;
  roleLabel: string;
  canCost: boolean;
  canMargin: boolean;
}) {
  return (
    <div className="space-y-5">
      <Card title="Configuración del pedido (se hereda a los participantes)">
        <div className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Kv label="Tipo de cliente" value={order.config.tipoCliente} />
          <Kv label="Producto" value={order.config.product} />
          <Kv label="Cantidad contratada" value={`${order.config.quantity} participantes`} />
          <Kv label="Tela" value={order.config.tela || "Pendiente"} />
          <Kv label="Cuello" value={order.config.collar || "—"} />
          <Kv label="Colores" value={order.config.colors.join(", ") || "—"} />
        </div>
        <div className="grid gap-3 border-t border-border px-5 py-4 text-sm sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
              Componentes
            </p>
            <div className="flex flex-wrap gap-2">
              {(["camiseta", "short", "medias", "escudo"] as const).map((c) => (
                <Badge key={c} tone={order.config.components[c] ? "green" : "gray"}>
                  {order.config.components[c] ? "✓" : "–"}{" "}
                  {c === "camiseta"
                    ? "Camiseta"
                    : c === "medias"
                    ? "Medias"
                    : c.charAt(0).toUpperCase() + c.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
              Características especiales
            </p>
            <p className="text-ink-soft">{order.config.specialFeatures.join(", ") || "—"}</p>
          </div>
        </div>
        <div className="border-t border-border px-5 py-4 text-sm">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
            Colores de arquero configurados
          </p>
          <div className="flex flex-wrap gap-2">
            {order.config.goalkeeperColors.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {exceptions.length > 0 && (
        <Card title="Excepciones">
          <ul className="divide-y divide-border px-5">
            {exceptions.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 py-3 text-sm">
                <span className="text-ink-soft">
                  {e.participant} — {e.field}: {e.value}
                </span>
                <Badge tone={e.approved ? "green" : "amber"}>
                  {e.approved ? "Aprobada" : "Por aprobar"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {showCommercial && (
        <Card title="Información comercial" subtitle={`Visible para ${roleLabel} (GoHighLevel + SIPES).`}>
          <div className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <KvMoney label="Venta" value={order.commercial.venta} />
            <KvMoney label="Adelanto" value={order.commercial.adelanto} />
            <KvMoney label="Cobrado" value={order.commercial.cobrado} />
            <KvMoney label="Saldo" value={order.commercial.saldo} />
          </div>
          {canCost && (
            <div className="border-t border-border px-5 py-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
                Costos estimados
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <KvMoney label="Tela" value={order.commercial.costs.tela} />
                <KvMoney label="Impresión" value={order.commercial.costs.impresion} />
                <KvMoney label="Costura" value={order.commercial.costs.costura} />
                <KvMoney label="Bordado" value={order.commercial.costs.bordado} />
                <KvMoney label="Otros" value={order.commercial.costs.otros} />
              </div>
            </div>
          )}
          {canMargin && (
            <div className="flex items-center justify-between border-t border-border px-5 py-4 text-sm">
              <span className="font-semibold text-ink">Utilidad estimada</span>
              <span className="font-bold text-primary">{fmt(order.commercial.utilidad)}</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function RegistroCard({
  status,
  orderId,
  link,
  copied,
  onCopy,
}: {
  status: Parameters<typeof canOpenRegistration>[0];
  orderId: string;
  link: string;
  copied: boolean;
  onCopy: () => void;
}) {
  if (!(canOpenRegistration(status) || registrationOpen(status))) return null;
  return (
    <Card title="Registro de participantes">
      <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-1 text-sm font-semibold text-ink">Enlace único de registro</p>
          <code className="block max-w-full truncate text-xs text-ink-soft">{link}</code>
          {isClosedList(status) && (
            <p className="mt-1 text-xs text-warn">
              Lista cerrada: el enlace está bloqueado para modificaciones.
            </p>
          )}
          {canOpenRegistration(status) && (
            <p className="mt-1 text-xs text-ink-mute">
              El diseño está aprobado. Abre el registro para distribuir el enlace.
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {canOpenRegistration(status) ? (
            <button
              onClick={() => setStatus(orderId, "registro_abierto", "SIPES", "Sistema")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
            >
              <Icon.link className="h-4 w-4" /> Abrir registro
            </button>
          ) : (
            <button
              onClick={onCopy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
            >
              <Icon.link className="h-4 w-4" /> {copied ? "Copiado ✓" : "Copiar enlace"}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">{label}</p>
      <p className="font-semibold text-ink">{value}</p>
    </div>
  );
}

function fmt(n: number): string {
  return `S/ ${n.toLocaleString("es-PE")}`;
}

function KvMoney({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">{label}</p>
      <p className="font-semibold text-ink">{fmt(value)}</p>
    </div>
  );
}