# Profile data and design

The README uses original, repository-hosted SVG cards plus the requested GitHub Readme Stats card. The custom generator uses built-in Node.js 22 modules. The GitHub Stats card uses the maintained upstream action, pinned to v2.1.0's commit and renderer version 2.2.1. Both run with the repository's automatically supplied `GITHUB_TOKEN`; no personal access token is required.

The README opens with an editor-window header and a short `whoami` terminal prompt in light and dark variants. The Command center links three project cards directly to their repositories, with implementation details and supporting links below each card. GitHub telemetry shows 30 days of contribution activity. A disclosure contains coding-platform statistics and the GitHub Stats card. The refresh generator replaces only the marked GitHub Stats embed in the README.

Core technologies are grouped as text for easier scanning on narrow screens. The original Seven Deadly Sins GIF appears in the After hours disclosure at 300 pixels and links to its source in Ashutosh's public profile assets.

## Refresh behavior

- Refreshes once per 10-hour UTC window, after changes to the README/generator/tests/workflow, and on manual dispatch. An hourly check at minute 47 compares the current window with the last successfully published `data/profile.json` observation; runs within the same window skip generation. Windows are anchored at 00:47 UTC on 1 January 1970 and advance continuously across midnight, month ends and year ends. For example, successive windows begin at 00:47, 10:47, 20:47, then 06:47 and 16:47 UTC on the following day. A simple `*/10` hour cron would incorrectly leave a four-hour gap at midnight. Failed or missed refreshes are retried by the next hourly check. Pushes and manual runs refresh immediately. The same workflow refreshes GitHub Stats and the LeetCode, Codeforces and CodeChef cards.
- GitHub schedules and image caching can delay visible updates; the README is not a continuously streaming dashboard.
- Each source has its own observation time. A partial failure preserves its last successful data and marks that source as **Last available**. Missing values display an em dash, never an invented zero or rank.
- When all data sources fail, the workflow fails and leaves the previously published cards available. Run history and the cards' timestamps make freshness visible.
- Public repository updates elsewhere appear on the next scheduled run. The workflow updates the generated images; the marked contribution-stats section embeds the upstream card in light and dark variants.
- The GitHub Stats action fails rather than committing an error image when its data source fails. The previously published card remains available.
- After generation, `scripts/publish-stats.mjs` checks both SVGs for the expected Rishabh Pal title, all five metric values and the rank, and rejects upstream error images or mismatched light/dark counts. Only then does it publish content-versioned SVG filenames and update the README's stats section with their URLs and the successful refresh time. Changed images get new filenames because raw/CDN caches may ignore query strings; unchanged counts keep their existing image versions. The preceding published pair is kept for cached README pages, and older versions are removed. The refresh-status link opens this repository's workflow history. A failed run leaves the last published images and success time intact.
- GitHub may disable scheduled workflows in inactive public repositories. The manual **Actions → Refresh profile → Run workflow** control remains available; re-enable the schedule if GitHub disables it.

## What the numbers mean

- **Languages (optional asset):** source bytes from public, owned, non-fork repositories, excluding the profile repo. This asset is not shown in the minimal README. It describes repository composition, not time spent coding or a proficiency score.
- **Contributions:** counts from the same public GitHub calendar shown to a visitor. The displayed calendar can include a partial starting week. It follows GitHub's attribution rules and can include anonymized contribution counts if the account has chosen to display them publicly.
- **Telemetry chart:** a 30-day bar chart of those same calendar counts, ending on the last observed date. It shows the window's total, current streak (including yesterday if today has no contributions yet), and longest streak within the displayed calendar. The longest streak is not an all-time record. A missing daily observation makes the chart unavailable instead of inventing a zero. Cached charts retain their original date range and observation timestamp.
- **GitHub Stats card:** total stars, total commits (`include_all_commits=true`), pull requests, issues, repositories contributed to in the last year, and the upstream rank ring. Counts and the rank are computed by the upstream renderer from the accessible public profile, not copied from the example screenshot. The rank is that project's scoring system, not an official GitHub rating.
- **LeetCode:** accepted problem counts by difficulty and contest rating from the platform's public GraphQL endpoint. This endpoint is not a guaranteed stable public API.
- **Codeforces:** current rating, maximum rating and rank from the official public `user.info` API.
- **CodeChef:** current and highest ratings parsed from the public profile page. A layout change or access block causes a marked stale/unavailable state.
- **Featured projects:** mini-redis, Orbit and Paper Trading Engine.

## Design references

