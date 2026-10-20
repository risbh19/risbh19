import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseCalendar, parseCodeChef, streaks, activitySummary, refresh, replaceContributionSection } from '../scripts/update-profile.mjs';

// Synthetic fixtures are test-only; production assets always use fetched public data.
function calendarFixture() {
  return Array.from({ length: 365 }, (_, index) => {
    const date = new Date(Date.UTC(2025, 0, index + 1)).toISOString().slice(0, 10);
    const count = index === 0 ? 1234 : index % 3;
    const label = count === 0 ? 'No contributions' : `${count.toLocaleString('en-US')} contribution${count === 1 ? '' : 's'}`;
    return `<td data-date="${date}" data-level="${Math.min(count, 4)}" id="day-${index}"></td><tool-tip for="day-${index}">${label} on a date.</tool-tip>`;
  }).join('');
}

test('calendar parses dated counts, singular labels, commas and zero days', () => {
  const calendar = parseCalendar(calendarFixture());
  assert.equal(calendar.days.length, 365);
  assert.equal(calendar.days[0].count, 1234);
  assert.equal(calendar.days[1].count, 1);
  assert.equal(calendar.days[3].count, 0);
  assert.equal(calendar.total, calendar.days.reduce((sum, day) => sum + day.count, 0));
});

test('calendar fails on missing tooltip counts or incomplete pages instead of fabricating zeroes', () => {
  assert.throws(() => parseCalendar(calendarFixture().replace('1 contribution on a date.', 'Data unavailable')), /format changed/);
  assert.throws(() => parseCalendar('<div>Access denied</div>'), /Incomplete/);
});

test('streak calculation handles an empty today, inactivity, and date gaps', () => {
  const days = [
    { date: '2026-10-15', count: 1 }, { date: '2026-10-16', count: 2 },
    { date: '2026-10-17', count: 0 }, { date: '2026-10-18', count: 3 },
    { date: '2026-10-19', count: 1 }, { date: '2026-10-20', count: 0 }
  ];
  assert.deepEqual(streaks(days, '2026-10-20'), { current: 2, longest: 2, active: 4 });
  assert.equal(streaks(days, '2026-10-21').current, 0);
  assert.equal(streaks([days[0], days[3]], '2026-10-18').longest, 1);
});

test('CodeChef parses primary ratings without mistaking secondary unrated sections or CSS', () => {
  const result = parseCodeChef('<style>.rating-number{}</style><div class="rating-number"> 1479 </div><small>(Highest Rating 1615)</small><div class="rating-number">NA</div>');
  assert.deepEqual(result, { handle: 'risbh_cf', rating: 1479, maxRating: 1615 });
  assert.throws(() => parseCodeChef('<div>Blocked</div>'), /unavailable/);
});

test('activity uses exactly 30 observed UTC dates across month boundaries and keeps stale windows honest', () => {
  const days = Array.from({ length: 40 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 8, index + 11)).toISOString().slice(0, 10),
    count: index >= 35 ? 2 : 0
  }));
  const summary = activitySummary(days);
  assert.equal(summary.days.length, 30);
  assert.equal(summary.days[0].date, '2026-09-21');
  assert.equal(summary.days.at(-1).date, '2026-10-20');
  assert.equal(summary.total, 10);
  assert.equal(summary.current, 5);
  assert.equal(summary.longest, 5);
  const earlier = activitySummary(days, '2026-10-19');
  assert.equal(earlier.total, 8);
  assert.equal(earlier.current, 4);
  assert.equal(earlier.longest, 4);
  assert.equal(activitySummary(days.filter(day => day.date !== '2026-10-01')), null);
  assert.equal(activitySummary([]), null);
});

test('contribution section embeds the requested GitHub Stats card without changing surrounding content', () => {
  const template = 'Keep my projects\n<!-- CONTRIBUTION_STATS:START -->\nold\n<!-- CONTRIBUTION_STATS:END -->\nKeep my contact links';
  const result = replaceContributionSection(template);
  assert.ok(result.startsWith('Keep my projects\n'));
  assert.ok(result.endsWith('\nKeep my contact links'));
  assert.ok(result.includes('assets/github-stats-dark.svg'));
  assert.ok(result.includes('assets/github-stats-light.svg'));
  assert.ok(!result.includes('| Metric |'));
  assert.throws(() => replaceContributionSection('missing markers', null), /exactly one/);
  assert.throws(() => replaceContributionSection(template + template, null), /exactly one/);
});

