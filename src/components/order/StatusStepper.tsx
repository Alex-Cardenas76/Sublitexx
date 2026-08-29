"use client";

import { Icon } from "@/components/icons";
import { STATUS_FLOW, statusIndex } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";

export default function StatusStepper({ status }: { status: OrderStatus }) {
  const current = statusIndex(status);

  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex min-w-max items-start gap-1">
        {STATUS_FLOW.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.key} className="flex flex-col items-center">
              <div className="flex items-center">
                <button
                  disabled
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    active
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : done
                        ? "bg-primary-100 text-primary-600"
                        : "bg-gray-100 text-ink-mute"
                  }`}
                >
                  {done ? <Icon.check className="h-3.5 w-3.5" /> : i + 1}
                </button>
                {i < STATUS_FLOW.length - 1 && (
                  <span
                    className={`h-0.5 w-6 sm:w-9 ${i < current ? "bg-primary-500" : "bg-gray-200"}`}
                  />
                )}
              </div>
              <span
                className={`mt-1.5 w-16 text-center text-[9px] leading-tight ${
                  active ? "font-bold text-primary" : done ? "text-ink-soft" : "text-ink-mute"
                }`}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}