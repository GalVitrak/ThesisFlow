import type { GradingWeights } from "@/lib/types";

/**
 * Weighted sum of component scores (each 0–100). Weights should sum to ~1.
 */
export function computeFinalGrade(
  scores: Record<string, number>,
  weights: GradingWeights,
): number {
  const w = weights.weights;
  let total = 0;
  let used = 0;
  for (const key of Object.keys(w)) {
    const weight = w[key];
    if (scores[key] == null) continue;
    total += scores[key] * weight;
    used += weight;
  }
  if (used === 0) return 0;
  const normalized = total / used;
  return Math.round(normalized * 10) / 10;
}

export function weightsSum(weights: Record<string, number>): number {
  return Object.values(weights).reduce((a, b) => a + b, 0);
}
