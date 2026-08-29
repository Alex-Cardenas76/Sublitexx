"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui";
import {
  getOrder,
  getParticipants,
  getOrderStatus,
  updateParticipant,
  approveDesign,
  markPayment,
} from "@/lib/store";
import { canApproveDesign, statusLabel } from "@/lib/status";
import { validateOrder } from "@/lib/summary";
import { useMounted } from "@/lib/hooks";
import type { Participant, Size } from "@/lib/types";

export default function CoordinatorView({ orderId }: { orderId: string }) {
  const mounted = useMounted();
  const [copied, setCopied] = useState(false);
  const [openPid, setOpenPid] = useState<string | null>(null);
  const [draft, setDraft] = useState({ shirtName: "", number: "", size: "" as Size | "" });

  const order = mounted ? getOrder(orderId) : undefined;
  const participants = mounted ? getParticipants(orderId) : [];
  const status = mounted ? getOrderStatus(orderId) : "creado";

  if (!mounted) return <div className="min-h-dvh" />;

  if (!order) {
    return (
      <CoordinatorShell>
        <Empty title="Pedido no encontrado">
          Verifica que el enlace del coordinador sea correcto.
        </Empty>
      </CoordinatorShell>
    );
  }

  const doneList = participants.filter((p) => p.registrationStatus === "completo");
  const pendingList = participants.filter((p) => p.registrationStatus !== "completo");
  const issues = validateOrder(order, participants).filter((i) => i.level !== "info");
  const link = "/pedido/" + order.id + "/jugador/demo-token";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  function copyLink() {
    const url = baseUrl + link;
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  }

  function approve() {
    approveDesign(orderId, "Coordinador del cliente");
  }

  function startEdit(p: Participant) {
    setOpenPid(p.id);
    setDraft({
      shirtName: p.shirtName,
      number: p.number === null ? "" : String(p.number),
      size: p.size ?? "",
    });
  }

  function saveEdit(p: Participant) {
    const num = draft.number === "" ? null : parseInt(draft.number, 10);
    const conflict =
      num !== null &&
      doneList.some(
        (o) => o.id !== p.id && o.registrationStatus === "completo" && o.number === num
      );
    if (conflict) return;
    updateParticipant(orderId, p.id, {
      shirtName: draft.shirtName.toUpperCase(),
      number: num,
      size: draft.size === "" ? null : draft.size,
      registrationStatus: "completo",
    }, {
      user: "Coordinador del cliente",
      role: "coordinador_cliente",
      field: "Datos del participante",
      oldValue: p.shirtName,
      newValue: draft.shirtName.toUpperCase(),
    });
    setOpenPid(null);
  }

  function togglePaid(p: Participant) {
    markPayment(
      orderId,
      p.id,
      p.payment?.estado === "pagado" ? "pendiente" : "pagado",
      p.payment?.comprobante
    );
  }

  const occupied = doneList.filter((p) => p.number !== null).map((p) => p.number as number);

  return (
    <CoordinatorShell>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-primary">Pedido {order.id}</p>
          <h1 className="text-xl font-extrabold text-ink">{order.client}</h1>
        </div>
        <Badge tone={designTone(order.design.estado)}>
          Diseño {statusLabelCast(order.design.estado)}
        </Badge>
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        {order.config.tipoCliente} · {order.config.product} · Estado del pedido:{" "}
        <b className="text-ink">{statusLabel(status)}</b>
      </p>

      {canApproveDesign(status) && (
        <button
          onClick={approve}
          className="mt-3 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-md"
        >
          Aprobar diseño → abre el registro
        </button>
      )}

      {order.design.estado === "aprobado" && (
        <div className="mt-4 rounded-3xl border border-border bg-white p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
            Diseño aprobado
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex h-20 w-16 flex-col items-center justify-center rounded-lg text-[8px] font-bold text-white"
              style={{ background: order.config.colors[0] ?? "#1e3a8a" }}
            >
              {order.design.propuesta}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">{order.design.propuesta}</p>
              <div className="mt-1.5 flex gap-1.5">
                {order.config.colors.map((c) => (
                  <span
                    key={c}
                    className="h-4 w-4 rounded-full border border-black/10"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <Link
                href="/coordinador/SUB-000842"
                className="mt-2 inline-block text-xs font-semibold text-primary"
              >
                Coordinador: cambiar pedido demo (842) →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat icon={<Icon.users className="h-4 w-4" />} label="Registrados" value={doneList.length} />
        <Stat icon={<Icon.clock className="h-4 w-4" />} label="Pendientes" value={pendingList.length} tone="amber" />
        <Stat
          icon={<Icon.wallet className="h-4 w-4" />}
          label="Pagados"
          value={doneList.filter((p) => p.payment?.estado === "pagado").length}
          tone="green"
        />
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-white p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">
          Envío del formulario
        </p>
        <p className="mt-1 break-all rounded-xl bg-canvas px-3 py-2 text-xs text-ink-soft">
          {baseUrl + link}
        </p>
        <button
          onClick={copyLink}
          className="mt-2 w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white"
        >
          {copied ? "✓ Copiado" : "Copiar enlace de invitación"}
        </button>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {pendingList.slice(0, 3).map((p) => (
            <span key={p.id} className="rounded-lg bg-canvas px-2 py-1 text-[10px] font-semibold text-ink-soft">
              {p.fullName}
            </span>
          ))}
          {pendingList.length === 0 && (
            <span className="text-[10px] text-ink-mute">Todos los invitados registraron sus datos.</span>
          )}
        </div>
      </div>

      {issues.length > 0 && (
        <div className="mt-4 rounded-3xl border border-border bg-white p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-warn">
            Detecciones automáticas ({issues.length})
          </p>
          <ul className="space-y-1.5 text-xs text-ink-soft">
            {issues.slice(0, 4).map((i, idx) => (
              <li key={idx}>• {i.text}</li>
            ))}
          </ul>
        </div>
      )}

      <Section title={`Registrados (${doneList.length})`}>
        {doneList.map((p) => (
          <ParticipantRow
            key={p.id}
            p={p}
            isOpen={openPid === p.id}
            draft={draft}
            setDraft={setDraft}
            occupied={occupied}
            onEdit={() => startEdit(p)}
            onSave={() => saveEdit(p)}
            onCancel={() => setOpenPid(null)}
            onTogglePaid={() => togglePaid(p)}
          />
        ))}
        {doneList.length === 0 && <p className="px-5 py-4 text-sm text-ink-mute">Aún no hay registros.</p>}
      </Section>

      <Section title={`Pendientes invitados (${pendingList.length})`}>
        {pendingList.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 border-b border-border px-5 py-3 last:border-0">
            <div>
              <p className="text-sm font-semibold text-ink">{p.fullName}</p>
              <p className="text-[11px] text-ink-mute">Invitado por enlace — sin completar</p>
            </div>
            <span className="rounded-full bg-warn-bg px-2 py-0.5 text-[10px] font-bold text-warn">
              PENDIENTE
            </span>
          </div>
        ))}
        {pendingList.length === 0 && <p className="px-5 py-4 text-sm text-ink-mute">Sin pendientes.</p>}
      </Section>
    </CoordinatorShell>
  );
}

function ParticipantRow({
  p,
  isOpen,
  draft,
  setDraft,
  occupied,
  onEdit,
  onSave,
  onCancel,
  onTogglePaid,
}: {
  p: Participant;
  isOpen: boolean;
  draft: { shirtName: string; number: string; size: Size | "" };
  setDraft: (d: { shirtName: string; number: string; size: Size | "" }) => void;
  occupied: number[];
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTogglePaid: () => void;
}) {
  if (isOpen) {
    return (
      <div className="border-b border-border px-5 py-4 last:border-0">
        <div className="grid gap-2">
          <input
            value={draft.shirtName}
            onChange={(e) => setDraft({ ...draft, shirtName: e.target.value.toUpperCase() })}
            className="w-full rounded-xl border-2 border-border px-3 py-2 text-sm font-bold outline-none focus:border-primary"
            placeholder="Nombre en camiseta"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={draft.number}
              onChange={(e) => setDraft({ ...draft, number: e.target.value.replace(/\D/g, "").slice(0, 2) })}
              className="w-full rounded-xl border-2 border-border px-3 py-2 text-sm font-bold tabular-nums outline-none focus:border-primary"
              placeholder="Número"
            />
            <select
              value={draft.size}
              onChange={(e) => setDraft({ ...draft, size: e.target.value as Size })}
              className="w-full rounded-xl border-2 border-border bg-white px-3 py-2 text-sm font-bold outline-none focus:border-primary"
            >
              <option value="">Talla</option>
              {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-ink-mute">
            Ocupados actuales: {occupied.length > 0 ? occupied.sort((a, b) => a - b).join(" · ") : "ninguno"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white"
            >
              Guardar
            </button>
            <button
              onClick={onCancel}
              className="rounded-xl border border-border px-4 text-sm font-semibold text-ink-soft"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">
          {p.shirtName}
          {p.number !== null && <span className="text-primary"> · {p.number}</span>}
          {p.size && <span className="font-medium text-ink-mute"> · {p.size}</span>}
        </p>
        <p className="flex items-center gap-1 text-[11px] text-ink-mute">
          {p.type === "arquero" ? "Arquero" : "Jugador"} ·{" "}
          <span
            className={`flex items-center gap-0.5 font-semibold ${
              p.payment?.estado === "pagado" ? "text-ok" : "text-warn"
            }`}
          >
            <Icon.wallet className="h-3 w-3" />
            {p.payment?.estado === "pagado" ? "Pagado" : "Sin pago"}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onTogglePaid}
          className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
            p.payment?.estado === "pagado"
              ? "bg-warn-bg text-warn hover:bg-warn hover:text-white"
              : "bg-ok-bg text-ok hover:bg-ok hover:text-white"
          }`}
        >
          {p.payment?.estado === "pagado" ? "Desmarcar" : "Marcar pago"}
        </button>
        <button
          onClick={onEdit}
          className="rounded-lg bg-canvas px-2 py-1 text-[10px] font-bold text-ink-soft hover:text-ink"
        >
          Corregir
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-white">
      <p className="border-b border-border bg-canvas px-5 py-3 text-xs font-bold uppercase tracking-wide text-ink-mute">
        {title}
      </p>
      {children}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone = "dark",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: string;
}) {
  const tones: Record<string, string> = {
    dark: "bg-ink text-white",
    amber: "bg-warn text-white",
    green: "bg-ok text-white",
  };
  return (
    <div className={`rounded-2xl px-3 py-3 text-center ${tones[tone]}`}>
      <div className="flex items-center justify-center gap-1 text-[10px] font-semibold opacity-80">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function CoordinatorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-border bg-ink px-5 py-3.5">
        <p className="text-sm font-extrabold text-white">
          SIPES <span className="font-medium text-white/70">· coordinador</span>
        </p>
        <Link
          href="/pedidos/SUB-000842"
          className="rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/20"
        >
          Demo admin
        </Link>
      </header>
      <main className="mx-auto max-w-md px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-md px-4 pb-8 text-center text-[11px] text-ink-mute">
        Vista restringida: no se muestran costos ni información comercial interna.
      </footer>
    </div>
  );
}

function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-white px-6 py-10 text-center">
      <h1 className="text-lg font-extrabold text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{children}</p>
    </div>
  );
}

function statusLabelCast(estado: string): string {
  return estado === "aprobado" ? "aprobado" : estado === "revision" ? "en revisión" : estado;
}

function designTone(estado: string): "green" | "amber" | "gray" {
  return estado === "aprobado" ? "green" : estado === "revision" ? "amber" : "gray";
}