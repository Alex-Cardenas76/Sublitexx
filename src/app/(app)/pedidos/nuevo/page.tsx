"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Btn, Card, EmptyModule, Field, Input, PageHeader } from "@/components/ui";
import { useSession } from "@/lib/session";
import { useStoreVersion, createOrder, nextOrderId } from "@/lib/store";
import { canManageOrders } from "@/lib/permissions";
import { useMounted } from "@/lib/hooks";
import type { Order } from "@/lib/types";

const COLLARS = ["Redondo", "Cuello v", "Polo"];
const PRODS = ["Conjunto deportivo", "Camiseta deportiva", "Conjunto + adicionales"];

export default function NewOrderPage() {
  const mounted = useMounted();
  const { role } = useSession();
  useStoreVersion();
  const [created, setCreated] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    client: "",
    contact: "",
    amount: "",
    tipoCliente: "Club",
    product: "Conjunto deportivo",
    tela: "",
    collar: "Redondo",
    colors: "",
    special: "",
    goalkeeperColors: "Negro",
    camiseta: true,
    short: true,
    medias: true,
    escudo: true,
  });
  const [err, setErr] = useState("");

  if (!mounted) return <div className="h-64" />;
  if (!canManageOrders(role.id)) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Nuevo pedido" />
        <EmptyModule title="Acción no disponible para tu rol">
          Solo el Administrador o el Coordinador Operativo pueden crear pedidos. Los pedidos se
          confirman primero en GoHighLevel.
        </EmptyModule>
      </div>
    );
  }

  const id = nextOrderId();

  function handleCreate() {
    if (!form.client.trim() || !form.amount || Number(form.amount) <= 0) {
      setErr("Ingresa al menos el cliente y la cantidad de participantes.");
      return;
    }
    const code = id.replace("SUB-000", "");
    const order: Order = {
      id,
      code,
      client: form.client.trim(),
      contact: form.contact.trim() || "Por definir",
      seller: "María Paredes",
      coordinator: "",
      date: new Date().toISOString().slice(0, 10),
      source: "GoHighLevel",
      ghlContactId: "12680",
      ghlOpportunityId: "99100",
      status: "creado",
      config: {
        tipoCliente: form.tipoCliente,
        product: form.product,
        productOptions: [form.product],
        quantity: Number(form.amount),
        tela: form.tela.trim(),
        collar: form.collar,
        colors: form.colors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        components: { camiseta: form.camiseta, short: form.short, medias: form.medias, escudo: form.escudo },
        specialFeatures: form.special
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        goalkeeperColors: form.goalkeeperColors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
      design: { propuesta: "—", version: "", archivo: "", estado: "pendiente", colores: [] },
      production: { metraje: "", proveedorTela: "", proveedorCostura: "", notas: "" },
      commercial: {
        venta: 0,
        adelanto: 0,
        cobrado: 0,
        saldo: 0,
        utilidad: 0,
        costs: { tela: 0, impresion: 0, costura: 0, bordado: 0, otros: 0 },
      },
      participants: [],
      exceptions: [],
      history: [
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          user: "María Paredes",
          role: "Vendedora",
          field: "Pedido",
          oldValue: "—",
          newValue: "Confirmado desde GoHighLevel",
        },
      ],
    };
    createOrder(order);
    setCreated(order);
    window.scrollTo({ top: 0 });
  }

  const link = created
    ? `https://sipes.pe/pedido/${created.code}/jugador/${Math.random().toString(36).slice(2, 8)}`
    : "";

  if (created) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-ok/30 bg-ok-bg px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ok text-white">
              <Icon.check className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-ink">Pedido creado correctamente</p>
              <p className="text-sm text-ink-soft">{created.id}</p>
            </div>
          </div>
        </div>

        <Card className="mt-6 p-5">
          <h3 className="mb-1 text-sm font-semibold text-ink">Enlace para participantes</h3>
          <p className="mb-4 text-xs text-ink-mute">
            Los participantes acceden con este enlace y sus datos quedan registrados dentro de{" "}
            {created.id}.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <code className="flex-1 rounded-xl border border-border bg-canvas px-4 py-3 text-sm break-all text-ink-soft">
              {link}
            </code>
            <Btn
              onClick={() => {
                navigator.clipboard?.writeText(link).catch(() => undefined);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              <Icon.link className="h-4 w-4" /> {copied ? "Copiado ✓" : "Copiar enlace"}
            </Btn>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
            <Link
              href={`/pedidos/${created.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
            >
              Ir al pedido →
            </Link>
            <Link
              href="/pedidos"
              className="inline-flex items-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:bg-canvas"
            >
              Volver a pedidos
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Operación"
        title="Nuevo pedido"
        description={`Se generará como ${id}. Los datos comerciales provienen de GoHighLevel.`}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        className="space-y-5"
      >
        <Card title="Datos generales">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="ID de pedido">
              <Input value={id} readOnly className="bg-canvas font-semibold" />
            </Field>
            <Field label="Origen" hint="Información comercial de GoHighLevel.">
              <Input value="GoHighLevel · Contact 12680 · Opp 99100" readOnly className="bg-canvas" />
            </Field>
            <Field label="Cliente" required>
              <Input
                placeholder="Ej: Club Universitario Los Olivos"
                value={form.client}
                onChange={(e) => set("client", e.target.value)}
              />
            </Field>
            <Field label="Contacto">
              <Input
                placeholder="Nombre del coordinador del cliente"
                value={form.contact}
                onChange={(e) => set("contact", e.target.value)}
              />
            </Field>
            <Field label="Vendedor">
              <Input value="María Paredes" readOnly className="bg-canvas" />
            </Field>
            <Field label="Fecha">
              <Input value={new Date().toISOString().slice(0, 10)} readOnly className="bg-canvas" />
            </Field>
          </div>
        </Card>

        <Card title="Configuración del pedido">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Tipo de cliente">
              <select
                value={form.tipoCliente}
                onChange={(e) => set("tipoCliente", e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              >
                <option>Club</option>
                <option>Empresa</option>
                <option>Selección amateur</option>
              </select>
            </Field>
            <Field label="Cantidad (participantes)" required>
              <Input
                type="number"
                min={1}
                placeholder="Ej: 18"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
            </Field>
            <Field label="Producto">
              <select
                value={form.product}
                onChange={(e) => set("product", e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              >
                {PRODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Cuello">
              <select
                value={form.collar}
                onChange={(e) => set("collar", e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              >
                {COLLARS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Tela">
              <Input
                placeholder="Ej: Pique 220 g (azul marino / blanco)"
                value={form.tela}
                onChange={(e) => set("tela", e.target.value)}
              />
            </Field>
            <Field label="Colores (separados por coma)">
              <Input
                placeholder="Ej: Azul marino, Blanco"
                value={form.colors}
                onChange={(e) => set("colors", e.target.value)}
              />
            </Field>
            <Field label="Colores de arquero">
              <Input
                placeholder="Ej: Negro, Verde, Azul"
                value={form.goalkeeperColors}
                onChange={(e) => set("goalkeeperColors", e.target.value)}
              />
            </Field>
            <Field label="Características especiales">
              <Input
                placeholder="Ej: Talle doble, Nombres al pecho"
                value={form.special}
                onChange={(e) => set("special", e.target.value)}
              />
            </Field>
          </div>

          <div className="border-t border-border px-5 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-mute">
              Componentes (los participantes los heredan)
            </p>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  ["camiseta", "Camiseta"],
                  ["short", "Short"],
                  ["medias", "Medias"],
                  ["escudo", "Escudo"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={form[k]}
                    onChange={(e) => set(k, e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </Card>

        {err && <p className="text-sm font-medium text-error">{err}</p>}

        <div className="flex justify-end gap-2">
          <Link href="/pedidos" className="inline-flex items-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
            Cancelar
          </Link>
          <Btn type="submit">
            Crear pedido <Icon.chevronRight className="h-4 w-4" />
          </Btn>
        </div>
      </form>
      <div className="mt-4 rounded-xl bg-info-bg px-4 py-3 text-xs text-info">
        ℹ En el MVP no se piden nuevamente datos comerciales: el precio, adelanto y saldo se
        importarán de GoHighLevel.
      </div>
    </div>
  );
}