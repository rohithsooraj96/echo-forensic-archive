# ECHO // Forensic Data Archive

ECHO is a local-first forensic data archive for exploring time, repetition, scale, and structure across three unrelated prepared datasets. It is designed as a cinematic analytical instrument—not as a profile of one person and not as a causal model.

> **ANALYTICAL ALIGNMENT — NOT EVIDENCE OF A SHARED EVENT**

Every cross-dataset comparison is descriptive. Spotify timestamps are UTC; household timestamps retain their source semantics; India timestamps have no stated timezone. The interface never claims that one archive caused, generated, or belongs to another.

## Dataset architecture

The browser receives compact, prepared JSON artifacts under `public/data/`. The preparation script reads the original archives with Python’s standard library, aggregates the analytical fields needed by the interface, and omits sensitive India identity fields.

| Source | Prepared rows | Main views | Source treatment |
| --- | ---: | --- | --- |
| Spotify listening history | 149,860 | listening traces, sessions, artists, tracks, circadian activity | UTC hour and year aggregates |
| Household transactions | 2,461 | monthly volume, categories, recurring labels | source-local time semantics preserved |
| India transactions | 10,267 | hourly traces, geography labels, duplicate structure | exact full-row equality; 1,500 unique patterns and 8,767 duplicate extras |

The India browser artifacts do **not** expose `cc_num`, `first`, `last`, `gender`, `street`, `job`, `dob`, or `customer_id`. Dossier exports carry source metadata, metric definitions, filters, entropy, circadian summaries, and the redaction policy without restoring those fields.

### Prepared artifacts

`manifest.json`, `story_statistics.json`, hourly/yearly/monthly aggregates, artist/track/category indexes, session summaries, India duplicate groups, geography labels, and connection nodes are generated into `public/data/`. The loader resolves them from Vite’s `BASE_URL`, so the same application can be served from a subpath.

## Local setup

Requirements: Node.js 20+ and Python 3.11+.

```bash
npm install
npm run prepare:data
npm run dev
```

The development server uses `http://127.0.0.1:4173/` by default. The application is frontend-only and does not require an account, API key, database, or network analytics service.

### Validation and production build

```bash
npm run typecheck
npm run build
```

To verify a non-root deployment path, pass a Vite base during the build and serve the resulting `dist/` directory with a static server:

```bash
npm run build -- --base=/echo/
```

The build must retain `/echo/data/*.json` paths and load those artifacts through `import.meta.env.BASE_URL`.

## Archive experience

- **Landing and boot sequence** — begin with the prepared local index and see the archive initialize.
- **Archive worlds** — overview, listening, spending, and transaction structure views.
- **Global filters** — dataset, year, type, category, free-text, and duplicate-only filters.
- **Circadian matrix** — synchronized Spotify, household, and India rings with keyboard/focusable hour controls.
- **Entropy anomaly engine** — adjust the duplicate-collapse threshold and inspect exact repeated structures.
- **Connection flight** — use FIND CONNECTION or Space to fly to a real analytical node before opening the inspector.
- **Analytical Alignment Inspector** — side-by-side source evidence with explicit non-causal framing.
- **Dossier / Case File** — bookmark discoveries, remove entries, export JSON, or print evidence through the browser PDF flow.
- **Command palette** — fuzzy search commands, artists, tracks, sessions, categories, transaction types, and source-time labels.
- **Responsive analytical tabs** — dense side-by-side panels become accessible tabs below 768px while desktop retains the full grid.
- **Accessibility mirrors** — live DOM text mirrors key counts, late-night density, duplicate collapse, active filters, entropy, and selected hours for assistive technology and headless evaluation.

## Interactive hotkey quick reference

| Shortcut | Action |
| --- | --- |
| `1` | Open Listening World |
| `2` | Open Spending World |
| `3` | Open Transactions World |
| `Space` | Find a connection and start the camera flight |
| `Ctrl/Cmd + K` | Open Command Search |
| `Ctrl/Cmd + E` | Open the Dossier / Case File |
| `Escape` | Close open panels and overlays |
| `Enter` / `Space` on an hour | Select a circadian hour when focused |
| Arrow keys / Home / End in tabs | Move through responsive analytical tabs |

Shortcuts pause while typing into an input. Every keyboard action has an equivalent visible control.

## Technical specification compliance

| Requirement | Implementation |
| --- | --- |
| React + TypeScript | Vite React application with `strict: true` and typed data interfaces |
| Real data | Prepared artifacts generated from the supplied archives; no fabricated runtime records |
| Visualization | Semantic SVG for analytical graphics, decorative Canvas atmosphere, D3 scales/shapes, Framer Motion camera transitions |
| Responsive UI | Desktop grids, tablet breakpoints, mobile analytical tabs, ResizeObserver-driven visualization containers |
| Accessibility | Native controls, labels, roles, live mirrors, focusable SVG wedges, keyboard parity, reduced-motion CSS |
| Resilience | Retryable data-load errors, application boundary, independent visualization error boundaries |
| Performance | Prepared aggregates, memoized derived selectors, stable callbacks, bounded search results, no unnecessary worker or network work |
| Privacy | Redacted India fields, local-only data path, non-causal language, explicit alignment disclaimer |
| Audio | Web Audio initialized only after the landing gesture; muted by default with an explicit pressed-state toggle |
| Export | Deterministic schema shape containing filters, bookmarks, entropy, peaks, source metadata, definitions, and redaction policy |
| Deployment | `BASE_URL`-relative data loading and Vite base-path verification; Vercel publication requires a configured Git remote |

## Verification checklist

```bash
npm run prepare:data
npm run typecheck
npm run build
npm run build -- --base=/echo/
```

The browser smoke flow should cover landing, boot, all worlds, responsive tabs, fuzzy search, filters/reset, matrix selection, entropy, connection flight, inspector, case file, export/print, mute/help, and keyboard shortcuts. It should also confirm the live DOM mirrors and inspect the browser console for errors.

The repository must not stage `node_modules/`, `dist/`, `.vite/`, TypeScript build info, browser profiles, or sensitive source archives. A commit can be created after verification; pushing requires a real `origin` remote and explicit shipping authorization.

## License and data use

This interface is an educational and analytical presentation layer for locally supplied archives. Keep source archives and generated artifacts within the authorized project boundary, preserve the redaction policy, and do not reinterpret descriptive alignment as evidence of a shared person or event.
