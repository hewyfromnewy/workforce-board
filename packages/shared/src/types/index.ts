export type TagType = 'member' | 'asset';

export interface Tag {
  id: string;
  name: string;
  type: TagType;
}

export interface Category {
  id: string;
  name: string;
}

export interface Assignment {
  tagId: string;
  categoryId: string;
  location: string;
}

export interface SentRecord {
  at: string;
  assignments: Assignment[];
}

export interface RosterDay {
  date: string;
  assignments: Assignment[];
  sent?: SentRecord;
}

export type RosterStatus = 'draft' | 'sent' | 'changed';

export interface TeamMember {
  id: string;
  displayName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AssetType = 'plant' | 'vehicle' | 'equipment';

export interface Asset {
  id: string;
  name: string;
  assetType: AssetType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'personnel', name: 'PERSONNEL' },
  { id: 'plant', name: 'PLANT' },
  { id: 'traffic-control', name: 'TRAFFIC CONTROL' },
  { id: 'contractors', name: 'CONTRACTORS' },
  { id: 'leave', name: 'LEAVE' },
  { id: 'training', name: 'TRAINING' },
];

export const PERMISSIONS = [
  'roster.view',
  'roster.edit',
  'roster.send',
  'master_data.manage',
  'users.manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export const DEFAULT_ROLES: Role[] = [
  { id: 'team-member', name: 'Team Member', permissions: ['roster.view'] },
  { id: 'supervisor', name: 'Supervisor', permissions: ['roster.view', 'roster.edit', 'roster.send'] },
  { id: 'admin', name: 'Admin', permissions: [...PERMISSIONS] },
];

export type TenantStatus = 'active' | 'suspended';

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  roleId: string;
}
