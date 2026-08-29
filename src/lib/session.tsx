"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { RoleId } from "./types";

export interface RoleInfo {
  id: RoleId;
  label: string;
  user: string;
  short: string;
}

export const ROLES: RoleInfo[] = [
  { id: "administrador", label: "Administrador", user: "Valeria Núñez", short: "VN" },
  { id: "coordinador_operativo", label: "Coordinador Operativo", user: "César Manrique", short: "CM" },
  { id: "vendedora", label: "Vendedora", user: "María Paredes", short: "MP" },
  { id: "coordinador_cliente", label: "Coordinador del Cliente", user: "Pablo Riquelme", short: "PR" },
  { id: "diseno", label: "Diseño", user: "Renzo Aguilar", short: "RA" },
  { id: "produccion", label: "Producción", user: "Jorge Vicente", short: "JV" },
  { id: "participante", label: "Participante", user: "—", short: "—" },
];

interface SessionCtx {
  role: RoleInfo;
  setRole: (r: RoleId) => void;
  reset: () => void;
}

const Ctx = createContext<SessionCtx | null>(null);
const KEY = "sipes.mock.role";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [roleId, setRoleId] = useState<RoleId>("administrador");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY) as RoleId | null;
      if (stored && ROLES.some((r) => r.id === stored)) setRoleId(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<SessionCtx>(() => {
    const role = ROLES.find((r) => r.id === roleId) ?? ROLES[0];
    return {
      role,
      setRole: (r) => {
        setRoleId(r);
        try {
          window.localStorage.setItem(KEY, r);
        } catch {
          /* ignore */
        }
      },
      reset: () => {
        try {
          window.localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
        setRoleId("administrador");
      },
    };
  }, [roleId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}