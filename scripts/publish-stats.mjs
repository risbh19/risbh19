import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { replaceContributionSection } from './update-profile.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const METRICS = ['stars', 'commits', 'prs', 'issues', 'contribs'];

// Check the upstream renderer's output contract, including older cores that
// may return an error SVG without setting the action's error status.
export function validateStats(svg) {
  if (!/^\s*<svg\b[^>]*\bxmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*>/s.test(svg) ||
      !/<\/svg>\s*$/.test(svg) || /Something went wrong|API rate limit|<script\b|<foreignObject\b/i.test(svg)) {
    throw new Error('Invalid GitHub Stats card or upstream error image');
  }
  if (!/<text\b[^>]*data-testid="header"[^>]*>Rishabh Pal(?:&#39;|&apos;|')s GitHub Stats<\/text>/.test(svg)) {
    throw new Error('GitHub Stats card has an unexpected account title');
  }
  const metrics = Object.fromEntries(METRICS.map(key => {
    const text = svg.match(new RegExp(`<text\\b[^>]*data-testid="${key}"[^>]*>([^<]+)</text>`))?.[1]?.trim();
    if (!text || !/^\d+(?:,\d{3})*(?:\.\d+)?[kmb]?$/i.test(text)) {
      throw new Error(`GitHub Stats card has a missing or invalid ${key} count`);
    }
    return [key, text];
  }));
  const rank = svg.match(/<text\b[^>]*data-testid="level-rank-icon"[^>]*>([^<]+)<\/text>/)?.[1]?.trim();
  if (!rank || !/^(?:S|[AB][+-]?|C\+?)$/.test(rank)) throw new Error(`GitHub Stats card has a missing or invalid rank: ${rank || 'missing'}`);
  return { ...metrics, rank };
}

export async function publishStats(root = ROOT, updatedAt = new Date().toISOString()) {
  if (!Number.isFinite(Date.parse(updatedAt))) throw new Error('Invalid stats refresh time');
  const versions = {};
  let reference;
  for (const theme of ['light', 'dark']) {
    const svg = await readFile(resolve(root, `assets/github-stats-${theme}.svg`), 'utf8');
    const metrics = validateStats(svg);
    if (reference && JSON.stringify(metrics) !== JSON.stringify(reference)) {
      throw new Error('Light and dark GitHub Stats counts differ; keeping the published cards');
    }
    reference = metrics;
    versions[theme] = createHash('sha256').update(svg).digest('hex').slice(0, 16);
  }
  const path = resolve(root, 'README.md');
  const readme = await readFile(path, 'utf8');
  // Only publish the new image URLs and success time after BOTH cards pass.
  await writeFile(path, replaceContributionSection(readme, { versions, updatedAt }));
  console.log(JSON.stringify({ account: 'risbh19', updatedAt, versions, metrics: reference }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  publishStats().catch(error => { console.error(error.message); process.exitCode = 1; });
}
