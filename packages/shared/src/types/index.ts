/**
 * Domain types for the Workforce Roster Board application.
 * These types are shared between frontend (web) and backend (api).
 */

/**
 * Represents a draggable tag that can be a team member or asset.
 */
export interface Tag {
  id: string;
  name: string;
  type: 'member' | 'asset';
  color?: string;
  /** Track which location row the tag is assigned to */
  locationIndex?: number;
}

/**
 * Represents a work category column on the roster board.
 * Categories contain tags that have been assigned to them.
 */
export interface Category {
  id: string;
  name: string;
  tags: Tag[];
}

/**
 * Status of a roster day.
 */
export type RosterDayStatus = 'draft' | 'sent' | 'archived';

/**
 * Represents a single day's roster configuration.
 */
export interface RosterDay {
  id: string;
  date: string; // ISO date string
  status: RosterDayStatus;
  categories: Category[];
  locations: string[];
  holdingTags: Tag[];
  sentAt?: string;
  sentBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a team member in the system.
 */
export interface TeamMember {
  id: string;
  displayName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Asset types for equipment tracking.
 */
export type AssetType = 'plant' | 'vehicle' | 'equipment';

/**
 * Represents an asset (equipment, vehicle, plant) in the system.
 */
export interface Asset {
  id: string;
  name: string;
  assetType: AssetType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a work location.
 */
export interface Location {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Predefined work category definitions.
 */
export const DEFAULT_CATEGORIES: Omit<Category, 'tags'>[] = [
  { id: 'personnel', name: 'PERSONNEL' },
  { id: 'plant', name: 'PLANT' },
  { id: 'traffic-control', name: 'TRAFFIC CONTROL' },
  { id: 'contractors', name: 'CONTRACTORS' },
  { id: 'leave', name: 'LEAVE' },
  { id: 'training', name: 'TRAINING' },
];
