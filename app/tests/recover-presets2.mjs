// Round 2: exact S4 (stock-aware demand matching) + S8 (finer grid), bank excl. deposit.
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
if (!existsSync('tests/.econ-engine.mjs')) execSync('npx esbuild src/engine/q3-test-shim.ts --bundle --format=esm --outfile=tests/.econ-engine.mjs', { stdio: 'pipe' });
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon, SEASON_IDX } = E;
const eur = n => Math.round(n).toLocaleString('en-IE');
const base = () => { const d = defaultDecisions(); Object.assign(d, { matSpot: 3, matM3: 1, matM6: 0, rd: [15, 15, 25], hire: 0, train: 0, trainingDays: 5, mgmtBudget: 70, maintenance: 20, shift: 2, wage: 1200, ports: 5, webDev: 15, takeImprovement: [false, false, false], dividend: 0, shares: 0, termLoan: 0, termDeposit: 0, machinesBuy: 0, machinesSell: 0, factoryExt: 0, insurance: 1 }); return d; };
const run1 = d => { const ds = Array.from({ length: 4 }, defaultDecisions); ds[0] = structuredClone(d); return runSimulation(ds, SEASON_IDX.map(i => defaultEcon(i))).reports[0]; };
const metrics = r => {
  const unfilled = r.orders.map((row, m) => row.reduce((a, v, p) => a + Math.max(0, v - r.sales[m][p]), 0));
  return { rev: r.revenue, net: r.netProfit, bank: r.cashEnd - r.overdraftEnd - r.details.balance.deposit, fg: r.details.balance.inventories, unfilled: unfilled.flat().reduce((a, b) => a + b, 0), backlog: r.backlogEnd.flat().reduce((a, b) => a + b, 0), scaled: r.productionScaled };
};
const show = (tag, m) => console.log(`${tag}: rev ${eur(m.rev)} net ${eur(m.net)} bank ${eur(m.bank)} FG ${eur(m.fg)} unfilled ${m.unfilled} backlog ${m.backlog}${m.scaled ? ' SCALED' : ''}`);

console.log('--- S4 stock-aware demand matching ---');
const P4 = [[335, 490, 700], [345, 490, 725], [395, 590, 850]];
// probe orders at S4 prices (deliveries don't affect orders)
const probe = base(); probe.prices = P4;
const pr = run1(probe);
console.log('orders at S4 prices:', JSON.stringify(pr.orders));
const STOCK = [[198, 132, 112], [50, 39, 33], [0, 0, 0]];
for (const spot of [3, 4, 5]) {
  const d = base(); d.prices = P4; d.matSpot = spot;
  d.deliveries = pr.orders.map((row, m) => row.map((v, p) => Math.max(0, v + 0 - STOCK[m][p])));
  show(`S4 spot${spot}`, metrics(run1(d)));
}
// also with small safety buffer +2%
for (const buf of [1.0, 1.02, 1.05]) {
  const d = base(); d.prices = P4; d.matSpot = 4;
  d.deliveries = pr.orders.map((row, m) => row.map((v, p) => Math.max(0, Math.ceil((v - STOCK[m][p]) * buf))));
  show(`S4 buf${buf}`, metrics(run1(d)));
}

console.log('--- S8 finer grid ---');
const T8 = { rev: 1503105, net: 172299, bank: 1094408, fg: 10837, unfilled: 181, backlog: 89 };
const score = (m, t) => Math.abs(m.rev - t.rev) / 1e4 + Math.abs(m.net - t.net) / 1e3 + Math.abs(m.unfilled - t.unfilled) / 5 + Math.abs(m.backlog - t.backlog) / 5 + Math.abs(m.bank - t.bank) / 1e4 + Math.abs(m.fg - t.fg) / 1e3;
let best8 = null;
for (let eu = 95; eu <= 115; eu += 5) for (let na = 55; na <= 90; na += 5) for (let ne = 70; ne <= 110; ne += 5) for (const spot of [3, 4]) {
  const d = base(); d.prices = [[325, 490, 700], [335, 490, 725], [415, 620, 880]]; d.matSpot = spot;
  d.deliveries = [[1000, 625, 325], [150, 150, 75], [250, 150, 100]].map((row, m) => row.map(v => Math.max(0, Math.round(v * (m === 0 ? eu : m === 1 ? na : ne) / 100))));
  const m = metrics(run1(d)); const sc = score(m, T8);
  if (!best8 || sc < best8.sc) best8 = { sc, eu, na, ne, spot, d: structuredClone(d), m };
}
console.log(`best EU ${best8.eu}% NA ${best8.na}% NET ${best8.ne}% spot ${best8.spot} (score ${best8.sc.toFixed(2)})`);
show('S8 best', best8.m); show('S8 target', T8);
import { writeFileSync } from 'node:fs';
const prev = JSON.parse(require('node:fs').readFileSync('tests/.recovered-presets.json', 'utf8'));
writeFileSync('tests/.recovered-presets.json', JSON.stringify({ ...prev, S4: best4save(best8, prev) }, null, 1));
function best4save() { return null; }
console.log('done');
