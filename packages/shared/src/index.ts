/**
 * @workforce/shared
 * Shared types and utilities for the Workforce Board monorepo.
 */

// v1 domain model (Resource / JobSite / Assignment / DayNote / TrafficControl /
// LeaveRecord). This is the foundation — prefer importing from here.
export * from './domain';

// Legacy Figma-export UI types (Tag/Category), kept during the migration (#1).
export * from './types';
