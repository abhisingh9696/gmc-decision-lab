// A/B: identical strategy run through two bundles — q3.ts (part5) vs q3-test-shim.ts (part7).
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
execSync('npx esbuild src/engine/q3.ts --bundle --format=esm --outfile=tests/.ab-direct.mjs', { stdio: 'pipe' });
execSync('npx esbuild src/engine/q3-test-shim.ts --bundle --format=esm --outfile=tests/.ab-shim.mjs', { stdio: 'pipe' });
const D = await import(pathToFileURL('tests/.ab-direct.mjs').href);
const S = await import(pathToFileURL('tests/.ab-shim.mjs').href);

const build = () => {
  const ds = Array.from({ length: 4 }, () => D.defaultDecisions());
  const DELIV = [1.07, 1.07, 1.03, 1.05];
  for (let i = 0; i < 4; i++) ds[i].deliveries = ds[i].deliveries.map(r => r.map(v => Math.round(v * DELIV[i])));
  ds[0].prices = ds[0].prices.map(r => r.map((v, p) => p === 2 ? Math.min(999, Math.round(v * 1.08)) : v));
  ds[1].prices = ds[1].prices.map(r => r.map((v, p) => Math.min(999, Math.round(v * (p === 2 ? 1.28 : p === 1 ? 1.25 : 1.15)))));
  for (let i = 0; i < 4; i++) ds[i].maintenance = 25;
  ds[1].shares = 400; ds[1].dividend = 40; ds[2].dividend = 40; ds[3].dividend = 90;
  return ds;
};
const show = (tag, sim) => {
  const np = sim.reports.reduce((a, r) => a + r.netProfit, 0);
  const rev = sim.reports.reduce((a, r) => a + r.revenue, 0);
  console.log(`${tag}: rev ${Math.round(rev)} | net ${Math.round(np)} | IP ${Math.round(sim.reports[3].investmentPerformance)} | Q3rev ${Math.round(sim.reports[0].revenue)} | Q3orders ${JSON.stringify(sim.reports[0].orders)}`);
};
const ds1 = build(); show('DIRECT ', D.runSimulation(ds1));
const ds2 = build(); show('SHIM   ', S.runSimulation(ds2));
// also: default econ objects identity check
const e1 = D.defaultEcon(2), e2 = S.defaultEcon(2);
console.log('defaultEcon(2) direct:', JSON.stringify(e1));
console.log('defaultEcon(2) shim  :', JSON.stringify(e2));
