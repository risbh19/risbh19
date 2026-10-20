# Profile data and design

The README uses original, repository-hosted SVG cards plus the requested GitHub Readme Stats card. The custom generator uses built-in Node.js 22 modules. The GitHub Stats card uses the maintained upstream action, pinned to v2.1.0's commit and renderer version 2.2.1. Both run with the repository's automatically supplied `GITHUB_TOKEN`; no personal access token is required.

The current layout pairs an original 650-pixel animated profile header with a short introduction, five core skill groups, three featured projects, brief experience and achievements, and two 500-pixel GitHub cards. Coding-platform statistics and the full contribution calendar are expandable. GitHub scales images down on narrow screens. The refresh generator preserves the 500-pixel stats-card width.

Core technologies use compact name-and-icon badges. Brand icons come from Shields.io; SQL, REST APIs and JWT use original repository-hosted database, request/response and key glyphs. A short After Hours line keeps the anime, retro and problem-solving theme without adding another large card.

## Refresh behavior

- Runs once every 24 hours at 18:47 UTC (00:17 IST), after changes to the README/generator/tests/workflow, and on manual dispatch.
- GitHub schedules and image caching can delay visible updates; the README is not a continuously streaming dashboard.
- Each source has its own observation time. A partial failure preserves its last successful data and marks that source as **Last available**. Missing values display an em dash, never an invented zero or rank.
- When all data sources fail, the workflow fails and leaves the previously published cards available. Run history and the cards' timestamps make freshness visible.
- Public repository updates elsewhere appear on the next daily run. The workflow updates the generated images; the marked contribution-stats section embeds the upstream card in light and dark variants.
- The GitHub Stats action fails rather than committing an error image when its data source fails. The previously published card remains available.
- GitHub may disable scheduled workflows in inactive public repositories. The manual **Actions → Refresh profile → Run workflow** control remains available; re-enable the schedule if GitHub disables it.

## What the numbers mean

- **Languages (optional asset):** source bytes from public, owned, non-fork repositories, excluding the profile repo. This asset is not shown in the minimal README. It describes repository composition, not time spent coding or a proficiency score.
- **Contributions:** counts from the same public GitHub calendar shown to a visitor. The displayed calendar can include a partial starting week. It follows GitHub's attribution rules and can include anonymized contribution counts if the account has chosen to display them publicly.
- **Activity graph:** an original 30-day line chart of those same calendar counts, ending on the last observed date. It shows the window's total, current streak (including yesterday if today has no contributions yet), and longest streak within the displayed calendar. The longest streak is not an all-time record. A missing daily observation makes the chart unavailable instead of inventing a zero. Cached charts retain their original date range and observation timestamp.
- **GitHub Stats card:** total stars, total commits (`include_all_commits=true`), pull requests, issues, repositories contributed to in the last year, and the upstream rank ring. Counts and the rank are computed by the upstream renderer from the accessible public profile, not copied from the example screenshot. The rank is that project's scoring system, not an official GitHub rating.
- **LeetCode:** accepted problem counts by difficulty and contest rating from the platform's public GraphQL endpoint. This endpoint is not a guaranteed stable public API.
- **Codeforces:** current rating, maximum rating and rank from the official public `user.info` API.
- **CodeChef:** current and highest ratings parsed from the public profile page. A layout change or access block causes a marked stale/unavailable state.
- **Featured projects:** WaveSafe, College Forum and Careflow. WaveSafe is a private repository explicitly selected by the profile owner; its link requires repository access. Its basic project overview is included, while private code and statistics are not fetched by the scheduled workflow.

## Design references

The earlier design explored categories from [Awesome GitHub Profile README](https://github.com/abhisheknaiidu/awesome-github-profile-readme). The current version retains a small selection in a minimal layout. Personal claims and statistics from other profiles were not copied.

[Arvind Kumar's profile](https://github.com/arvindkumar-ship-it/arvindkumar-ship-it) also informed the presentation of GitHub stats, streaks and contribution activity. This profile keeps its own introduction, project descriptions, skills and original light/dark chart design. Skills, achievements and the one-month work experience were supplied by the profile owner.

The following records the earlier design exploration. The current README retains the animated profile header, a small waving-hand GIF, technology badges and a short After Hours line. Code-mode introductions and large decorative panels are omitted.

| Category | Element explored | Reference |
| --- | --- | --- |
| GitHub Actions | Daily data refresh and generated assets | [Simon Willison](https://github.com/simonw/simonw) |
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

- [Awesome GitHub Profile README](https://github.com/abhisheknaiidu/awesome-github-profile-readme): category/reference discovery.
- [Shields.io](https://shields.io/): externally hosted badges.
- [Skill Icons](https://github.com/tandpfun/skill-icons): externally hosted technology icons.
- [GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats): the card design selected by the profile owner.
- [GitHub Readme Stats Action](https://github.com/stats-organization/github-readme-stats-action) and its maintained core: daily generation of the repository-hosted stats card.
- [Martin Heinz wave GIF](https://github.com/MartinHeinz/MartinHeinz/blob/master/wave.gif): externally linked waving-hand animation.
- [Ashutosh anime GIF](https://github.com/Xx-Ashutosh-xX/Xx-Ashutosh-xX/blob/master/assets/208593.gif): externally linked anime illustration. These two GIFs remain hosted by their respective profile owners and are not relicensed by this repository.
- [GitHub repository languages](https://docs.github.com/en/rest/repos/repos#list-repository-languages) and [Codeforces API](https://codeforces.com/apiHelp/methods): public data documentation.

## Local use

```sh
node --test tests/profile.test.mjs
node scripts/update-profile.mjs
```

Set `GITHUB_TOKEN` in the process environment only if authenticated GitHub API quota is needed. The token is sent exclusively to `api.github.com`, never to coding platforms, and is not written to output files. The public profile links and email are explicitly supplied by the profile owner.
