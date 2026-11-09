import type { Category, Tag } from '@workforce/shared';
import { DEFAULT_CATEGORIES } from '@workforce/shared';

/**
 * Site-specific configuration and demo data.
 *
 * Everything that varies between deployments (branding, locations,
 * categories, sample staff and assets) lives here so a site can be
 * configured without touching application logic.
 */
export const appConfig = {
  appName: 'Daily Roster Board',
  subtitle: 'Workforce Management',
};

export const defaultCategories: Category[] = DEFAULT_CATEGORIES.map((c) => ({
  ...c,
  tags: [],
}));

export const defaultLocations: string[] = [
  'North Depot',
  'Main Street Roadworks',
  'Riverside Park',
  'Quarry Road',
  'Stockpile Yard',
  'Town Hall Car Park',
];

export const sampleMembers: Tag[] = [
  { id: 'm1', name: 'Alex Morgan', type: 'member' },
  { id: 'm2', name: 'Jordan Lee', type: 'member' },
  { id: 'm3', name: 'Sam Carter', type: 'member' },
  { id: 'm4', name: 'Casey Nguyen', type: 'member' },
  { id: 'm5', name: 'Taylor Reid', type: 'member' },
  { id: 'm6', name: 'Riley Patel', type: 'member' },
  { id: 'm7', name: 'Jamie Brooks', type: 'member' },
  { id: 'm8', name: 'Drew Silva', type: 'member' },
];

export const sampleAssets: Tag[] = [
  { id: 'a1', name: 'Excavator #1', type: 'asset' },
  { id: 'a2', name: 'Truck #23', type: 'asset' },
  { id: 'a3', name: 'Forklift #5', type: 'asset' },
  { id: 'a4', name: 'Roller #8', type: 'asset' },
  { id: 'a5', name: 'Grader #12', type: 'asset' },
];
