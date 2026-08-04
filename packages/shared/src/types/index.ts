/**
 * Legacy UI types from the Figma-export prototype.
 *
 * @deprecated These describe the old vocabulary (member/asset tags dropped into
 * category columns) and are being migrated onto the v1 domain model in
 * `../domain.ts` (Resource / JobSite / Assignment / ...). See issue #1. New code
 * should import from the domain model; these remain only so the existing web app
 * keeps compiling during the migration.
 */

/**
 * Represents a draggable tag that can be a team member or asset.
 * @deprecated Superseded by {@link import('../domain').Resource}.
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
 * @deprecated The board is being remodelled as JobSites (rows) with resource-type
 * columns; see {@link import('../domain').RESOURCE_TYPE_COLUMNS}.
 */
export interface Category {
  id: string;
  name: string;
  tags: Tag[];
}

/**
 * Predefined work category definitions.
 * @deprecated Use {@link import('../domain').RESOURCE_TYPE_COLUMNS} for the daily
 * view columns.
 */
export const DEFAULT_CATEGORIES: Omit<Category, 'tags'>[] = [
  { id: 'personnel', name: 'PERSONNEL' },
  { id: 'plant', name: 'PLANT' },
  { id: 'traffic-control', name: 'TRAFFIC CONTROL' },
  { id: 'contractors', name: 'CONTRACTORS' },
  { id: 'leave', name: 'LEAVE' },
  { id: 'training', name: 'TRAINING' },
];
