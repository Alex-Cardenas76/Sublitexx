"use client";

import { Card, EmptyModule, PageHeader } from "@/components/ui";
import { useSession, ROLES } from "@/lib/session";
import { resetStore } from "@/lib/store";
import { useMounted } from "@/lib/hooks";

export default function SettingsPage() {
  const mounted = useMounted();
  const { role } = useSession();

  if (!mounted) return <div className="h-64" />;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Sistema"
        title="Configuración"
        description="Perfil y parámetros generales del MVP."
      />

      <Card title="Usuario actual (sesión de demostración)">
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {role.short}
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{role.user}</p>
            <p className="text-xs text-ink-mute">{role.label}</p>
          </div>
        </div>
        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button
            onClick={() => resetStore()}
            className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas"
          >
            Restablecer datos de demostración
          </button>
        </div>
      </Card>

      <Card title="Definir rol de acceso (demo)" className="mt-6 overflow-hidden">
        <ul className="divide-y divide-border">
          {ROLES.filter((r) => r.id !== "participante").map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 px-5 py-3 text-sm">
              <span className="font-medium text-ink">{r.label}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  role.id === r.id ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-ink-mute"
                }`}
              >
                {role.id === r.id ? "Activo" : r.user}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Separación de información" className="mt-6">
        <div className="grid gap-3 px-5 py-4 text-sm">
          <div className="rounded-xl bg-info-bg px-4 py-3 text-xs leading-relaxed text-info">
            <b>Información comercial:</b> precio de venta, adelanto, saldo, utilidad y márgenes. Solo
            roles autorizados.
          </div>
          <div className="rounded-xl bg-ok-bg px-4 py-3 text-xs leading-relaxed text-ok">
            <b>Información operativa:</b> participantes, tallas, números, nombres, cantidades,
            diseño, producción y metraje. Compartida con los equipos operativos.
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <EmptyModule title="Más módulos en desarrollo">
          La configuración avanzada (usuarios, permisos finos, integraciones) llegará en etapas
          posteriores del MVP conectadas a la API REST.
        </EmptyModule>
      </div>
    </div>
  );
}