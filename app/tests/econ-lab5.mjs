// Part 5: finance-mix optimization on top of R3 ops (peak harvest DEEP).
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
if (!existsSync('tests/.econ-engine.mjs')) execSync('npx esbuild src/engine/q3.ts --bundle --format=esm --outfile=tests/.econ-engine.mjs', { stdio: 'pipe' });
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon, QUARTERS } = E;
const mk = () => Array.from({ length: 4 }, () => defaultDecisions());
const SEAS = [2, 3, 0, 1];
const down = es => es.map(e => ({ ...e, growth: e.growth * 0.85, compPrices: e.compPrices.map(r => r.map(v => Math.round(v * 0.95))) }));
const ops = ds => {
  const DELIV = [1.07, 1.07, 1.03, 1.05];
  for (let i = 0; i < 4; i++) ds[i].deliveries = ds[i].deliveries.map(r => r.map(v => Math.round(v * DELIV[i])));
  ds[0].prices = ds[0].prices.map(r => r.map((v, p) => p === 2 ? Math.min(999, Math.round(v * 1.08)) : v));
  ds[1].prices = ds[1].prices.map(r => r.map((v, p) => Math.min(999, Math.round(v * (p === 2 ? 1.28 : p === 1 ? 1.25 : 1.15)))));
  for (let i = 0; i < 4; i++) ds[i].maintenance = 25;
};
const F = {};
F['F0 ops only'] = ds => { ops(ds); };
F['F1 + div Q4'] = ds => { ops(ds); ds[1].dividend = 40; };
F['F2 + div Q4+Q1'] = ds => { ops(ds); ds[1].dividend = 40; ds[2].dividend = 40; };
F['F3 + issue Q4'] = ds => { ops(ds); ds[1].shares = 400; };
F['F4 + issue Q4, div Q4+Q1'] = ds => { ops(ds); ds[1].shares = 400; ds[1].dividend = 40; ds[2].dividend = 40; };
F['F5 + issue Q4, div Q4'] = ds => { ops(ds); ds[1].shares = 400; ds[1].dividend = 40; };
F['F6 + issue Q4, div Q4+Q1, deep Q2 div 90%'] = ds => { ops(ds); ds[1].shares = 400; ds[1].dividend = 40; ds[2].dividend = 40; ds[3].dividend = 90; };
F['F7 + issue Q4+Q1 (2×400k if cap allows), div Q4+Q1'] = ds => { ops(ds); ds[1].shares = 400; ds[2].shares = 400; ds[1].dividend = 40; ds[2].dividend = 40; };

for (const [n, f] of Object.entries(F)) {
  const ds = mk(); f(ds);
  const b = runSimulation(ds);
  const d = runSimulation(ds, down(SEAS.map(q => defaultEcon(q))));
  const last = b.reports[3], dlast = d.reports[3];
  const divs = b.reports.reduce((a, r) => a + r.dividendPaid, 0);
  const minCash = Math.min(...b.reports.map(r => r.cashEnd - r.overdraftEnd + r.details.balance.deposit));
  const dminCash = Math.min(...d.reports.map(r => r.cashEnd - r.overdraftEnd + r.details.balance.deposit));
  const np = b.reports.reduce((a, r) => a + r.netProfit, 0);
  console.log(`${n}\n   IP end ${Math.round(last.investmentPerformance).toLocaleString()} | net ${Math.round(np).toLocaleString()} | divs ${Math.round(divs).toLocaleString()} | minCash ${Math.round(minCash).toLocaleString()} || DOWN: IP ${Math.round(dlast.investmentPerformance).toLocaleString()} minCash ${Math.round(dminCash).toLocaleString()}`);
}
