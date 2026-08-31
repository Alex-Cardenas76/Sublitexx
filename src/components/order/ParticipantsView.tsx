"use client";

import { useState } from "react";
import { Btn, Badge } from "@/components/ui";
import { getParticipants, updateParticipant } from "@/lib/store";
import { canEditParticipants } from "@/lib/status";
import type { Order, OrderStatus, Participant, Size } from "@/lib/types";

const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ParticipantsView({
  order,
  status,
  canEdit,
  fullName,
  showPayment = true,
}: {
  order: Order;
  status: OrderStatus;
  canEdit: boolean;
  fullName: string;
  showPayment?: boolean;
}) {
  const participants = getParticipants(order.id);
  const editable = canEdit && canEditParticipants(status);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ shirtName: string; number: string; size: Size | "" }>({
    shirtName: "",
    number: "",
    size: "",
  });
  const [saved, setSaved] = useState("");

  function startEdit(p: Participant) {
    setEditing(p.id);
    setDraft({ shirtName: p.shirtName, number: p.number === null ? "" : String(p.number), size: p.size ?? "" });
    setSaved("");
  }

  function save(p: Participant) {
    const prev = { ...p };
    const num = draft.number === "" ? null : parseInt(draft.number, 10);
    const patch = {
      shirtName: draft.shirtName.toUpperCase(),
      number: num,
      size: (draft.size === "" ? null : draft.size) as Size | null,
    };
    const changes: string[] = [];
    if (prev.shirtName !== patch.shirtName) changes.push("Nombre para camiseta");
    if (prev.number !== num) changes.push("Número");
    if (prev.size !== patch.size) changes.push("Talla");

    if (num !== null && participants.some((x) => x.id !== p.id && x.number === num)) {
      setSaved("Ese número ya pertenece a otro participante.");
      return;
    }

    updateParticipant(
      order.id,
      p.id,
      {
        shirtName: patch.shirtName,
        number: num,
        size: patch.size,
        registrationStatus:
          patch.shirtName && num !== null && patch.size ? "completo" : "pendiente",
      },
      changes.length > 0
        ? {
            user: fullName,
            role: fullName,
            field: changes.join(", "),
            oldValue: "Edición",
            newValue: "Datos corregidos",
          }
        : undefined
    );
    setEditing(null);
    setSaved("Datos guardados en el pedido; quedaron registrados en el historial.");
  }

  return (
    <div className="space-y-6">
      {saved && (
        <div className="rounded-xl bg-ok-bg px-4 py-3 text-xs font-medium text-ok">{saved}</div>
      )}

      {editable && (
        <div className="rounded-xl border border-primary/20 bg-primary-100/50 px-4 py-3 text-xs text-primary-600">
          La lista está abierta: puedes corregir datos de participantes. Cada cambio queda en el
          historial del pedido.
        </div>
      )}

      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-canvas text-xs uppercase tracking-wide text-ink-mute">
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Número</th>
              <th className="px-4 py-3 font-semibold">Talla</th>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              {showPayment && <th className="px-4 py-3 font-semibold">Pago</th>}
              {editable && <th className="px-4 py-3 font-semibold" />}
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 && (
              <tr>
                <td colSpan={showPayment ? 8 : 7} className="px-4 py-8 text-center text-sm text-ink-mute">
                  Aún no hay participantes invitados.
                </td>
              </tr>
            )}
            {participants.map((p) => (
              <ParticipantRows
                key={p.id}
                p={p}
                editable={editable}
                editing={editing === p.id}
                draft={draft}
                setDraft={setDraft}
                onEdit={() => startEdit(p)}
                onCancel={() => setEditing(null)}
                onSave={() => save(p)}
                desktop
                showPayment={showPayment}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {participants.map((p) => (
          <ParticipantRows
            key={p.id}
            p={p}
            editable={editable}
            editing={editing === p.id}
            draft={draft}
            setDraft={setDraft}
            onEdit={() => startEdit(p)}
            onCancel={() => setEditing(null)}
            onSave={() => save(p)}
            showPayment={showPayment}
          />
        ))}
      </div>
    </div>
  );
}

function ParticipantRows({
  p,
  editable,
  editing,
  draft,
  setDraft,
  onEdit,
  onCancel,
  onSave,
  desktop = false,
  showPayment = true,
}: {
  p: Participant;
  editable: boolean;
  editing: boolean;
  draft: { shirtName: string; number: string; size: Size | "" };
  setDraft: (d: { shirtName: string; number: string; size: Size | "" }) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  desktop?: boolean;
  showPayment?: boolean;
}) {
  const complete = p.registrationStatus === "completo";
  const paid = p.payment?.estado === "pagado";

  if (desktop) {
    return (
      <tr className="border-b border-border/60 last:border-0">
        <td className="px-4 py-3">
          <p className="font-semibold text-ink">{p.fullName}</p>
          {!complete && <span className="text-xs text-ink-mute">Invitación enviada</span>}
        </td>
        <td className="px-4 py-3">
          <Badge tone={p.type === "arquero" ? "blue" : "gray"}>
            {p.type === "arquero" ? "Arquero" : "Jugador"}
          </Badge>
        </td>
        <td className="px-4 py-3 font-semibold text-ink">{p.number ?? "—"}</td>
        <td className="px-4 py-3">{p.size ?? "—"}</td>
        <td className="px-4 py-3 text-ink-soft">{p.product}</td>
        <td className="px-4 py-3">
          <Badge tone={complete ? "green" : "amber"}>{complete ? "Completo" : "Pendiente"}</Badge>
        </td>
        {showPayment && (
          <td className="px-4 py-3">
            <Badge tone={paid ? "green" : "gray"}>{paid ? "Pagado" : "Pendiente"}</Badge>
          </td>
        )}
        {editable && (
          <td className="px-4 py-3 text-right">
            <button onClick={onEdit} className="cursor-pointer text-xs font-semibold text-primary hover:text-primary-600">
              {editing ? "✕" : "Corregir"}
            </button>
          </td>
        )}
      </tr>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ink">{p.fullName}</p>
          <p className="text-xs text-ink-soft">
            {p.type === "arquero" ? "Arquero" : "Jugador"} · {p.product}
          </p>
        </div>
        <Badge tone={complete ? "green" : "amber"}>{complete ? "Completo" : "Pendiente"}</Badge>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
        <Segment label="N°" value={p.number === null ? "—" : String(p.number)} />
        <Segment label="Talla" value={p.size ?? "—"} />
        {showPayment && <Segment label="Pago" value={paid ? "Pagado" : "Pendiente"} />}
      </div>
      {editable && (
        <button onClick={onEdit} className="mt-3 cursor-pointer text-xs font-semibold text-primary hover:text-primary-600">
          {editing ? "✕ Cancelar edición" : "Corregir datos"}
        </button>
      )}
      {editing && <Editor draft={draft} setDraft={setDraft} onSave={onSave} onCancel={onCancel} />}
    </div>
  );
}

function Segment({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg bg-canvas px-2 py-1 font-semibold text-ink">
      {label}: {value}
    </span>
  );
}

function Editor({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: { shirtName: string; number: string; size: Size | "" };
  setDraft: (d: { shirtName: string; number: string; size: Size | "" }) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 grid gap-2 rounded-xl border border-border bg-canvas p-3 sm:grid-cols-3">
      <label className="block">
        <span className="mb-1 block text-[10px] font-bold uppercase text-ink-mute">Nombre camiseta</span>
        <input
          value={draft.shirtName}
          onChange={(e) => setDraft({ ...draft, shirtName: e.target.value.toUpperCase() })}
          className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-primary"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-bold uppercase text-ink-mute">Número</span>
        <input
          inputMode="numeric"
          value={draft.number}
          onChange={(e) => setDraft({ ...draft, number: e.target.value.replace(/\D/g, "").slice(0, 2) })}
          className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-primary"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-bold uppercase text-ink-mute">Talla</span>
        <select
          value={draft.size}
          onChange={(e) => setDraft({ ...draft, size: e.target.value as Size | "" })}
          className="w-full cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">—</option>
          {SIZES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-2 sm:col-span-3">
        <Btn onClick={onSave} className="flex-1">
          Guardar
        </Btn>
        <Btn variant="ghost" onClick={onCancel}>
          Cancelar
        </Btn>
      </div>
    </div>
  );
}