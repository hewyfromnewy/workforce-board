/**
 * View DTOs the board UI renders, plus the write inputs. These are derived from
 * the domain model (see @workforce/shared) by the repo/selectors, so components
 * never touch raw assignment history.
 */
import type {
  AssignmentSlot,
  DestinationType,
  IsoDate,
  JobSite,
  Resource,
  ResourceType,
} from '@workforce/shared';

/** A resource placed somewhere, carrying its slot (full/am/pm). */
export interface Placement {
  resource: Resource;
  slot: AssignmentSlot;
}

/** One job-site row of the daily board, resources grouped by type column. */
export interface SiteRow {
  site: JobSite;
  byType: Record<ResourceType, Placement[]>;
  note?: string;
  traffic?: { count: number; provider: string };
}

/** The fully-shaped daily board for one date. */
export interface BoardData {
  date: IsoDate;
  sites: SiteRow[];
  leave: Resource[];
  training: Placement[];
  unassigned: Resource[];
}

/** Where a resource can be dropped. */
export type Destination =
  | { type: 'job_site'; jobSiteId: string }
  | { type: 'leave' }
  | { type: 'training' }
  | { type: 'unassigned' };

export interface PlacementInput {
  resourceId: string;
  date: IsoDate;
  slot?: AssignmentSlot; // defaults to 'full'
  destination: Destination;
}

export function destinationTypeOf(d: Destination): DestinationType {
  return d.type;
}
