# Kissing Assets GMC Decision Lab

Private planning copy for Group 13 / Company 2. It never connects to or submits decisions to the official GMC portal.

## Reproduce

- `npm ci` (the lockfile uses the official npm registry)
- `python scripts/extract-history.py` (requires xlrd; reads the five original XLS files in public/audit)
- `node_modules/.bin/esbuild src/engine/index.ts --bundle --format=esm --outfile=tests/engine-bundle.mjs`
- `node_modules/.bin/esbuild src/engine/strategies.ts --bundle --format=esm --outfile=tests/strategies-bundle.mjs`
- `node tests/engine-tests.mjs`
- `node tests/wiring-audit.mjs`
- `node tests/source-and-integrity.mjs`
- `node tests/all-controls.mjs`
- `node tests/table-register.mjs`
- `node scripts/audit-strategies.mjs`
- `node scripts/package-audit.mjs`
- `npm run build`

## Q2 Actual / Q3 Forecast

The root route shows locked official Q2 results. `/q3` opens the four-quarter forecast planner (2016 Q3–2017 Q2) with three complete Q3 presets. The planner remains mounted during Q2/Q3 navigation, so unsaved edits survive switching views. Q2 figures are static official values and are never recalculated.

## Verification

- `npm run lint`
- `npm run test:engine` rebuilds `dist-audit-engine.mjs` and runs the Q2-opening, machine timing, improvement timing, verified-rule and Q3 strategy tests.
- With the dev server running on port 3001, `npm run test:e2e` checks locked Q2 totals, persistent Q3 edits, strategy isolation and browser console errors in headless Chrome.
- For a production preview on port 4173, run `BASE_URL=http://127.0.0.1:4173 npm run test:e2e`.

Open Source & Audit in the app for source mappings, 75 inputs, scenario comparisons and known limitations. The frozen uploaded engine is tests/fixtures/original-engine.mjs. Never overwrite frozen results to conceal drift. Updated correct outputs belong in separate files. Re-run strategy generation after engine changes; review differences before replacing candidate presets.

## Evidence boundaries

All 10,380 populated source cells are preserved. Runtime/history mappings are explicit, not a claim that all cells independently drive forecasts. Exact demand and share-price functions are undisclosed. Finished-goods and futures valuation, weekly payroll parity, random events, channel contracts, peak website congestion and portions of space enforcement remain approximate. See public/audit/GMC-Audit-Report.html and table-register.json.

The search ranks a bounded grid of 180 plans under 8 common scenarios, subject to bank cash and capacity constraints. Results are conditional model outputs, not an official competition optimum. Replace forecast opening balances with the official Q2 report before deciding Q3.
