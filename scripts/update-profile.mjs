import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CONFIG = Object.freeze({ github: 'risbh19', codeforces: 'Sensi__', codechef: 'risbh_cf', leetcode: 'risbhh19' });
const TIMEOUT = 20000;
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const number = value => Number.isFinite(value) ? value.toLocaleString('en-US') : '—';
const finite = value => typeof value === 'number' && Number.isFinite(value);
const stamp = iso => new Date(iso).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST';

async function request(url, options = {}) {
  const headers = { 'User-Agent': 'risbh19-profile-readme', ...options.headers };
  if (new URL(url).hostname === 'api.github.com') {
    headers.Accept = 'application/vnd.github+json';
    headers['X-GitHub-Api-Version'] = '2022-11-28';
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const response = await fetch(url, { ...options, headers, signal: AbortSignal.timeout(TIMEOUT) });
  if (!response.ok) throw new Error(`${new URL(url).hostname}: HTTP ${response.status}`);
  return response;
}
const json = async (url, options) => (await request(url, options)).json();

export function parseCalendar(html) {
  const tooltips = new Map();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = match[1].match(/\bfor="([^"]+)"/)?.[1];
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    const value = /^No contributions\b/i.test(text) ? 0 : Number(text.match(/^([\d,]+) contributions?\b/i)?.[1]?.replaceAll(',', ''));
    if (id && Number.isFinite(value)) tooltips.set(id, value);
  }
  const days = [];
  for (const match of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
    const attr = key => match[0].match(new RegExp(`\\b${key}="([^"]+)"`))?.[1];
    const date = attr('data-date');
    const count = tooltips.get(attr('id'));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(count)) throw new Error('Contribution calendar format changed');
    days.push({ date, count, level: Math.min(4, Math.max(0, Number(attr('data-level')) || 0)) });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  if (days.length < 300 || new Set(days.map(d => d.date)).size !== days.length) throw new Error('Incomplete contribution calendar');
  return { days, total: days.reduce((n, d) => n + d.count, 0) };
}

export function streaks(days, today = new Date().toISOString().slice(0, 10)) {
  let run = 0, longest = 0, current = 0, active = 0;
  let previous;
  for (const day of days) {
    if (previous && (Date.parse(day.date) - Date.parse(previous)) !== 86400000) run = 0;
    run = day.count > 0 ? run + 1 : 0;
    if (day.count > 0) active++;
    longest = Math.max(longest, run);
    previous = day.date;
  }
  const byDate = new Map(days.map(d => [d.date, d.count]));
  let cursor = new Date(today + 'T00:00:00Z');
  if (!(byDate.get(today) > 0)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (byDate.get(cursor.toISOString().slice(0, 10)) > 0) {
    current++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return { current, longest, active };
}

export function activitySummary(days, endDate = days.at(-1)?.date) {
  if (!days.length) return null;
  const end = Date.parse(endDate + 'T00:00:00Z');
  if (!Number.isFinite(end)) throw new Error('Invalid activity window date');
  const byDate = new Map(days.map(day => [day.date, day]));
  const series = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(end - (29 - index) * 86400000).toISOString().slice(0, 10);
    return byDate.get(date);
  });
  // Missing observations are unavailable data, never invented zeroes.
  if (series.some(day => !day || !finite(day.count) || day.count < 0)) return null;
  const observed = days.filter(day => day.date <= endDate);
  return {
    days: series,
    total: series.reduce((sum, day) => sum + day.count, 0),
    ...streaks(observed, endDate)
  };
}

export function contributionSection({ versions = {}, updatedAt } = {}) {
  // Put the version in the filename: raw/CDN caches may ignore query strings.
  const image = theme => `https://raw.githubusercontent.com/risbh19/risbh19/main/assets/github-stats-${theme}${versions[theme] ? `-${versions[theme]}` : ''}.svg`;
  return [
    '<a href="https://github.com/risbh19" title="Rishabh Pal (@risbh19)">',
    '  <picture>',
    `    <source media="(prefers-color-scheme: dark)" srcset="${image('dark')}" />`,
    `    <img src="${image('light')}" width="500" height="195" alt="Rishabh Pal (@risbh19) GitHub Stats: total stars, commits, pull requests, issues, repositories contributed to and rank" />`,
    '  </picture>',
    '</a>',
    ...(updatedAt ? ['<br />', `<sub>Last refreshed: ${esc(stamp(updatedAt))} · Scheduled every 12 hours · <a href="https://github.com/risbh19/risbh19/actions/workflows/profile.yml">Refresh status</a></sub>`] : [])
  ].join('\n');
}

