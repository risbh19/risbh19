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

export function parseCodeChef(html) {
  const rating = Number(html.match(/<div\b[^>]*class="rating-number"[^>]*>\s*(\d+)/)?.[1]);
  const maxRating = Number(html.match(/Highest Rating\s+(\d+)/i)?.[1]);
  if (!finite(rating) || !finite(maxRating)) throw new Error('CodeChef rating unavailable');
  return { handle: CONFIG.codechef, rating, maxRating };
}

async function githubData() {
  const user = await json(`https://api.github.com/users/${CONFIG.github}`);
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
  if (![user.followers, user.public_repos].every(finite)) throw new Error('Invalid GitHub profile response');
  return {
    followers: user.followers, publicRepos: user.public_repos,
    stars: repos.reduce((n, r) => n + r.stargazers_count, 0),
    forks: repos.reduce((n, r) => n + r.forks_count, 0),
    languages: Object.entries(languages).sort((a, b) => b[1] - a[1]),
    projects: repos.filter(r => ['Careflow', 'college-forum', 'EduSense'].includes(r.name)).map(r => ({ name: r.name, stars: r.stargazers_count, updatedAt: r.pushed_at }))
  };
}

async function activityData() {
  const events = await json(`https://api.github.com/users/${CONFIG.github}/events/public?per_page=100`);
  if (!Array.isArray(events)) throw new Error('Invalid public activity response');
  const labels = { PushEvent: 'Pushed code', PullRequestEvent: 'Updated a pull request', IssuesEvent: 'Updated an issue', IssueCommentEvent: 'Commented', CreateEvent: 'Created a branch or repository', ReleaseEvent: 'Published a release', ForkEvent: 'Forked a repository' };
  return events.filter(e => e.public && labels[e.type] && e.repo?.name !== `${CONFIG.github}/${CONFIG.github}`).slice(0, 5)
    .map(e => ({ label: labels[e.type], repo: e.repo.name, date: e.created_at, url: `https://github.com/${e.repo.name}` }));
}

