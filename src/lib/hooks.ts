"use client";

import { useEffect, useState } from "react";

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function useNow(): string {
  return new Date().toTimeString().slice(0, 5);
}