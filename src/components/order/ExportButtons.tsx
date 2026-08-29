"use client";

import { Icon } from "@/components/icons";
import { getParticipants } from "@/lib/store";
import type { Order } from "@/lib/types";

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButtons({ order }: { order: Order }) {
  const participants = getParticipants(order.id);

  function rows() {
    return participants
      .filter((x) => x.registrationStatus === "completo")
      .map((x) => ({
        nombre: x.shirtName || x.fullName,
        "nombre completo": x.fullName,
        numero: x.number ?? "",
        talla: x.size ?? "",
        producto: x.product,
        escudo: x.escudo === false ? "no" : x.escudo === true ? "si" : order.config.components.escudo ? "si" : "no",
        short: x.short === false ? "no" : order.config.components.short ? "si" : "no",
        medias: x.medias === false ? "no" : order.config.components.medias ? "si" : "no",
        arquero: x.type === "arquero" ? "si" : "no",
        genero: x.gender ?? "",
        corte: order.config.collar,
        color_arquero: (x.type === "arquero" ? x.goalkeeperColor : "") ?? "",
      }));
  }

  function toCSV() {
    const data = rows();
    if (data.length === 0) return;
    const head = Object.keys(data[0]);
    const lines = [
      head.join(","),
      ...data.map((r) =>
        head
          .map((k) => `"${String((r as Record<string, unknown>)[k]).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    download(`SIPES_${order.id}_list.csv`, lines.join("\n"), "text/csv;charset=utf-8;");
  }

  function toJSON() {
    download(
      `SIPES_${order.id}_list.json`,
      JSON.stringify(rows(), null, 2),
      "application/json"
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-mute">Exportar:</p>
      <button
        onClick={toCSV}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas"
      >
        <Icon.download className="h-3.5 w-3.5" /> CSV
      </button>
      <button
        onClick={toCSV}
        title="Simulado: genera archivo CSV compatible con Excel"
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas"
      >
        <Icon.download className="h-3.5 w-3.5" /> Excel
      </button>
      <button
        onClick={toJSON}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas"
      >
        <Icon.download className="h-3.5 w-3.5" /> JSON
      </button>
      <span className="text-[11px] text-ink-mute">Campos operativos listos para CorelDRAW.</span>
    </div>
  );
}