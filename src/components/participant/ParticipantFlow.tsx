"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { getOrder, getParticipants, getOrderStatus, saveParticipant, markPayment } from "@/lib/store";
import { canEditParticipants, statusLabel } from "@/lib/status";
import { useMounted } from "@/lib/hooks";
import type { Participant, Size } from "@/lib/types";

const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];
const STEPS = ["Tipo", "Nombre", "Número", "Talla", "Producto"];

export default function ParticipantFlow({
  orderId,
  token,
}: {
  orderId: string;
  token: string;
}) {
  const mounted = useMounted();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<"jugador" | "arquero" | null>(null);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [size, setSize] = useState<Size | null>(null);
  const [product, setProduct] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [paid, setPaid] = useState(false);
  const [voucher, setVoucher] = useState("");
  const [savedId, setSavedId] = useState("");

  const order = mounted ? getOrder(orderId) : undefined;
  const status = mounted ? getOrderStatus(orderId) : "creado";
  const participants = mounted ? getParticipants(orderId) : [];

  const occupied = useMemo(
    () =>
      participants
        .filter((p) => p.registrationStatus === "completo" && p.number !== null)
        .map((p) => p.number as number),
    [participants]
  );

  if (!mounted) return <div className="min-h-dvh" />;

  if (!order) {
    return (
      <MobileShell>
        <div className="rounded-2xl border border-border bg-white px-6 py-10 text-center">
          <p className="text-lg font-bold text-ink">Enlace no válido</p>
          <p className="mt-1 text-sm text-ink-soft">
            Este enlace de registro no corresponde a un pedido activo.
          </p>
        </div>
      </MobileShell>
    );
  }

  const num = number === "" ? null : parseInt(number, 10);
  const numOk = num !== null && num >= 1 && num <= 99;
  const numFree = numOk && !occupied.includes(num);
  const editableStatus = canEditParticipants(status);
  const openPending = status === "diseno_aprobado";
  const cur = order;

  function go(next: number) {
    setErr("");
    if (next > step) {
      if (step === 0 && !type) return setErr("Selecciona: Jugador o Arquero.");
      if (step === 1 && !name.trim()) return setErr("Ingresa el nombre para la camiseta.");
      if (step === 2) {
        if (number === "" || !numOk) return setErr("Ingresa un número válido (1 a 99).");
        if (!numFree) return setErr("Este número ya está ocupado. Elige otro.");
      }
      if (step === 3 && !size) return setErr("Selecciona una talla.");
      if (step === 4 && type === "arquero" && !color) return setErr("Selecciona el color de arquero.");
      if (step === 4 && !product) return setErr("Selecciona un producto.");
    }
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function confirm() {
    const part: Participant = {
      id: `${cur.id}-${token}-${Date.now()}`,
      fullName: name.trim().toLowerCase().replace(/^./, (c) => c.toUpperCase()),
      shirtName: name.trim().toUpperCase(),
      number: num,
      size,
      type: type ?? "jugador",
      product,
      goalkeeperColor: type === "arquero" ? color : null,
      escudo: cur.config.components.escudo,
      short: cur.config.components.short,
      medias: cur.config.components.medias,
      observation: "",
      registrationStatus: "completo",
      payment: null,
      link: token,
      invited: false,
    };
    const saved = saveParticipant(orderId, part);
    setSavedId(saved.id);
    setDone(true);
    window.scrollTo({ top: 0 });
  }

  if (done) {
    return (
      <MobileShell>
        <div className="flex flex-col items-center rounded-3xl border border-border bg-white px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ok-bg text-ok">
            <Icon.check className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-ink">Datos registrados correctamente</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Tu información quedó guardada dentro del pedido{" "}
            <b className="text-ink">{order.id}</b> para {order.client}.
          </p>

          <div className="mt-6 w-full rounded-2xl bg-canvas px-4 py-4 text-left">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-mute">
              Pago del participante · S/ 45
            </p>
            {paid ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-ok">
                <Icon.check className="h-4 w-4" /> Pago registrado como realizado
              </p>
            ) : (
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border px-3 py-2.5 text-xs text-ink-soft">
                  {voucher ? `✓ ${voucher}` : "Subir comprobante (simulado)"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setVoucher(e.target.files?.[0]?.name ?? "")}
                  />
                </label>
                <button
                  onClick={() => {
                    markPayment(orderId, savedId, "pagado", voucher);
                    setPaid(true);
                  }}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white"
                >
                  He realizado mi pago
                </button>
              </div>
            )}
          </div>

          <p className="mt-6 text-xs text-ink-mute">
            Puedes cerrar esta página. El coordinador del grupo confirma los pagos.
          </p>
        </div>
      </MobileShell>
    );
  }

  if (openPending) {
    return (
      <MobileShell>
        <InfoCard icon={<Icon.alert className="h-5 w-5" />} title="Registro aún no abierto">
          El coordinador del pedido abrirá el registro próximamente. Vuelve con tu enlace más tarde.
        </InfoCard>
      </MobileShell>
    );
  }

  if (!editableStatus) {
    return (
      <MobileShell>
        <InfoCard icon={<Icon.x className="h-5 w-5" />} title="Registro cerrado">
          El periodo de registro para el pedido <b>{order.id}</b> terminó (estado:{" "}
          {statusLabel(status)}). Cualquier cambio requiere autorización del coordinador.
        </InfoCard>
      </MobileShell>
    );
  }

  const isLast = step === STEPS.length - 1;

  return (
    <MobileShell>
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-primary">Pedido {order.id}</p>
          <span className="text-[11px] text-ink-mute">{order.client}</span>
        </div>
        <h1 className="mt-1 text-xl font-extrabold text-ink">Registro de participante</h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-white p-5">
        {step === 0 && (
          <Step>
            <h2 className="mb-1 text-sm font-bold text-ink">¿Qué tipo de participante eres?</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(
                [
                  ["jugador", "⚽", "JUGADOR"],
                  ["arquero", "🧤", "ARQUERO"],
                ] as const
              ).map(([t, icon, label]) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-6 text-sm font-bold transition-colors ${
                    type === t
                      ? "border-primary bg-primary text-white"
                      : "border-border text-ink hover:border-primary"
                  }`}
                >
                  <span className="text-3xl">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step>
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-ink">
                Nombre para camiseta <span className="text-error">*</span>
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                placeholder="Ej: ARTURO"
                className="w-full rounded-2xl border-2 border-border px-4 py-4 text-lg font-bold tracking-wide outline-none focus:border-primary"
              />
            </label>
            <p className="mt-2 text-xs text-ink-mute">
              Este será el nombre utilizado para la personalización.
            </p>
          </Step>
        )}

        {step === 2 && (
          <Step>
            <span className="mb-1 block text-sm font-bold text-ink">
              Número de camiseta <span className="text-error">*</span>
            </span>
            <input
              inputMode="numeric"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="30"
              className="w-full rounded-2xl border-2 border-border px-4 py-4 text-center text-3xl font-extrabold tabular-nums outline-none focus:border-primary"
            />
            {num && (
              <p
                className={`mt-2 flex items-center gap-1.5 text-sm font-semibold ${
                  numFree ? "text-ok" : "text-error"
                }`}
              >
                {numFree ? <Icon.check className="h-4 w-4" /> : <Icon.x className="h-4 w-4" />}
                {numFree ? "Número disponible" : "Este número ya está ocupado"}
              </p>
            )}
            <button
              onClick={() => setShowList((v) => !v)}
              className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft"
            >
              <Icon.info className="h-3.5 w-3.5" />
              {occupied.length} números ocupados · {showList ? "Ocultar lista" : "Ver lista"}
            </button>
            {showList && (
              <div className="mt-2 rounded-xl bg-canvas px-4 py-3 text-sm text-ink">
                Números ocupados:{" "}
                <b>{[...occupied].sort((a, b) => a - b).join(" · ")}</b>
              </div>
            )}
          </Step>
        )}

        {step === 3 && (
          <Step>
            <span className="mb-1 block text-sm font-bold text-ink">
              Talla <span className="text-error">*</span>
            </span>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-2xl border-2 py-3.5 text-sm font-bold transition-colors ${
                    size === s
                      ? "border-primary bg-primary text-white"
                      : "border-border text-ink hover:border-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step>
            <span className="mb-1 block text-sm font-bold text-ink">
              Producto <span className="text-error">*</span>
            </span>
            <div className="mt-2 space-y-2">
              {order.config.productOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setProduct(opt)}
                  className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-4 text-left transition-colors ${
                    product === opt
                      ? "border-primary bg-primary text-white"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <span className="text-sm font-bold">{opt}</span>
                  <span className="text-[10px] opacity-80">Configurado para este pedido</span>
                </button>
              ))}
            </div>

            {type === "arquero" && (
              <>
                <p className="mt-4 mb-2 text-sm font-bold text-ink">
                  Color de arquero <span className="text-error">*</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {order.config.goalkeeperColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`rounded-2xl border-2 px-2 py-3 text-xs font-bold transition-colors ${
                        color === c
                          ? "border-primary bg-primary text-white"
                          : "border-border text-ink hover:border-primary"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </Step>
        )}

        {step === 5 && (
          <Step>
            <h2 className="mb-1 text-sm font-bold text-ink">Revisa tus datos</h2>
            <p className="mb-3 text-xs text-ink-mute">
              Verifica antes de confirmar. La información queda guardada en {order.id}.
            </p>
            <PreviewCard
              base={order.config.colors[0] ?? "#1e3a8a"}
              alt={order.config.colors[1]}
              name={name.trim().toUpperCase()}
              number={num ?? 0}
              size={size ?? ""}
              type={type ?? "jugador"}
              arqueroColor={color}
            />
          </Step>
        )}

        {err && <p className="mt-3 text-sm font-semibold text-error">{err}</p>}
      </div>

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-2">
        {step > 0 && (
          <button
            onClick={() => go(step - 1)}
            className="rounded-2xl border-2 border-border bg-white px-5 font-semibold text-ink"
          >
            ←
          </button>
        )}
        {isLast ? (
          <button
            onClick={() => go(step + 1)}
            className="rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-md"
          >
            Revisar ✓
          </button>
        ) : step === 5 ? (
          <button
            onClick={confirm}
            className="rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-md"
          >
            Confirmar ✓
          </button>
        ) : (
          <button
            onClick={() => go(step + 1)}
            className="rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-md"
          >
            Continuar →
          </button>
        )}
      </div>
    </MobileShell>
  );
}

function Step({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-border bg-primary px-5 py-3.5">
        <p className="text-sm font-extrabold text-white">
          SIPES <span className="font-medium text-white/70">· registro</span>
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
        SIPES · registro de participantes
      </footer>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-white px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warn-bg text-warn">
        {icon}
      </div>
      <h1 className="mt-3 text-lg font-extrabold text-ink">{title}</h1>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}

function PreviewCard({
  base,
  alt,
  name,
  number,
  size,
  type,
  arqueroColor,
}: {
  base: string;
  alt?: string;
  name: string;
  number: number;
  size: string;
  type: "jugador" | "arquero";
  arqueroColor?: string | null;
}) {
  return (
    <div className="rounded-2xl bg-canvas p-4">
      <div
        className="relative mx-auto flex h-52 w-44 flex-col items-center justify-center overflow-hidden rounded-t-full rounded-b-2xl shadow-inner"
        style={{ background: base }}
      >
        {alt && (
          <span
            className="absolute inset-x-0 top-1/2 h-1/3 -translate-y-1/2"
            style={{ background: alt }}
          />
        )}
        <p className="relative -mt-8 text-xs font-bold tracking-widest" style={{ color: contrast(base) }}>
          {name || "NOMBRE"}
        </p>
        <p className="relative text-5xl font-extrabold italic" style={{ color: contrast(base) }}>
          {number || "?"}
        </p>
        <p className="relative mt-2 rounded-full bg-black/30 px-2 py-0.5 text-[9px] font-bold text-white">
          {type === "arquero" ? `ARQUERO · ${arqueroColor ?? ""}` : "JUGADOR"} · TALLA {size}
        </p>
      </div>
    </div>
  );
}

function contrast(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#111827" : "#ffffff";
}