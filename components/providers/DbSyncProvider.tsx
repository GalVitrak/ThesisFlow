"use client";

import { useEffect, useState } from "react";
import { subscribeDb } from "@/lib/mock/store";

/** Re-renders subtree when mock DB mutates (mock mode only). */
export function DbSyncProvider({ children }: { children: React.ReactNode }) {
  const [, setTick] = useState(0);
  useEffect(() => subscribeDb(() => setTick((x) => x + 1)), []);
  return <>{children}</>;
}
