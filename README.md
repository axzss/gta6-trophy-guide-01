[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/axzss/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/axzss/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum — GTA VI Trophy Guide & Tracker

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of
Grand Theft Auto VI (1 Platinum, 2 Gold, 6 Silver, 46 Bronze): every trophy with
its official name, description and grade as PlayStation publishes them, a guide
in our own words with its sources cited beside it, a roadmap to the Platinum,
the one possibly-missable trophy flagged, and a checklist whose progress is
saved in the browser with export and import.

- **Checklist & guides** — searchable, filterable by grade, kind, missable and
  earned/unearned. Click any trophy to open its full guide: steps, a tip, and
  the sources each fact comes from (Exophase and PSNProfiles for the official
  list and counts; PowerPyx for the methods, roadmap and the missable warning).
- **Roadmap to the Platinum** — three phases (story 60–80 h, 100% checklist
  ~100 h, Strangers & cleanup ~10 h) plus the 100% checklist in numbers.
  About 200 hours total, one playthrough, no online trophies.
- **Missables** — only one trophy is at risk: Positive Mental Attitude, whose
  Chapter 1 balcony meditation disappears after Chapter 1. Every other trophy
  is listed with its verdict and why it is safe.
- **Tracker & tools** — progress ring and per-grade / per-kind bars, export and
  import of progress as JSON, a “Next up” list in roadmap order, and a spoiler
  setting that hides story trophies until they are earned.
- **Honest where the game is new** — GTA VI released 19 November 2026. Four
  trophies had no confirmed unlock method at launch (In The Beginning…,
  Bad Luck I Guess, The Truth Is Out There, Ten Pin); their guides say so
  plainly and label the unconfirmed leads instead of inventing a method.

No Rockstar logo, artwork, box art or game screenshots are used — the dark
neon look is original. The app works fully offline: static files only, no
network requests at runtime.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve `app/` with any static file server (for example
`python3 -m http.server` inside `app/`). Open `app/index.html` in desktop
Chrome. No build step, no dependencies.

Hand the entry in (Node 22):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Play with make.fun

[Join make.fun](https://make.fun/?ref=1409h78a&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) — build agents and programs, enter competitions, and get scored and paid in the open.

## License

MIT — see [LICENSE](LICENSE).