async function collaborationData() {
  const count = async qualifier => {
    const result = await json(`https://api.github.com/search/issues?q=${encodeURIComponent(`author:${CONFIG.github} is:public ${qualifier}`)}&per_page=1`);
    if (!finite(result.total_count) || result.incomplete_results) throw new Error('Incomplete collaboration statistics');
    return result.total_count;
  };
  const [pullRequests, merged, issues] = await Promise.all([count('is:pr'), count('is:pr is:merged'), count('is:issue')]);
  return { pullRequests, merged, issues };
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
function stat(x, y, label, value, t) {
  return txt(x, y, value, t.teal, 31, 'font-weight="700"') + txt(x, y + 24, label, t.muted, 12);
}

function renderOverview(sources, t) {
  const gh = sources.github?.data;
  const cal = sources.calendar?.data;
  const summary = cal ? streaks(cal.days) : null;
  const collaboration = sources.collaboration?.data;
  let body = heading('GitHub · by the numbers', 'Public profile and public, owned repositories', t);
  body += stat(28, 111, 'Public repositories', number(gh?.publicRepos), t);
  body += stat(270, 111, 'Repository stars', number(gh?.stars), t);
  body += stat(510, 111, 'Followers', number(gh?.followers), t);
  body += stat(28, 194, 'Contributions · calendar window', number(cal?.total), t);
  body += stat(270, 194, 'Current streak · days', number(summary?.current), t);
  body += stat(510, 194, 'Longest streak · window', number(summary?.longest), t);
  body += stat(28, 277, 'Public PRs authored', number(collaboration?.pullRequests), t);
  body += stat(270, 277, 'Public PRs merged', number(collaboration?.merged), t);
  body += stat(510, 277, 'Public issues authored', number(collaboration?.issues), t);
  body += txt(28, 329, `Profile: ${sourceLabel(sources.github)}`, t.muted, 10);
  body += txt(28, 347, `Calendar: ${sourceLabel(sources.calendar)}`, t.muted, 10);
  body += txt(28, 365, `Collaboration: ${sourceLabel(sources.collaboration)}`, t.muted, 10);
  return svg(800, 384, 'GitHub statistics for risbh19', t, body);
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

function renderCalendar(source, t, game = false) {
  const cells = calendarLayout(source);
  const total = source?.data?.total;
  let body = heading(game ? 'Contribution arcade' : 'A year of showing up', game ? 'An animated tour of the actual contribution grid' : `${number(total)} contributions across the displayed calendar window`, t);
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
  if (game && cells.length) {
    // Smooth snake-like trail follows the dated calendar cells; the values remain visible.
    const points = [...cells].sort((a, b) => a.x - b.x || ((Math.round((a.x - 39) / 14) % 2) ? b.y - a.y : a.y - b.y));
    const path = points.map((p, i) => `${i ? 'L' : 'M'}${p.x + 5.5},${p.y + 5.5}`).join(' ');
    body += `<g class="motion"><path d="${path}" pathLength="1000" fill="none" stroke="${t.blue}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8 992"><animate attributeName="stroke-dashoffset" from="0" to="-1000" dur="32s" repeatCount="indefinite"/></path><circle r="4.5" fill="${t.teal}"><animateMotion dur="32s" repeatCount="indefinite" path="${path}"/></circle></g>`;
  }
  body += txt(28, 234, sourceLabel(source), t.muted, 10);
  body += txt(627, 234, 'Less', t.muted, 10);
  t.grid.forEach((color, i) => { body += `<rect x="${655 + i * 15}" y="224" width="11" height="11" rx="2" fill="${color}"/>`; });
  body += txt(735, 234, 'More', t.muted, 10);
  return svg(800, 254, game ? 'Animated contribution arcade using actual GitHub data' : 'GitHub contribution heatmap', t, body);
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

function renderActivity(source, t) {
  const events = source?.data || [];
  let body = heading('Recently on GitHub', 'Latest public events · profile automation excluded', t);
  events.forEach((e, i) => {
    const y = 91 + i * 43;
    body += `<circle cx="32" cy="${y - 4}" r="3" fill="${t.teal}"/>`;
    const label = `${e.label} · ${e.repo}`;
    body += txt(47, y, label.length > 94 ? label.slice(0, 91) + '…' : label, t.fg, 13);
    body += txt(47, y + 17, e.date.slice(0, 10), t.muted, 10);
  });
  if (!events.length) body += txt(28, 100, source?.data ? 'No recent public activity in the available event window.' : 'Public activity temporarily unavailable.', t.muted, 12);
  body += txt(28, 319, sourceLabel(source), t.muted, 10);
  return svg(800, 339, 'Recent public GitHub activity', t, body);
}

function renderHeader(t) {
  let body = `<defs><linearGradient id="glow" x2="1" y2="1"><stop stop-color="${t.teal}" stop-opacity="0.14"/><stop offset="1" stop-color="${t.blue}" stop-opacity="0.02"/></linearGradient><clipPath id="typing"><rect x="38" y="186" width="715" height="26"><animate attributeName="width" values="0;715;715;0" keyTimes="0;0.38;0.88;1" dur="9s" repeatCount="indefinite"/></rect></clipPath></defs><rect x="1" y="1" width="798" height="250" rx="16" fill="url(#glow)"/>`;
  body += txt(38, 43, 'RISBH19  /  DEVELOPER PROFILE', t.teal, 12, 'class="mono" letter-spacing="2"');
  body += txt(38, 108, 'Rishabh Pal', t.fg, 49, 'font-weight="750" letter-spacing="-2"');
  body += txt(38, 151, 'Full-stack development. Backend at heart.', t.muted, 20);
  body += `<g clip-path="url(#typing)">${txt(38, 207, '> FastAPI backends · useful interfaces · competitive programming', t.teal, 15, 'class="mono"')}</g>`;
  body += `<text x="718" y="108" fill="${t.blue}" opacity="0.4" font-family="monospace" font-size="43">{ }</text>`;
  return svg(800, 252, 'Rishabh Pal — full-stack development, FastAPI backends and competitive programming', t, body);
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
    activity: activityData,
    collaboration: collaborationData,
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
      header: renderHeader(theme), overview: renderOverview(sources, theme), languages: renderLanguages(sources.github, theme),
      contributions: renderCalendar(sources.calendar, theme), arcade: renderCalendar(sources.calendar, theme, true),
      coding: renderCoding(sources, theme), activity: renderActivity(sources.activity, theme)
    };
    await Promise.all(Object.entries(images).map(([key, content]) => writeFile(resolve(root, `assets/${key}-${name}.svg`), content)));
  }
  console.log(JSON.stringify({ refreshedAt: snapshot.refreshedAt, sources: Object.fromEntries(Object.entries(sources).map(([key, s]) => [key, { status: s.status, fetchedAt: s.fetchedAt }])) }, null, 2));
  if (!Object.values(sources).some(s => s.status === 'fresh')) throw new Error('All sources failed; kept the previous data with stale labels');
  return snapshot;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  refresh().catch(error => { console.error(error.message); process.exitCode = 1; });
}
