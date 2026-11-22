import { readFile, appendFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INTERVAL = 10 * 60 * 60 * 1000;
const OFFSET = 47 * 60 * 1000;

// Cron hour steps restart at midnight. Use continuous ten-hour windows instead,
// with hourly checks so a delayed/failed run can retry without losing a window.
export function refreshDue(lastSuccess, event = 'schedule', now = Date.now()) {
  if (event !== 'schedule') return true;
  const previous = Date.parse(lastSuccess);
  if (!Number.isFinite(previous)) return true;
  const window = time => Math.floor((time - OFFSET) / INTERVAL);
  return window(now) > window(previous);
}

export async function checkSchedule(root = ROOT) {
  let lastSuccess;
  try {
    lastSuccess = JSON.parse(await readFile(resolve(root, 'data/profile.json'), 'utf8')).refreshedAt;
  } catch { /* Missing state needs an initial refresh. */ }
  const due = refreshDue(lastSuccess, process.env.GITHUB_EVENT_NAME || 'manual');
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `due=${due}\n`);
  console.log(due ? 'Refresh due.' : 'Already refreshed in this 10-hour window.');
  return due;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  checkSchedule().catch(error => { console.error(error.message); process.exitCode = 1; });
}