test('partial failures preserve last-good values, escape SVG text, and never send GitHub credentials to coding platforms', async () => {
  const root = await mkdtemp(join(tmpdir(), 'risbh-profile-test-'));
  const originalFetch = globalThis.fetch;
  const oldToken = process.env.GITHUB_TOKEN;
  const oldWarn = console.warn;
  const oldLog = console.log;
  const token = 'test-only-synthetic-token';
  const requests = [];
  try {
    await mkdir(join(root, 'data'));
    await writeFile(join(root, 'README.md'), 'Profile intro\n<!-- CONTRIBUTION_STATS:START -->\nold\n<!-- CONTRIBUTION_STATS:END -->\nProfile footer');
    await writeFile(join(root, 'data/profile.json'), JSON.stringify({ sources: {
      codeforces: { fetchedAt: '2026-10-19T10:00:00Z', data: { rating: 1200, maxRating: 1400, rank: '<script>unsafe</script>' } }
    } }));
    process.env.GITHUB_TOKEN = token;
    console.warn = () => {};
    console.log = () => {};
    globalThis.fetch = async (url, options) => {
      const address = String(url);
      requests.push({ address, authorization: options.headers.Authorization });
      let data;
      if (address.endsWith('/contributions')) return new Response(calendarFixture());
      if (address.includes('codeforces.com') || address.includes('codechef.com') || address.includes('leetcode.com')) throw new Error('Synthetic source failure');
      if (address.includes('/search/issues')) data = { total_count: 0, incomplete_results: false };
      else if (address.includes('/repos?') || address.includes('/events/public?')) data = [];
      else data = { followers: 0, public_repos: 0 };
      return new Response(JSON.stringify(data));
    };
    const result = await refresh(root);
    assert.equal(result.sources.codeforces.status, 'stale');
    assert.equal(result.sources.codeforces.data.rating, 1200);
    assert.equal(result.sources.codeforces.fetchedAt, '2026-10-19T10:00:00Z');
    assert.equal(result.sources.leetcode.status, 'unavailable');
    assert.equal(result.sources.activity, undefined);
    assert.equal(result.sources.collaboration, undefined);
    assert.ok(!requests.some(r => r.address.includes('/events/') || r.address.includes('/search/issues')));
    const readme = await readFile(join(root, 'README.md'), 'utf8');
    assert.ok(readme.includes('assets/github-stats-light.svg'));
    assert.ok(!readme.includes('| Metric |'));
    const coding = await readFile(join(root, 'assets/coding-dark.svg'), 'utf8');
    assert.ok(coding.includes('Last available'));
    assert.ok(coding.includes('&lt;script&gt;'));
    assert.ok(!coding.includes('<script>'));
    const activity = await readFile(join(root, 'assets/activity-dark.svg'), 'utf8');
    assert.ok(activity.includes('Contribution activity'));
    assert.equal((activity.match(/<circle /g) || []).length, 30);
    assert.ok(activity.includes('2025-12-31:'));
    assert.ok(!activity.includes('2026-10-20:'));
    const snapshot = await readFile(join(root, 'data/profile.json'), 'utf8');
    assert.ok(!snapshot.includes(token));
    assert.ok(requests.some(r => new URL(r.address).hostname === 'api.github.com' && r.authorization === `Bearer ${token}`));
    assert.ok(requests.filter(r => new URL(r.address).hostname !== 'api.github.com').every(r => r.authorization === undefined));
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = oldWarn;
    console.log = oldLog;
    if (oldToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = oldToken;
    assert.ok(root.startsWith(join(tmpdir(), 'risbh-profile-test-')), 'Cleanup must stay in the test-owned temporary folder');
    await rm(root, { recursive: true, force: true });
  }
});
