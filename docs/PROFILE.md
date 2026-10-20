# Profile data and design

The README uses original, repository-hosted SVG cards. Public statistics are fetched by `scripts/update-profile.mjs` with Node.js 22; there are no runtime package dependencies and no personal access token is required. The workflow uses the repository's automatically supplied `GITHUB_TOKEN` for GitHub API requests and committing generated assets.

## Refresh behavior

- Runs hourly at minute 17, after changes to the README/generator/tests/workflow, and on manual dispatch.
- GitHub schedules and image caching can delay visible updates; the README is not a continuously streaming dashboard.
- Each source has its own observation time. A partial failure preserves its last successful data and marks that source as **Last available**. Missing values display an em dash, never an invented zero or rank.
- When all data sources fail, the workflow fails and leaves the previously published cards available. Run history and the cards' timestamps make freshness visible.
- Public repository updates elsewhere appear on the next hourly run. The public Events API is a limited, delayed recent-events window, not a complete history. Profile-repository events are excluded to keep the automation out of the activity feed.
- GitHub may disable scheduled workflows in inactive public repositories. The manual **Actions → Refresh profile → Run workflow** control remains available; re-enable the schedule if GitHub disables it.

## What the numbers mean

- **Public repositories / followers:** GitHub's public user API.
- **Stars:** stars on public repositories owned by this account, excluding forks. Private repository names, code, languages and activity are not collected or published.
- **Pull requests / issues:** public items authored by this account, from GitHub issue search. Merged pull requests are a subset of authored pull requests.
- **Languages:** source bytes from public, owned, non-fork repositories, excluding the profile repo. This is repository composition, not time spent coding or a proficiency score.
- **Contributions:** counts from the same public GitHub calendar shown to a visitor. The displayed calendar can include a partial starting week. It follows GitHub's attribution rules and can include anonymized contribution counts if the account has chosen to display them publicly.
- **Streaks:** consecutive active calendar days within the displayed window, using UTC date boundaries. The current streak remains active if yesterday had contributions and today is still empty. Longest streak is limited to the calendar window; it is not an all-time claim.
- **LeetCode:** accepted problem counts by difficulty and contest rating from the platform's public GraphQL endpoint. This endpoint is not a guaranteed stable public API.
- **Codeforces:** current rating, maximum rating and rank from the official public `user.info` API.
- **CodeChef:** current and highest ratings parsed from the public profile page. A layout change or access block causes a marked stale/unavailable state.
- **Arcade:** an original animated snake-like tour of the actual heatmap. It is a decorative animation, not an interactive game or a fabricated contribution history.

## Reference categories

The structure was inspired by [Awesome GitHub Profile README](https://github.com/abhisheknaiidu/awesome-github-profile-readme). Each category contributes a specific element; personal claims and statistics from other profiles were not copied.

| Category | Element in this profile | Reference |
| --- | --- | --- |
| GitHub Actions | Hourly data refresh and generated assets | [Simon Willison](https://github.com/simonw/simonw) |
| Game Mode | Expandable contribution arcade | [Tim Burgan](https://github.com/timburgan/timburgan) |
| Code Mode | Python developer introduction | [Thaiane Braga](https://github.com/Thaiane/Thaiane) |
| Dynamic Realtime | Freshness-stamped GitHub and coding-platform cards | [Anurag Hazra](https://github.com/anuraghazra/anuraghazra) |
| A Little Bit of Everything | Balanced projects, tools, stats and contact sections | [Martin Heinz](https://github.com/MartinHeinz/MartinHeinz) |
| Descriptive | Concrete project descriptions and backend focus | [Garima Singh](https://github.com/garimasingh128/garimasingh128) |
| Simple but Innovative | Direct navigation to sections | [Nate Moore](https://github.com/natemoo-re/natemoo-re) |
| Typing Mode | Original animated SVG header text | [ABSphreak](https://github.com/ABSphreak/ABSphreak) |
| Anime | Optional animated anime interlude | [Ashutosh](https://github.com/Xx-Ashutosh-xX/Xx-Ashutosh-xX) |
| Minimalistic | One accent palette, light/dark variants and expandable extras | [Gift Egwuenu](https://github.com/lauragift21/lauragift21) |
| GIFS | Waving-hand animation | [Martin Heinz](https://github.com/MartinHeinz/MartinHeinz) |
| Just Images | Self-contained SVG presentation cards | [Zack Krida](https://github.com/zackkrida/zackkrida) |
| Badges | Social, coding-platform and refresh-status badges | [Anirudh Emmadi](https://github.com/aemmadi/aemmadi) |
| Fancy Fonts | Small typographic sign-off; core text stays readable | [Robert Shaw](https://github.com/xiaoluoboding/xiaoluoboding) |
| Icons | Technology icon strip with descriptive alt text | [Yuan Tang](https://github.com/terrytangyuan/terrytangyuan) |
| Retro | Terminal-style after-hours panel | [Livio Brunner](https://github.com/BrunnerLivio/BrunnerLivio) |

## Credits and sources

- [Awesome GitHub Profile README](https://github.com/abhisheknaiidu/awesome-github-profile-readme): category/reference discovery.
- [Shields.io](https://shields.io/): externally hosted badges.
- [Skill Icons](https://github.com/tandpfun/skill-icons): externally hosted technology icons.
- [Martin Heinz wave GIF](https://github.com/MartinHeinz/MartinHeinz/blob/master/wave.gif): externally linked waving-hand animation.
- [Ashutosh anime GIF](https://github.com/Xx-Ashutosh-xX/Xx-Ashutosh-xX/blob/master/assets/208593.gif): externally linked anime illustration. These two GIFs remain hosted by their respective profile owners and are not relicensed by this repository.
- [GitHub Events API](https://docs.github.com/en/rest/activity/events) and [Codeforces API](https://codeforces.com/apiHelp/methods): public data documentation.

## Local use

```sh
node --test tests/profile.test.mjs
node scripts/update-profile.mjs
```

Set `GITHUB_TOKEN` in the process environment only if authenticated GitHub API quota is needed. The token is sent exclusively to `api.github.com`, never to coding platforms, and is not written to output files. The public profile links and email are explicitly supplied by the profile owner.
