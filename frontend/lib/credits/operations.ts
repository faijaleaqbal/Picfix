/**
 * Central Operation Credit Cost Configuration for Picfix.
 *
 * Operation Costs:
 * - background removal: 1
 * - enhance: 2
 * - AI eraser: 2
 * - AI background: 4
 * - AI generation: 5
 * - AI replace/edit: 5
 * - headshot: 8
 * - face swap: 10
 * - 4K upscale: 10
 */

export const OPERATION_COSTS: Record<string, number> = {
  "background-removal": 1,
  "ai-enhance": 2,
  "ai-eraser": 2,
  "ai-background": 4,
  "ai-generation": 5,
  "ai-replace": 5,
  "ai-edit": 5,
  "headshot": 8,
  "face-swap": 10,
  "4k-upscale": 10,
} as const;

export type OperationType = keyof typeof OPERATION_COSTS | string;

/**
 * Get credit cost for a given operation.
 * Defaults to 0 if an operation is standard/free (e.g. basic crop, resize, rotate, pdf merge).
 */
export function getOperationCost(operation: string): number {
  if (operation in OPERATION_COSTS) {
    return OPERATION_COSTS[operation];
  }
  return 0;
}
