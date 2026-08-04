/**
 * Crew & Plant Planner — v1 domain model.
 *
 * The six entities from the v1 specification (§3), kept deliberately small.
 * These are the foundation the app is built on; the legacy UI types in
 * `./types` (Tag/Category) are being migrated onto this model (see issue #1).
 *
 * Field naming is camelCase in TypeScript and maps to snake_case columns in the
 * Drizzle schema (e.g. `jobNumber` <-> `job_number`).
 */

/** ISO date, no time component — `YYYY-MM-DD`. Assignments/leave are per-day. */
export type IsoDate = string;

/** ISO 8601 timestamp — used for append-only history ordering. */
export type IsoTimestamp = string;

/**
 * Crew the resource/job site belongs to.
 *
 * v1 is a single crew and the app filters to it; the field exists now so
 * multi-crew (§6) is a cheap future add and never a retrofit. There is NO
 * crew-switching UI in v1.
 */
export type CrewId = string;

/** The single crew v1 operates on. */
export const DEFAULT_CREW: CrewId = 'road-construction';

// ---------------------------------------------------------------------------
// Resource
// ---------------------------------------------------------------------------

export type ResourceType = 'person' | 'plant' | 'hire' | 'contractor';

/**
 * A person or piece of plant/hire/contractor — anything that was a magnet on
 * the physical board.
 */
export interface Resource {
  id: string;
  /** e.g. "Chris Chamberlain", "Excavator 13T", "188 Ute" */
  name: string;
  type: ResourceType;
  crew: CrewId;
  /**
   * Nullable, unused in v1. Exists so costings (§6) can be added without a
   * migration. Never surfaced in the v1 UI.
   */
  rate: number | null;
  /** Soft-delete flag. Resources are never hard-deleted (§3, §6 history). */
  active: boolean;
}

// ---------------------------------------------------------------------------
// JobSite
// ---------------------------------------------------------------------------

export type JobSiteStatus = 'active' | 'complete';

/** A job site — a row on the whiteboard, identified by a job number. */
export interface JobSite {
  id: string;
  /** e.g. "Clarence Town Rd Seg 170" */
  name: string;
  /** e.g. "13590" */
  jobNumber: string;
  crew: CrewId;
  startDate: IsoDate | null;
  endDate: IsoDate | null;
  status: JobSiteStatus;
}

// ---------------------------------------------------------------------------
// Assignment  (the append-only core)
// ---------------------------------------------------------------------------

/**
 * Half-day slot. Most assignments are `full`; a split day is one `am` row plus
 * one `pm` row (§8 Q1, assumed "yes"). Deliberately NOT free-form hours — that
 * would drift into timesheets, which are out of scope (§5).
 */
export type AssignmentSlot = 'full' | 'am' | 'pm';

export type DestinationType = 'job_site' | 'leave' | 'training' | 'unassigned';

/**
 * The placement of a resource for a given date + slot.
 *
 * **Invariant:** one assignment per resource per date per slot, and a `full`
 * slot excludes `am`/`pm` on the same date. This mirrors the physical
 * constraint that a magnet can only be in one place, so clash prevention is
 * enforced by the data model (a unique constraint on
 * `(resourceId, date, slot)`) rather than by validation logic.
 *
 * **Append-only:** rows are never overwritten or deleted. A change writes a new
 * row with a later `createdAt`; the read layer resolves the latest decision per
 * `(resourceId, date)`. Six months of history cannot be reconstructed, so it is
 * kept from day one (§6).
 */
export interface Assignment {
  id: string;
  resourceId: string;
  date: IsoDate;
  slot: AssignmentSlot;
  destinationType: DestinationType;
  /** The JobSite id when `destinationType === 'job_site'`, else null. */
  destinationId: string | null;
  /** History ordering for the append-only read projection. */
  createdAt: IsoTimestamp;
}

// ---------------------------------------------------------------------------
// DayNote
// ---------------------------------------------------------------------------

/** Free-text scrawl against a job site for a day ("shovel, concrete rakes, broom"). */
export interface DayNote {
  jobSiteId: string;
  date: IsoDate;
  text: string;
}

// ---------------------------------------------------------------------------
// TrafficControl
// ---------------------------------------------------------------------------

/**
 * Traffic control for a job site on a day, recorded as a count + provider
 * (e.g. 3, "PTS Traffic"). Deliberately not modelled as named people, because
 * the board doesn't.
 */
export interface TrafficControl {
  jobSiteId: string;
  date: IsoDate;
  count: number;
  provider: string;
}

// ---------------------------------------------------------------------------
// LeaveRecord
// ---------------------------------------------------------------------------

export type LeaveSource = 'manual' | 'import';

/**
 * A resource on leave for a day. Full-day only in v1 — no slot (half-day leave
 * is a deliberate future extension, see issue #10).
 */
export interface LeaveRecord {
  resourceId: string;
  date: IsoDate;
  source: LeaveSource;
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

/**
 * The resource-type columns shown on the daily (whiteboard-shaped) view, in
 * board order. Leave and Training are rendered as their own areas, not columns.
 */
export const RESOURCE_TYPE_COLUMNS: { type: ResourceType; label: string }[] = [
  { type: 'person', label: 'PERSONNEL' },
  { type: 'plant', label: 'PLANT' },
  { type: 'hire', label: 'HIRE' },
  { type: 'contractor', label: 'CONTRACTORS' },
];
