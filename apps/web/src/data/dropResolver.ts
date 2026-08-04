/**
 * Pure decision logic for what a drop onto a job site should do. Extracted from
 * the component so the branching (the riskiest part, and hard to drive through
 * react-dnd headlessly) is unit-testable.
 */
import type { AssignmentSlot } from '@workforce/shared';

export interface DropInfo {
  sitePlacements: { siteId: string; slot: AssignmentSlot }[];
  inTraining: boolean;
  onLeave: boolean;
}

export type DropAction =
  | { kind: 'noop' }
  | { kind: 'place'; slot: AssignmentSlot } // place at target with this slot
  | { kind: 'override'; reason: 'leave' | 'training' }
  | { kind: 'movesplit'; sourceSiteId: string };

/** Decide the outcome of dropping a resource (dragging `draggedSlot`) onto `targetSiteId`. */
export function resolveSiteDrop(
  info: DropInfo,
  targetSiteId: string,
  draggedSlot: AssignmentSlot,
): DropAction {
  if (info.onLeave) return { kind: 'override', reason: 'leave' };
  if (info.inTraining) return { kind: 'override', reason: 'training' };

  if (info.sitePlacements.length === 0) return { kind: 'place', slot: 'full' };

  const full = info.sitePlacements.find((p) => p.slot === 'full');
  if (full) {
    if (full.siteId === targetSiteId) return { kind: 'noop' };
    return { kind: 'movesplit', sourceSiteId: full.siteId };
  }
  // Already split into halves — move the dragged half to the target.
  return { kind: 'place', slot: draggedSlot };
}
