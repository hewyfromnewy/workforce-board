/**
 * Seed data for the in-memory adapter — illustrative, not the board-photo
 * transcription (that's issue #3). Mirrors the export spike, including the
 * split-day Excavator 13T (AM at one site, PM at another).
 */
import type {
  Assignment,
  DayNote,
  IsoDate,
  JobSite,
  LeaveRecord,
  Resource,
  TrafficControl,
} from '@workforce/shared';
import { DEFAULT_CREW } from '@workforce/shared';

export interface SeedState {
  resources: Resource[];
  jobSites: JobSite[];
  assignments: Assignment[];
  leave: LeaveRecord[];
  dayNotes: DayNote[];
  trafficControl: TrafficControl[];
}

const R = (
  id: string,
  name: string,
  type: Resource['type'],
): Resource => ({ id, name, type, crew: DEFAULT_CREW, rate: null, active: true });

export function seed(today: IsoDate): SeedState {
  const resources: Resource[] = [
    R('r-chris', 'Chris Chamberlain', 'person'),
    R('r-dave', 'Dave Reeves', 'person'),
    R('r-sam', 'Sam Tan', 'person'),
    R('r-luke', 'Luke Ford', 'person'),
    R('r-joel', 'Joel Ward', 'person'),
    R('r-nathan', 'Nathan Cole', 'person'),
    R('r-rod', 'Rod Blake', 'person'),
    R('r-terry', 'Terry Hall', 'person'),
    R('r-priya', 'Priya Nair', 'person'),
    R('r-exc13', 'Excavator 13T', 'plant'),
    R('r-roller', 'Roller CB2.7', 'plant'),
    R('r-grader', 'Grader 12H', 'plant'),
    R('r-paver', 'Paver', 'plant'),
    R('r-truck188', 'Truck 188', 'plant'),
    R('r-bobcat', 'Bobcat S570', 'plant'),
    R('r-ute188', '188 Ute', 'plant'),
    R('r-watercart', 'Water Cart', 'hire'),
    R('r-boral', 'Boral (asphalt)', 'contractor'),
  ];

  const jobSites: JobSite[] = [
    { id: 'js-clarence', name: 'Clarence Town Rd Seg 170', jobNumber: '13590', crew: DEFAULT_CREW, startDate: null, endDate: null, status: 'active' },
    { id: 'js-medowie', name: 'Medowie Rd Shoulder', jobNumber: '13612', crew: DEFAULT_CREW, startDate: null, endDate: null, status: 'active' },
    { id: 'js-nelson', name: 'Nelson Bay Rd Patching', jobNumber: '13588', crew: DEFAULT_CREW, startDate: null, endDate: null, status: 'active' },
  ];

  let seq = 0;
  const at = () => `${today}T00:00:${String(seq++).padStart(2, '0')}.000Z`;
  const a = (
    resourceId: string,
    destinationType: Assignment['destinationType'],
    destinationId: string | null,
    slot: Assignment['slot'] = 'full',
  ): Assignment => ({
    id: `a-${resourceId}-${slot}`,
    resourceId,
    date: today,
    slot,
    destinationType,
    destinationId,
    createdAt: at(),
  });

  const assignments: Assignment[] = [
    a('r-chris', 'job_site', 'js-clarence'),
    a('r-dave', 'job_site', 'js-clarence'),
    a('r-exc13', 'job_site', 'js-clarence', 'am'),
    a('r-roller', 'job_site', 'js-clarence'),
    a('r-watercart', 'job_site', 'js-clarence'),
    a('r-sam', 'job_site', 'js-medowie'),
    a('r-luke', 'job_site', 'js-medowie'),
    a('r-grader', 'job_site', 'js-medowie'),
    a('r-exc13', 'job_site', 'js-medowie', 'pm'),
    a('r-joel', 'job_site', 'js-nelson'),
    a('r-paver', 'job_site', 'js-nelson'),
    a('r-truck188', 'job_site', 'js-nelson'),
    a('r-boral', 'job_site', 'js-nelson'),
    a('r-priya', 'training', null),
  ];

  const leave: LeaveRecord[] = [
    { resourceId: 'r-rod', date: today, source: 'manual' },
    { resourceId: 'r-terry', date: today, source: 'manual' },
  ];

  const dayNotes: DayNote[] = [
    { jobSiteId: 'js-clarence', date: today, text: 'shovel, concrete rakes, broom' },
    { jobSiteId: 'js-nelson', date: today, text: 'hotmix AM start' },
  ];

  const trafficControl: TrafficControl[] = [
    { jobSiteId: 'js-clarence', date: today, count: 3, provider: 'PTS Traffic' },
    { jobSiteId: 'js-medowie', date: today, count: 2, provider: 'PTS Traffic' },
    { jobSiteId: 'js-nelson', date: today, count: 4, provider: 'Roadwork TC' },
  ];

  return { resources, jobSites, assignments, leave, dayNotes, trafficControl };
}
