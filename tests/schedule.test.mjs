import test from 'node:test';
import assert from 'node:assert/strict';
import { refreshDue } from '../scripts/refresh-schedule.mjs';

test('scheduled refresh windows stay ten hours apart across midnight, month and year boundaries', () => {
  const start = Date.parse('2026-12-30T12:47:00Z');
  let previous = new Date(start).toISOString();
  const refreshed = [];
  for (let hour = 1; hour <= 120; hour++) {
    const now = start + hour * 3600000;
    if (refreshDue(previous, 'schedule', now)) {
      refreshed.push(now);
      previous = new Date(now).toISOString();
      assert.equal(refreshDue(previous, 'schedule', now + 1000), false);
    }
  }
  assert.equal(refreshed.length, 12);
  for (let i = 1; i < refreshed.length; i++) assert.equal(refreshed[i] - refreshed[i - 1], 10 * 3600000);
});

test('missed or failed runs catch up and manual/push runs refresh immediately', () => {
  const previous = '2026-12-30T12:47:00Z';
  const then = Date.parse(previous);
  assert.equal(refreshDue(previous, 'schedule', then + 3600000), false);
  assert.equal(refreshDue(previous, 'schedule', then + 11 * 3600000), true);
  assert.equal(refreshDue(undefined, 'schedule', then), true);
  assert.equal(refreshDue('invalid', 'schedule', then), true);
  assert.equal(refreshDue(previous, 'push', then), true);
  assert.equal(refreshDue(previous, 'workflow_dispatch', then), true);
});