export function replaceContributionSection(readme, details) {
  const start = '<!-- CONTRIBUTION_STATS:START -->';
  const end = '<!-- CONTRIBUTION_STATS:END -->';
  if (readme.split(start).length !== 2 || readme.split(end).length !== 2 || readme.indexOf(start) > readme.indexOf(end)) {
    throw new Error('Expected exactly one contribution statistics section');
  }
  const first = readme.indexOf(start) + start.length;
  const last = readme.indexOf(end);
  return readme.slice(0, first) + '\n' + contributionSection(details) + '\n' + readme.slice(last);
}

export function parseCodeChef(html) {
  const rating = Number(html.match(/<div\b[^>]*class="rating-number"[^>]*>\s*(\d+)/)?.[1]);
  const maxRating = Number(html.match(/Highest Rating\s+(\d+)/i)?.[1]);
  if (!finite(rating) || !finite(maxRating)) throw new Error('CodeChef rating unavailable');
  return { handle: CONFIG.codechef, rating, maxRating };
}

async function githubData() {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await json(`https://api.github.com/users/${CONFIG.github}/repos?type=owner&sort=updated&per_page=100&page=${page}`);
    if (!Array.isArray(batch)) throw new Error('GitHub repository response changed');
    repos.push(...batch.filter(r => !r.private && !r.fork));
    if (batch.length < 100) break;
    if (page >= 100) throw new Error('Repository pagination limit reached');
  }
  const languages = {};
  await Promise.all(repos.filter(r => r.size > 0 && r.name !== CONFIG.github).map(async repo => {
    const result = await json(repo.languages_url);
    for (const [name, bytes] of Object.entries(result)) {
      if (!finite(bytes) || bytes < 0) throw new Error('Invalid language data');
      languages[name] = (languages[name] || 0) + bytes;
    }
  }));
  return { languages: Object.entries(languages).sort((a, b) => b[1] - a[1]) };
}

