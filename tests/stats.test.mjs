import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { publishStats, validateStats } from '../scripts/publish-stats.mjs';

const light = await readFile(new URL('../assets/github-stats-light.svg', import.meta.url), 'utf8');
const dark = await readFile(new URL('../assets/github-stats-dark.svg', import.meta.url), 'utf8');

test('reject upstream errors, wrong account titles and missing counts before publishing', () => {
  assert.ok(validateStats(light).commits);
  assert.throws(() => validateStats('<svg>Something went wrong</svg>'), /Invalid/);
  assert.throws(() => validateStats(light.replaceAll('Rishabh Pal', 'Another User')), /account/);
  assert.throws(() => validateStats(light.replace('data-testid="commits"', 'data-testid="missing"')), /commits/);
  assert.throws(() => validateStats(light.replace(/data-testid="prs"\s*>[^<]+/, 'data-testid="prs">NaN')), /prs/);
  for (const rank of ['S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C']) {
    assert.equal(validateStats(light.replace(/data-testid="level-rank-icon"\s*>[^<]+/, `data-testid="level-rank-icon">${rank}`)).rank, rank);
  }
  assert.throws(() => validateStats(light.replace('data-testid="level-rank-icon"', 'data-testid="missing"')), /rank/);
});

test('publish matching cards with stable content versions and a success time, preserving the rest of README', async () => {
  const root = await mkdtemp(join(tmpdir(), 'risbh-stats-test-'));
  const readme = 'Keep intro\n<!-- CONTRIBUTION_STATS:START -->\nold\n<!-- CONTRIBUTION_STATS:END -->\nKeep footer';
  try {
    await mkdir(join(root, 'assets'));
    await writeFile(join(root, 'README.md'), readme);
    await writeFile(join(root, 'assets/github-stats-light.svg'), light);
    await writeFile(join(root, 'assets/github-stats-dark.svg'), dark);
    await publishStats(root, '2026-11-22T10:23:13Z');
    const first = await readFile(join(root, 'README.md'), 'utf8');
    assert.ok(first.startsWith('Keep intro\n'));
    assert.ok(first.endsWith('\nKeep footer'));
    const image = (content, theme) => content.match(new RegExp(`github-stats-${theme}-[a-f0-9]{16}\\.svg`))[0];
    for (const theme of ['light', 'dark']) {
      assert.equal(await readFile(join(root, 'assets', image(first, theme)), 'utf8'), theme === 'light' ? light : dark);
    }
    assert.match(first, /src="https:\/\/raw\.githubusercontent\.com\/risbh19\/risbh19\/main\/assets\/github-stats-light-[a-f0-9]{16}\.svg"/);
    assert.match(first, /srcset="https:\/\/raw\.githubusercontent\.com\/risbh19\/risbh19\/main\/assets\/github-stats-dark-[a-f0-9]{16}\.svg"/);
    assert.match(first, /Rishabh Pal \(@risbh19\)/);
    assert.match(first, /22 Nov 2026, 15:53 IST/);
    assert.match(first, /Scheduled every 10 hours/);
    assert.match(first, /actions\/workflows\/profile\.yml/);
    await publishStats(root, '2026-11-22T22:23:13Z');
    const second = await readFile(join(root, 'README.md'), 'utf8');
    assert.equal(image(first, 'light'), image(second, 'light'));
    // A data change must produce a new image URL for both themes.
    for (const [theme, svg] of [['light', light], ['dark', dark]]) {
      await writeFile(join(root, `assets/github-stats-${theme}.svg`), svg.replace(/data-testid="prs"\s*>[^<]+/, 'data-testid="prs">123'));
    }
    await publishStats(root, '2026-11-22T22:23:13Z');
    const third = await readFile(join(root, 'README.md'), 'utf8');
    assert.notEqual(image(second, 'light'), image(third, 'light'));
    // The preceding pair remains available to a cached README.
    assert.equal(await readFile(join(root, 'assets', image(second, 'light')), 'utf8'), light);
    // A partial generation must leave the previously published URLs/time intact.
    await writeFile(join(root, 'assets/github-stats-dark.svg'), dark.replace(/data-testid="prs"\s*>[^<]+/, 'data-testid="prs">456'));
    await assert.rejects(publishStats(root), /counts differ/);
    assert.equal(await readFile(join(root, 'README.md'), 'utf8'), third);
  } finally {
    assert.ok(root.startsWith(join(tmpdir(), 'risbh-stats-test-')));
    await rm(root, { recursive: true, force: true });
  }
});
