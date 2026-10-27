// Part 4: exact decision recipe for R7 (recommended) and R8 (risk-averse variant).
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
if (!existsSync('tests/.econ-engine.mjs')) execSync('npx esbuild src/engine/q3.ts --bundle --format=esm --outfile=tests/.econ-engine.mjs', { stdio: 'pipe' });
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon, QUARTERS } = E;
const mk = () => Array.from({ length: 4 }, () => defaultDecisions());
const SEAS = [2, 3, 0, 1];

const build = () => {
  const ds = Array.from({ length: 4 }, () => defaultDecisions());
  const DELIV = [1.07, 1.07, 1.03, 1.05];
  for (let i = 0; i < 4; i++) ds[i].deliveries = ds[i].deliveries.map(r => r.map(v => Math.round(v * DELIV[i])));
  ds[0].prices = ds[0].prices.map(r => r.map((v, p) => p === 2 ? Math.min(999, Math.round(v * 1.08)) : v));
  ds[1].prices = ds[1].prices.map(r => r.map((v, p) => Math.min(999, Math.round(v * (p === 2 ? 1.28 : p === 1 ? 1.25 : 1.15)))));
  for (let i = 0; i < 4; i++) ds[i].maintenance = 25;
  ds[1].shares = 400; ds[1].dividend = 40; ds[2].dividend = 40; ds[3].dividend = 40;
  return ds;
};
const ds = build();
for (let i = 0; i < 4; i++) {
  const d = ds[i], base = defaultDecisions();
  const diff = [];
  const cmp = (label, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) diff.push(`${label}: ${JSON.stringify(b)}→${JSON.stringify(a)}`); };
  cmp('prices', d.prices, base.prices); cmp('deliveries', d.deliveries, base.deliveries);
  cmp('maintenance', d.maintenance, base.maintenance); cmp('shares', d.shares, base.shares); cmp('dividend', d.dividend, base.dividend);
  console.log(`\n--- ${QUARTERS[i]} ---\n` + diff.join('\n'));
}
const sim = runSimulation(ds);
console.log('\n=== R7 RESULTS ===');
for (const r of sim.reports) {
  const cash = r.cashEnd - r.overdraftEnd + r.details.balance.deposit;
  console.log(`${r.quarterLabel}: rev ${Math.round(r.revenue)} | net ${Math.round(r.netProfit)} | cash ${Math.round(cash)} | SP ${r.sharePrice.toFixed(4)} | IP ${Math.round(r.investmentPerformance)} | div ${Math.round(r.dividendPaid)} | sold ${r.sales.flat().reduce((a, b) => a + b, 0)}`);
}
console.log('\nR7 decision JSON (4 quarters):');
console.log(JSON.stringify(ds));
