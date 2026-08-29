"use client";

import { Badge, Card, EmptyModule, PageHeader } from "@/components/ui";
import { PROVIDERS } from "@/data/orders";
import { useSession } from "@/lib/session";
import { canSeeFinanceModule } from "@/lib/permissions";
import { useMounted } from "@/lib/hooks";

export default function ProvidersPage() {
  const mounted = useMounted();
  const { role } = useSession();

  if (!mounted) return <div className="h-64" />;

  if (!canSeeFinanceModule(role.id) && role.id !== "coordinador_operativo") {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Proveedores" />
        <EmptyModule title="Módulo restringido">
          Solo la administración y operaciones pueden gestionar proveedores.
        </EmptyModule>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Abastecimiento"
        title="Proveedores"
        description="Cuenta con las tarifas y pedidos asignados. Información interna de Sublitex."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {PROVIDERS.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-2 px-5 py-4">
              <div>
                <p className="text-base font-bold text-ink">{p.name}</p>
                <p className="text-xs text-ink-mute">{p.contact} · {p.service}</p>
              </div>
              <Badge tone={p.status === "activo" ? "green" : "gray"}>
                {p.status === "activo" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm">
              <span className="text-ink-soft">Tarifa</span>
              <span className="font-bold text-ink">{p.rate}</span>
            </div>
            <div className="border-t border-border px-5 py-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
                Pedidos asignados
              </p>
              <div className="flex flex-wrap gap-2">
                {p.assignedOrders.map((o) => (
                  <span key={o} className="rounded-lg bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-600">
                    {o}
                  </span>
                ))}
                {p.assignedOrders.length === 0 && <span className="text-xs text-ink-mute">Sin asignaciones</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}