async function codeforcesData() {
  const result = await json(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(CONFIG.codeforces)}`);
  if (result.status !== 'OK' || !result.result?.[0]) throw new Error('Codeforces user unavailable');
  const user = result.result[0];
  if (!finite(user.rating) || !finite(user.maxRating)) throw new Error('Codeforces rating unavailable');
  return { handle: user.handle, rating: user.rating, maxRating: user.maxRating, rank: user.rank || 'unrated' };
}

async function leetcodeData() {
  const result = await json('https://leetcode.com/graphql/', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com/' },
    body: JSON.stringify({ query: 'query ($user: String!) { matchedUser(username: $user) { username submitStatsGlobal { acSubmissionNum { difficulty count } } } userContestRanking(username: $user) { attendedContestsCount rating } }', variables: { user: CONFIG.leetcode } })
  });
  const user = result.data?.matchedUser;
  if (result.errors || !user || user.username.toLowerCase() !== CONFIG.leetcode.toLowerCase()) throw new Error('LeetCode profile unavailable');
  const counts = Object.fromEntries(user.submitStatsGlobal.acSubmissionNum.map(x => [x.difficulty, x.count]));
  if (!['All', 'Easy', 'Medium', 'Hard'].every(key => finite(counts[key]))) throw new Error('LeetCode problem counts unavailable');
  const contest = result.data.userContestRanking;
  return { handle: user.username, solved: counts.All, easy: counts.Easy, medium: counts.Medium, hard: counts.Hard, contestRating: finite(contest?.rating) ? Math.round(contest.rating) : null, contests: finite(contest?.attendedContestsCount) ? contest.attendedContestsCount : null };
}

const THEMES = {
  dark: { bg: '#0d1117', panel: '#161b22', fg: '#e6edf3', muted: '#9da7b3', line: '#30363d', teal: '#5eead4', blue: '#7aa2f7', purple: '#c4b5fd', grid: ['#161b22', '#164e45', '#187667', '#2cbfa4', '#5eead4'] },
  light: { bg: '#ffffff', panel: '#f6f8fa', fg: '#1f2328', muted: '#59636e', line: '#d1d9e0', teal: '#087f75', blue: '#0969da', purple: '#8250df', grid: ['#ebedf0', '#b3e8da', '#70cbb4', '#2ca58d', '#087f75'] }
};
const txt = (x, y, text, color, size = 14, extra = '') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" ${extra}>${esc(text)}</text>`;
const sourceLabel = source => !source?.data ? 'Temporarily unavailable' : `${source.status === 'stale' ? 'Last available · ' : 'Updated '}${stamp(source.fetchedAt)}`;
function svg(width, height, title, theme, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>text{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif} .mono{font-family:Consolas,Menlo,monospace} @media(prefers-reduced-motion:reduce){animate,animateMotion{display:none}.motion{display:none}}</style><rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="16" fill="${theme.bg}" stroke="${theme.line}"/>${body}</svg>\n`;
}
function heading(title, subtitle, t) {
  return txt(28, 34, title, t.fg, 20, 'font-weight="650"') + txt(28, 57, subtitle, t.muted, 11);
}
function renderLanguages(source, t) {
  const entries = source?.data?.languages || [];
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  const top = entries.slice(0, 5);
  if (entries.length > 5) top.push(['Other', entries.slice(5).reduce((sum, [, n]) => sum + n, 0)]);
  let body = heading('Languages in my public repositories', 'Share of source bytes · excludes forks and this profile repository', t);
  let x = 28;
  const colors = [t.teal, t.blue, t.purple, '#d29922', '#db6d8b', t.muted];
  top.forEach(([name, bytes], i) => {
    const width = total ? bytes / total * 744 : 0;
    body += `<rect x="${x}" y="80" width="${width}" height="11" fill="${colors[i]}"/>`;
    x += width;
    const col = i % 2, row = Math.floor(i / 2);
    body += `<circle cx="${34 + col * 380}" cy="${121 + row * 33}" r="4" fill="${colors[i]}"/>`;
    body += txt(46 + col * 380, 126 + row * 33, `${name} · ${(bytes / total * 100).toFixed(1)}%`, t.fg, 13);
  });
  if (!total) body += txt(28, 112, source?.data ? 'No language data available' : 'Waiting for public repository data', t.muted);
  body += txt(28, 234, sourceLabel(source), t.muted, 10);
  return svg(800, 254, 'Public repository language breakdown', t, body);
}

function calendarLayout(source) {
  const days = source?.data?.days || [];
  if (!days.length) return [];
  const first = new Date(days[0].date + 'T00:00:00Z');
  const sunday = first.getTime() - first.getUTCDay() * 86400000;
  return days.map(d => {
    const dt = new Date(d.date + 'T00:00:00Z');
    return { ...d, x: 39 + Math.floor((dt - sunday) / 604800000) * 14, y: 99 + dt.getUTCDay() * 14 };
  });
}

function renderCalendar(source, t) {
  const cells = calendarLayout(source);
  const total = source?.data?.total;
  let body = heading('A year of showing up', `${number(total)} contributions across the displayed calendar window`, t);
  body += txt(9, 119, 'M', t.muted, 9) + txt(9, 147, 'W', t.muted, 9) + txt(9, 175, 'F', t.muted, 9);
  let month;
  for (const d of cells) {
    if (d.date.slice(0, 7) !== month && (new Date(d.date + 'T00:00:00Z')).getUTCDay() === 0) {
      month = d.date.slice(0, 7);
      body += txt(d.x, 86, new Date(d.date + 'T00:00:00Z').toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), t.muted, 10);
    }
    body += `<rect x="${d.x}" y="${d.y}" width="11" height="11" rx="2" fill="${t.grid[d.level]}"><title>${d.date}: ${d.count} contributions</title></rect>`;
  }
  if (!cells.length) body += txt(28, 125, 'Contribution data temporarily unavailable', t.muted);
  body += txt(28, 234, sourceLabel(source), t.muted, 10);
  body += txt(627, 234, 'Less', t.muted, 10);
  t.grid.forEach((color, i) => { body += `<rect x="${655 + i * 15}" y="224" width="11" height="11" rx="2" fill="${color}"/>`; });
  body += txt(735, 234, 'More', t.muted, 10);
  return svg(800, 254, 'GitHub contribution heatmap', t, body);
}

function renderCoding(sources, t) {
  const lc = sources.leetcode?.data, cf = sources.codeforces?.data, cc = sources.codechef?.data;
  let body = heading('The problem-solving side', 'LeetCode · Codeforces · CodeChef', t);
  const columns = [
    { x: 28, name: 'LeetCode', handle: CONFIG.leetcode, source: sources.leetcode, rows: [['Solved', number(lc?.solved)], ['Easy / Medium / Hard', lc ? `${lc.easy} / ${lc.medium} / ${lc.hard}` : '—'], ['Contest rating', number(lc?.contestRating)]] },
    { x: 290, name: 'Codeforces', handle: CONFIG.codeforces, source: sources.codeforces, rows: [['Rating', number(cf?.rating)], ['Best rating', number(cf?.maxRating)], ['Rank', cf?.rank || '—']] },
    { x: 552, name: 'CodeChef', handle: CONFIG.codechef, source: sources.codechef, rows: [['Rating', number(cc?.rating)], ['Best rating', number(cc?.maxRating)], ['Platform', 'Competitive programming']] }
  ];
  for (const c of columns) {
    body += txt(c.x, 93, c.name, t.teal, 17, 'font-weight="650"') + txt(c.x, 116, c.handle, t.muted, 12);
    c.rows.forEach(([label, value], i) => {
      body += txt(c.x, 150 + i * 46, label, t.muted, 10) + txt(c.x, 170 + i * 46, value, t.fg, 14, 'font-weight="600"');
    });
    const status = !c.source?.data ? 'Temporarily unavailable' : `${c.source.status === 'stale' ? 'Last available' : 'Updated'} ${stamp(c.source.fetchedAt).replace(' IST', '')}`;
    body += txt(c.x, 293, status, t.muted, 9);
  }
  return svg(800, 316, 'Competitive programming statistics', t, body);
}

const PROJECT_CARDS = [
  {
    file: 'project-mini-redis',
    title: 'mini-redis',
    stack: 'C++17 / Linux',
    summary: 'Redis-compatible string store with epoll, RESP2 and persistence.',
    accent: 'teal'
  },
  {
    file: 'project-orbit',
    title: 'Orbit',
    stack: 'TypeScript / Electron',
    summary: 'Desktop IDE with a piece-table editor, TypeScript LSP and terminal.',
    accent: 'blue'
  },
  {
    file: 'project-paper-trading',
    title: 'Paper Trading Engine',
    stack: 'C++20 / Python',
    summary: 'Deterministic market-data replay, simulated fills and risk checks.',
    accent: 'purple'
  }
];

function editorPanel(height, title, t, body) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="840" height="' + height + '" viewBox="0 0 840 ' + height + '" role="img" aria-labelledby="panel-title">',
    '<title id="panel-title">' + esc(title) + '</title>',
    '<style>',
    'text{font-family:system-ui,-apple-system,Segoe UI,sans-serif}',
    '.mono{font-family:Consolas,Menlo,monospace}',
    '.sweep{animation:sweep 4.4s ease-in-out}',
    '.cursor{animation:blink 1.25s step-end 3}',
    '.boot-prompt{animation:boot-in .32s ease-out both}',
    '.boot-name{animation:boot-in .42s .24s ease-out both}',
    '.boot-output{animation:boot-in .42s .52s ease-out both}',
    '@keyframes sweep{0%,100%{transform:translateY(0);opacity:.25}50%{transform:translateY(128px);opacity:.7}}',
    '@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}',
    '@keyframes boot-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}',
    '@media(prefers-reduced-motion:reduce){.sweep,.cursor,.boot-prompt,.boot-name,.boot-output{animation:none}}',
    '</style>',
    '<rect x=".5" y=".5" width="839" height="' + (height - 1) + '" rx="12" fill="' + t.bg + '" stroke="' + t.line + '"/>',
    body,
    '</svg>\n'
  ].join('\n');
}

function renderHeader(t) {
  const title = 'Rishabh Pal, @risbh19. Systems programming and backend development.';
  const mono = 'class="mono"';
  const body = [
    '<defs>',
    '<linearGradient id="trace"><stop stop-color="' + t.teal + '"/><stop offset="1" stop-color="' + t.purple + '"/></linearGradient>',
    '<pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0H0v18" fill="none" stroke="' + t.line + '"/></pattern>',
    '</defs>',
    '<path d="M1 40V13a12 12 0 0 1 12-12h814a12 12 0 0 1 12 12v27Z" fill="' + t.panel + '"/>',
    '<path d="M1 40.5h838M39.5 41v202M1 243.5h838" stroke="' + t.line + '"/>',
    '<path d="M83 2h142v38H83z" fill="' + t.bg + '"/>',
    '<path d="M83 40.5h142" stroke="url(#trace)" stroke-width="2"/>',
    '<path d="M22 15h8l5 5v8H22zM30 15v5h5" fill="none" stroke="' + t.teal + '" stroke-linejoin="round"/>',
    txt(100, 26, 'README.md', t.fg, 14, mono),
    txt(816, 26, 'risbh19 / risbh19', t.muted, 13, mono + ' text-anchor="end"'),
    '<path d="M14 67h12m-12 5h8m-8 23h12m-12 5h8" stroke="' + t.muted + '" opacity=".6" stroke-linecap="round"/>',
    '<path d="M16 119l4 4-4 4m6 0h5" fill="none" stroke="' + t.teal + '" stroke-linecap="round" stroke-linejoin="round"/>',
    txt(61, 80, 'risbh19@github:~$ whoami', t.teal, 19, 'class="mono boot-prompt"'),
    txt(59, 145, 'Rishabh Pal', t.fg, 58, 'class="boot-name" font-weight="740" letter-spacing="-2.4"'),
    '<g class="boot-output">',
    txt(62, 184, 'Systems programming', t.fg, 23),
    txt(62, 213, 'Backend development', t.muted, 23),
    '<path class="cursor" d="M310 198h11v17h-11z" fill="' + t.teal + '" opacity=".8"/>',
    '</g>',
    '<rect x="545" y="62" width="267" height="160" rx="8" fill="' + t.panel + '" stroke="' + t.line + '"/>',
    '<rect x="546" y="63" width="265" height="158" rx="7" fill="url(#grid)" opacity=".7"/>',
    '<path class="sweep" d="M553 77h251" stroke="url(#trace)" stroke-width="1.5"/>',
    '<path d="M566 98V82h16m191 0h17v16m0 90v15h-17m-191 0h-16v-15" fill="none" stroke="' + t.teal + '" opacity=".75"/>',
    '<path d="M566 143h42l12-17 15 35 18-67 21 92 16-42h29l13-21 14 27 13-7h31" fill="none" stroke="url(#trace)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    '<circle cx="653" cy="94" r="4" fill="' + t.purple + '"/>',
    '<circle cx="790" cy="143" r="3.5" fill="' + t.teal + '"/>',
    txt(62, 265, '~/risbh19', t.teal, 13, mono),
    txt(816, 265, 'Markdown', t.muted, 13, mono + ' text-anchor="end"')
  ].join('\n');
  return editorPanel(279, title, t, body);
}

function renderProjectCard(project, t) {
  const accent = t[project.accent];
  const body = [
    '<path d="M2 18v75" fill="none" stroke="' + accent + '" stroke-width="3" stroke-linecap="round"/>',
    '<rect x="23" y="21" width="48" height="48" rx="8" fill="' + t.panel + '" stroke="' + t.line + '"/>',
    '<path d="m34 40 7 6-7 6m12 0h12" fill="none" stroke="' + accent + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    txt(92, 42, project.title, t.fg, 30, 'font-weight="700"'),
    txt(92, 79, project.summary, t.muted, 20),
    txt(780, 38, project.stack, accent, 17, 'class="mono" text-anchor="end"'),
    '<path d="M800 30h15v15m0-15-16 16" fill="none" stroke="' + accent + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  ].join('\n');
  return editorPanel(105, 'Open ' + project.title + '. ' + project.stack + '. ' + project.summary, t, body);
}

function renderActivity(source, t) {
  const summary = activitySummary(source?.data?.days || []);
  const mono = 'class="mono"';
  let body = '<path d="M1 40.5h838" stroke="' + t.line + '"/>\n' +
    txt(22, 26, '~/github/activity.log', t.teal, 17, mono) + '\n' +
    txt(817, 26, 'PUBLIC GITHUB ACTIVITY', t.muted, 13, mono + ' text-anchor="end"') + '\n';
  if (!summary) {
    body += txt(24, 83, 'Contribution activity temporarily unavailable', t.fg, 24) + '\n' +
      txt(24, 116, 'Waiting for 30 observed days', t.muted, 15);
    return editorPanel(142, 'GitHub contribution telemetry temporarily unavailable', t, body);
  }

  const contributions = number(summary.total);
  const formatDays = count => count + (count === 1 ? ' day' : ' days');
  const metrics = [
    [24, 'CONTRIBUTIONS / 30D', contributions, t.teal],
    [304, 'CURRENT STREAK', formatDays(summary.current), t.blue],
    [570, 'LONGEST IN CALENDAR', formatDays(summary.longest), t.purple]
  ];
  for (const [x, label, value, accent] of metrics) {
    body += txt(x, 72, label, t.muted, 15, mono) + '\n' +
      txt(x, 112, value, accent, 33, 'font-weight="710"') + '\n';
  }

  const maximum = Math.max(1, ...summary.days.map(day => day.count));
  body += '<path d="M24 140.5h792m-792 38h792m-792 38h792" fill="none" stroke="' + t.line + '" stroke-dasharray="3 5"/>\n';
  for (const [index, day] of summary.days.entries()) {
    const height = Math.max(2, Math.round(day.count / maximum * 76));
    const fill = day.count ? (index === summary.days.length - 1 ? t.purple : t.teal) : t.line;
    body += '<rect x="' + (26 + index * 26.4).toFixed(1) + '" y="' + (216 - height) +
      '" width="16" height="' + height + '" rx="3" fill="' + fill +
      '"><title>' + day.date + ': ' + day.count + (day.count === 1 ? ' contribution' : ' contributions') + '</title></rect>\n';
  }
  const date = day => new Date(day.date + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  body += txt(24, 244, date(summary.days[0]) + ' – ' + date(summary.days.at(-1)) + ' · UTC', t.muted, 15, mono) +
    '\n' + txt(24, 273, sourceLabel(source), t.muted, 14, mono);
  const title = 'Contribution activity. ' + contributions + (summary.total === 1 ? ' contribution' : ' contributions') +
    ' over 30 days. Current streak ' + formatDays(summary.current) + '. Longest streak in the calendar ' +
    formatDays(summary.longest) + '. ' + sourceLabel(source);
  return editorPanel(293, title, t, body);
}

export async function refresh(root = ROOT) {
  await mkdir(resolve(root, 'assets'), { recursive: true });
  await mkdir(resolve(root, 'data'), { recursive: true });
  let previous = {};
  try { previous = JSON.parse(await readFile(resolve(root, 'data/profile.json'), 'utf8')).sources || {}; } catch { /* First run has no previous snapshot. */ }
  const sources = {};
  const fetchers = {
    github: githubData,
    calendar: async () => parseCalendar(await (await request(`https://github.com/users/${CONFIG.github}/contributions`)).text()),
    codeforces: codeforcesData,
    codechef: async () => parseCodeChef(await (await request(`https://www.codechef.com/users/${CONFIG.codechef}`)).text()),
    leetcode: leetcodeData
  };
  await Promise.all(Object.entries(fetchers).map(async ([key, fetcher]) => {
    try {
      sources[key] = { status: 'fresh', fetchedAt: new Date().toISOString(), data: await fetcher() };
    } catch (error) {
      sources[key] = { status: previous[key]?.data ? 'stale' : 'unavailable', fetchedAt: previous[key]?.fetchedAt || null, data: previous[key]?.data || null };
      console.warn(`${key}: ${error.message}; ${sources[key].status}`);
    }
  }));
  const snapshot = { version: 1, refreshedAt: new Date().toISOString(), sources };
  await writeFile(resolve(root, 'data/profile.json'), JSON.stringify(snapshot, null, 2) + '\n');
  for (const [name, theme] of Object.entries(THEMES)) {
    const images = {
      header: renderHeader(theme), languages: renderLanguages(sources.github, theme),
      contributions: renderCalendar(sources.calendar, theme), activity: renderActivity(sources.calendar, theme),
      coding: renderCoding(sources, theme)
    };
    for (const project of PROJECT_CARDS) images[project.file] = renderProjectCard(project, theme);
    await Promise.all(Object.entries(images).map(([key, content]) => writeFile(resolve(root, `assets/${key}-${name}.svg`), content)));
  }
  // Stats publication runs after the upstream cards are generated. Keep its
  // previous filenames and success time intact until both new variants pass.
  console.log(JSON.stringify({ refreshedAt: snapshot.refreshedAt, sources: Object.fromEntries(Object.entries(sources).map(([key, s]) => [key, { status: s.status, fetchedAt: s.fetchedAt }])) }, null, 2));
  if (!Object.values(sources).some(s => s.status === 'fresh')) throw new Error('All sources failed; kept the previous data with stale labels');
  return snapshot;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  refresh().catch(error => { console.error(error.message); process.exitCode = 1; });
}
