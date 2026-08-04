/* Validates the data outcomes of #6 interactions (what the handlers call). */
import assert from 'node:assert';
import { seed } from '../src/data/seed';
import { buildBoard } from '../src/data/buildBoard';

const date = '2026-08-04';
const s = seed(date);
// Timestamps AFTER the seed (seed rows are at this date's midnight + seconds).
let t = Date.parse(`${date}T12:00:00.000Z`);
const push = (resourceId: string, slot: 'full' | 'am' | 'pm', destinationType: 'job_site' | 'unassigned', destinationId: string | null) => {
  t += 1000;
  s.assignments.push({ id: `x-${t}`, resourceId, date, slot, destinationType, destinationId, createdAt: new Date(t).toISOString() });
};

const at = (siteId: string, type: 'plant' | 'person', id: string, slot?: string) =>
  buildBoard(date, s).sites.find((r) => r.site.id === siteId)!.byType[type].some((p) => p.resource.id === id && (!slot || p.slot === slot));

// Chris starts full-day at Clarence.
assert(at('js-clarence', 'person', 'r-chris', 'full'), 'Chris full at Clarence initially');

// SPLIT: am at Clarence, pm at Medowie.
push('r-chris', 'am', 'job_site', 'js-clarence');
push('r-chris', 'pm', 'job_site', 'js-medowie');
assert(at('js-clarence', 'person', 'r-chris', 'am'), 'Chris AM at Clarence after split');
assert(at('js-medowie', 'person', 'r-chris', 'pm'), 'Chris PM at Medowie after split');

// MOVE (supersede): full-day at Nelson replaces the split.
push('r-chris', 'full', 'job_site', 'js-nelson');
let b = buildBoard(date, s);
assert(at('js-nelson', 'person', 'r-chris', 'full'), 'Chris moved full to Nelson');
assert(!at('js-clarence', 'person', 'r-chris'), 'Chris no longer at Clarence');
assert(!at('js-medowie', 'person', 'r-chris'), 'Chris no longer at Medowie');

// LEAVE PRECEDENCE: Terry is on leave today → not shown at any site even if placed.
push('r-terry', 'full', 'job_site', 'js-clarence');
b = buildBoard(date, s);
assert(!at('js-clarence', 'person', 'r-terry'), 'Terry hidden from site while on leave');
assert(b.leave.some((r) => r.id === 'r-terry'), 'Terry shown on leave');

// OVERRIDE: clear leave then place → Terry now at site, not on leave.
s.leave = s.leave.filter((l) => l.resourceId !== 'r-terry');
push('r-terry', 'full', 'job_site', 'js-clarence');
b = buildBoard(date, s);
assert(at('js-clarence', 'person', 'r-terry', 'full'), 'Terry at Clarence after override');
assert(!b.leave.some((r) => r.id === 'r-terry'), 'Terry no longer on leave after override');

// --- resolveSiteDrop branching ---
const { resolveSiteDrop } = await import('../src/data/dropResolver');
const info = (over: Partial<Parameters<typeof resolveSiteDrop>[0]> = {}) => ({ sitePlacements: [], inTraining: false, onLeave: false, ...over });

assert.equal(resolveSiteDrop(info(), 'js-a', 'full').kind, 'place', 'empty → place');
assert.equal(resolveSiteDrop(info({ onLeave: true }), 'js-a', 'full').kind, 'override', 'leave → override');
assert.equal(resolveSiteDrop(info({ inTraining: true }), 'js-a', 'full').kind, 'override', 'training → override');
assert.equal(resolveSiteDrop(info({ sitePlacements: [{ siteId: 'js-a', slot: 'full' }] }), 'js-a', 'full').kind, 'noop', 'same site → noop');
assert.equal(resolveSiteDrop(info({ sitePlacements: [{ siteId: 'js-a', slot: 'full' }] }), 'js-b', 'full').kind, 'movesplit', 'full → other site → movesplit');
const half = resolveSiteDrop(info({ sitePlacements: [{ siteId: 'js-a', slot: 'am' }] }), 'js-b', 'am');
assert.equal(half.kind, 'place', 'half → place');
assert.equal(half.kind === 'place' && half.slot, 'am', 'half move keeps slot');

// --- copy-forward (#9) ---
const { buildCopyPlan } = await import('../src/data/copyForward');
const cs = seed(date); // fresh
const tomorrow = '2026-08-11'; // empty (outside the seeded week)

// Target empty → everything current on `date` copies forward.
let plan = buildCopyPlan(cs, date, tomorrow);
assert(plan.adds.some((r) => r.resourceId === 'r-chris' && r.destinationId === 'js-clarence'), 'copy: Chris → Clarence');
assert(plan.adds.some((r) => r.resourceId === 'r-priya' && r.destinationType === 'training'), 'copy: training carried');
assert(plan.adds.every((r) => r.date === tomorrow), 'copy: rows target tomorrow');
assert.equal(plan.skipped.length, 0, 'copy: nothing skipped into empty day');

// Respect target leave: Chris on leave tomorrow → skipped, not placed.
cs.leave.push({ resourceId: 'r-chris', date: tomorrow, source: 'manual' });
plan = buildCopyPlan(cs, date, tomorrow);
assert(!plan.adds.some((r) => r.resourceId === 'r-chris'), 'copy: on-leave resource not copied');
assert(plan.skipped.some((s) => s.resourceId === 'r-chris' && s.reason === 'leave'), 'copy: Chris skipped (leave)');

// Respect target training: Dave already in training tomorrow → not overwritten.
cs.assignments.push({ id: 't1', resourceId: 'r-dave', date: tomorrow, slot: 'full', destinationType: 'training', destinationId: null, createdAt: `${tomorrow}T09:00:00.000Z` });
plan = buildCopyPlan(cs, date, tomorrow);
assert(!plan.adds.some((r) => r.resourceId === 'r-dave'), 'copy: in-training resource not overwritten');
assert(plan.skipped.some((s) => s.resourceId === 'r-dave' && s.reason === 'training'), 'copy: Dave skipped (training)');

console.log('OK — #6 interactions + resolver + #9 copy-forward verified');