The editor window, terminal prompt, Command center and telemetry layout are inspired by [Cipher PR’s profile README](https://github.com/lord-saviord1/lord-saviord1). The original SVG panels are rendered from this profile’s data and respect the viewer’s reduced-motion preference where supported.

The terminal and contribution visual draw inspiration from [Shaarav Raghu’s profile](https://github.com/shaaravraghu/shaaravraghu). The centered header and grouped technology labels draw inspiration from [Ananya Katiyar’s profile](https://github.com/Ananya-katiyar/Ananya-katiyar). The header art and chart are generated in this repository.

The October 2026 redesign draws layout inspiration from GitSkins' [Recruiter-ready](https://www.gitskins.com/templates/recruiter) and [Backend](https://www.gitskins.com/templates/backend) previews: an explicit role, concise sections and direct access to projects. The README wording, header SVG and custom statistics cards are original to this repository. GitSkins template code, generated claims and follower counters were not imported.

The earlier design explored categories from [Awesome GitHub Profile README](https://github.com/abhisheknaiidu/awesome-github-profile-readme). The current version retains a small selection in a minimal layout. Personal claims and statistics from other profiles were not copied.

[Arvind Kumar's profile](https://github.com/arvindkumar-ship-it/arvindkumar-ship-it) also informed the presentation of GitHub stats, streaks and contribution activity. This profile keeps its own introduction, project descriptions, skills and original light/dark chart design. Skills, achievements and the one-month work experience were supplied by the profile owner.

The following records the earlier design exploration.

| Category | Element explored | Reference |
| --- | --- | --- |
| GitHub Actions | Eight-hour data refresh and generated assets | [Simon Willison](https://github.com/simonw/simonw) |
| Code Mode | Python developer introduction | [Thaiane Braga](https://github.com/Thaiane/Thaiane) |
| Dynamic Realtime | Freshness-stamped contribution and coding-platform statistics | [Anurag Hazra](https://github.com/anuraghazra/anuraghazra) |
| A Little Bit of Everything | Balanced projects, tools, stats and contact sections | [Martin Heinz](https://github.com/MartinHeinz/MartinHeinz) |
| Descriptive | Concrete project descriptions and backend focus | [Garima Singh](https://github.com/garimasingh128/garimasingh128) |
| Simple but Innovative | Direct navigation to sections | [Nate Moore](https://github.com/natemoo-re/natemoo-re) |
| Typing Mode | Original animated SVG header text | [ABSphreak](https://github.com/ABSphreak/ABSphreak) |
| Anime | Optional animated anime interlude | [Ashutosh](https://github.com/Xx-Ashutosh-xX/Xx-Ashutosh-xX) |
| Minimalistic | One accent palette, light/dark variants and expandable extras | [Gift Egwuenu](https://github.com/lauragift21/lauragift21) |
| GIFS | Waving-hand animation | [Martin Heinz](https://github.com/MartinHeinz/MartinHeinz) |
| Just Images | Self-contained SVG presentation cards | [Zack Krida](https://github.com/zackkrida/zackkrida) |
| Badges | Social and coding-platform badges | [Anirudh Emmadi](https://github.com/aemmadi/aemmadi) |
| Fancy Fonts | Small typographic sign-off; core text stays readable | [Robert Shaw](https://github.com/xiaoluoboding/xiaoluoboding) |
| Icons | Technology icon strip with descriptive alt text | [Yuan Tang](https://github.com/terrytangyuan/terrytangyuan) |
| Retro | Terminal-style after-hours panel | [Livio Brunner](https://github.com/BrunnerLivio/BrunnerLivio) |

## Credits and sources

- [GitSkins](https://www.gitskins.com/): minimal README layout reference, reviewed through its public Recruiter-ready and Backend previews.
- [Awesome GitHub Profile README](https://github.com/abhisheknaiidu/awesome-github-profile-readme): category/reference discovery.
- [Shields.io](https://shields.io/): externally hosted badges.
- [Skill Icons](https://github.com/tandpfun/skill-icons): externally hosted technology icons.
- [GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats): the card design selected by the profile owner.
- [GitHub Readme Stats Action](https://github.com/stats-organization/github-readme-stats-action) and its maintained core: generation of the repository-hosted stats card every 10 hours for `risbh19`, titled **Rishabh Pal's GitHub Stats**.
- [Martin Heinz wave GIF](https://github.com/MartinHeinz/MartinHeinz/blob/master/wave.gif): externally linked waving-hand animation.
- [Ashutosh's Seven Deadly Sins GIF](https://github.com/Xx-Ashutosh-xX/Xx-Ashutosh-xX/blob/master/assets/208593.gif): the externally hosted animation restored in After Hours. The GIF remains hosted in its source repository and is not relicensed by this profile.
- [GitHub repository languages](https://docs.github.com/en/rest/repos/repos#list-repository-languages) and [Codeforces API](https://codeforces.com/apiHelp/methods): public data documentation.

## Local use

```sh
node --test tests/*.test.mjs
node scripts/update-profile.mjs
```

The workflow then generates both GitHub Stats SVGs using the pinned upstream action and runs `node scripts/publish-stats.mjs` to validate them and publish their image versions and success time. Do not run the publication step alone against old assets and present it as a fresh data fetch.

Set `GITHUB_TOKEN` in the process environment only if authenticated GitHub API quota is needed. The token is sent exclusively to `api.github.com`, never to coding platforms, and is not written to output files. The public profile links and email are explicitly supplied by the profile owner.
