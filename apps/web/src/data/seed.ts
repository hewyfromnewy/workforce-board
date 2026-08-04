/**
 * Seed data for the in-memory adapter — illustrative, not the board-photo
 * transcription (that's issue #3). Populates the whole current week so the
 * weekly grid is meaningful: crews stay on their sites Mon–Fri (most crews
 * stay on the same job for days), `today` carries the detailed board including
 * the split-day Excavator 13T (AM at one site, PM at another), and leave spans
 * multiple days.
 */
import { addDays, format, startOfWeek } from 'date-fns';
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

const R = (id: string, name: string, type: Resource['type']): Resource => ({
  id,
  name,
  type,
  crew: DEFAULT_CREW,
  rate: null,
  active: true,
});

const isoAdd = (start: IsoDate, days: number): IsoDate =>
  format(addDays(new Date(`${start}T00:00:00`), days), 'yyyy-MM-dd');

/** Standard full-day site assignments — the crews' usual home for the week. */
const HOME: Record<string, string> = {
  'r-chris': 'js-clarence',
  'r-dave': 'js-clarence',
  'r-roller': 'js-clarence',
  'r-watercart': 'js-clarence',
  'r-sam': 'js-medowie',
  'r-luke': 'js-medowie',
  'r-grader': 'js-medowie',
  'r-joel': 'js-nelson',
  'r-paver': 'js-nelson',
  'r-truck188': 'js-nelson',
  'r-boral': 'js-nelson',
  'r-exc13': 'js-clarence',
};

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
  const a = (
    resourceId: string,
    date: IsoDate,
    destinationType: Assignment['destinationType'],
    destinationId: string | null,
    slot: Assignment['slot'] = 'full',
  ): Assignment => ({
    id: `a-${resourceId}-${date}-${slot}`,
    resourceId,
    date,
    slot,
    destinationType,
    destinationId,
    // Valid, monotonic ISO timestamp (seconds since the date's midnight).
    createdAt: new Date(Date.parse(`${date}T00:00:00.000Z`) + seq++ * 1000).toISOString(),
  });

  const monday = format(startOfWeek(new Date(`${today}T00:00:00`), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekdays = Array.from({ length: 5 }, (_, i) => isoAdd(monday, i));
  const dates = Array.from(new Set([...weekdays, today]));

  const assignments: Assignment[] = [];
  for (const date of dates) {
    if (date === today) {
      // Detailed board for today, incl. the split-day Excavator.
      assignments.push(
        a('r-chris', date, 'job_site', 'js-clarence'),
        a('r-dave', date, 'job_site', 'js-clarence'),
        a('r-exc13', date, 'job_site', 'js-clarence', 'am'),
        a('r-roller', date, 'job_site', 'js-clarence'),
        a('r-watercart', date, 'job_site', 'js-clarence'),
        a('r-sam', date, 'job_site', 'js-medowie'),
        a('r-luke', date, 'job_site', 'js-medowie'),
        a('r-grader', date, 'job_site', 'js-medowie'),
        a('r-exc13', date, 'job_site', 'js-medowie', 'pm'),
        a('r-joel', date, 'job_site', 'js-nelson'),
        a('r-paver', date, 'job_site', 'js-nelson'),
        a('r-truck188', date, 'job_site', 'js-nelson'),
        a('r-boral', date, 'job_site', 'js-nelson'),
        a('r-priya', date, 'training', null),
      );
    } else {
      for (const [resourceId, siteId] of Object.entries(HOME)) {
        assignments.push(a(resourceId, date, 'job_site', siteId));
      }
      assignments.push(a('r-priya', date, 'training', null));
    }
  }

  // Leave: Terry all week; Rod Thu–Fri.
  const leave: LeaveRecord[] = [
    ...weekdays.map((date) => ({ resourceId: 'r-terry', date, source: 'manual' as const })),
    { resourceId: 'r-rod', date: isoAdd(monday, 3), source: 'manual' },
    { resourceId: 'r-rod', date: isoAdd(monday, 4), source: 'manual' },
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
