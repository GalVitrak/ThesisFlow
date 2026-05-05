"use client";

import { useSyncExternalStore } from "react";

const MOBILE_MQ = "(max-width: 899px)";

function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MQ).matches;
}

function getMobileServerSnapshot() {
  return false;
}

/** True when viewport is mobile / tablet single-column layout (sidebar becomes overlay). */
export function useIsMobileLayout() {
  return useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
}
