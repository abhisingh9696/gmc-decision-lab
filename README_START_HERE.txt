GMC Decision Lab — latest full package, 27 October 2026
Updated working copy: Q2/Q3 persistence, browser QA and deployment fixes, 27 October 2026

Contains the restored original dashboard, locked Q2 actual view, Q3-onward forecasts,
three complete Q3 strategy presets with comparisons, engine source, tests, build,
six official/history workbooks, manual references and prior audit evidence.

Run: install Node.js 22.12+; open terminal in app; npm ci; npm run dev.
Root route: locked official Q2 actuals. /q3: original full dashboard with editable
Q3–2017Q2 forecasts and Strategy1/2/3 buttons. npm run build; npm run preview.
Static hosting requires SPA fallback to index.html (vercel.json is included).

Validation: npm run lint; npm run test:engine. Browser QA: start dev on port 3001,
then npm run test:e2e. For production preview, set BASE_URL to its URL first.

IMPORTANT: forecasts remain experimental. Demand, valuation, payroll/accident/
insurance and cash collection are not fully validated. Audit material describes
older snapshots too; do not mistake old passing tests for current certification.
No official GMC decisions are submitted by this app.

Historical five-quarter scenarios cannot be loaded into the rebased four-quarter
forecast. New scenarios use a separate browser storage key.
node_modules, Git internals, deployment identity and credentials are excluded.
