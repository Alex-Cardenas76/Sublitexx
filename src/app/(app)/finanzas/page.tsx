"use client";

import { Card, EmptyModule, PageHeader } from "@/components/ui";
import { useSession } from "@/lib/session";
import { useStoreVersion, getOrders } from "@/lib/store";
import { canSeeFinanceModule } from "@/lib/permissions";
import { useMounted } from "@/lib/hooks";
import type { CommercialInfo } from "@/lib/types";

const fmtMoney = (n: number) => `S/ ${n.toLocaleString("es-PE")}`;

export default function FinancePage() {
  const mounted = useMounted();
  const { role } = useSession();
  useStoreVersion();

  if (!mounted) return <div className="h-64" />;

  if (!canSeeFinanceModule(role.id)) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Finanzas" />
        <EmptyModule title="Módulo restringido">
          Solo los roles autorizados pueden visualizar costos, venta, saldo y utilidad. Diseño y
          Producción acceden únicamente a información operativa.
        </EmptyModule>
      </div>
    );
  }

  const orders = getOrders();

  const total = orders.reduce(
    (acc, o) => ({
      venta: acc.venta + o.commercial.venta,
      cobrado: acc.cobrado + o.commercial.cobrado,
      saldo: acc.saldo + o.commercial.saldo,
      utilidad: acc.utilidad + o.commercial.utilidad,
    }),
    { venta: 0, cobrado: 0, saldo: 0, utilidad: 0 }
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Comercial e interno"
        title="Finanzas"
        description="Costos, venta, cobrado, saldo y utilidad por pedido. No visible para Diseño ni Producción."
      />

      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Venta total" value={fmtMoney(total.venta)} />
        <Stat label="Cobrado" value={fmtMoney(total.cobrado)} />
        <Stat label="Saldo por cobrar" value={fmtMoney(total.saldo)} tone="amber" />
        <Stat label="Utilidad estimada" value={fmtMoney(total.utilidad)} tone="green" />
      </div>

      <Card title="Detalle por pedido" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas text-[11px] uppercase tracking-wide text-ink-mute">
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Venta</th>
                <th className="px-4 py-3 font-semibold">Cobrado</th>
                <th className="px-4 py-3 font-semibold">Saldo</th>
                <th className="px-4 py-3 font-semibold">Costos</th>
                <th className="px-4 py-3 font-semibold">Utilidad</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <FinanceRow
                  key={o.id}
                  id={o.id}
                  client={o.client}
                  c={o.commercial}
                  cost={costSum(o.commercial)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function costSum(c: CommercialInfo): number {
  const x = c.costs;
  return x.tela + x.impresion + x.costura + x.bordado + x.otros;
}

function Stat({ label, value, tone = "dark" }: { label: string; value: string; tone?: string }) {
  const tones: Record<string, string> = {
    dark: "bg-ink text-white",
    green: "bg-ok text-white",
    amber: "bg-warn text-white",
  };
  return (
    <div className={`rounded-2xl px-4 py-3 ${tones[tone]}`}>
      <p className="text-lg font-extrabold sm:text-xl">{value}</p>
      <p className="text-[10px] font-semibold opacity-80">{label}</p>
    </div>
  );
}

function FinanceRow({
  id,
  client,
  c,
  cost,
}: {
  id: string;
  client: string;
  c: CommercialInfo;
  cost: number;
}) {
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="px-4 py-3 font-bold text-ink">{id}</td>
      <td className="px-4 py-3 text-ink-soft">{client}</td>
      <td className="px-4 py-3">{fmtMoney(c.venta)}</td>
      <td className="px-4 py-3">{fmtMoney(c.cobrado)}</td>
      <td className="px-4 py-3 font-semibold">{fmtMoney(c.saldo)}</td>
      <td className="px-4 py-3 text-ink-soft">{fmtMoney(cost)}</td>
      <td className="px-4 py-3 font-bold text-primary">{fmtMoney(c.utilidad)}</td>
    </tr>
  );
}