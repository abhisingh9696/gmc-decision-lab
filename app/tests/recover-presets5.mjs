// Round 5: S4/S8 with term-deposit withdrawal — the missing bank piece.
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
if (!existsSync('tests/.econ-engine.mjs')) execSync('npx esbuild src/engine/q3-test-shim.ts --bundle --format=esm --outfile=tests/.econ-engine.mjs', { stdio: 'pipe' });
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon, SEASON_IDX } = E;
const eur = n => Math.round(n).toLocaleString('en-IE');
const base = () => { const d = defaultDecisions(); Object.assign(d, { matM3: 1, matM6: 0, rd: [15, 15, 25], hire: 0, train: 0, trainingDays: 5, mgmtBudget: 70, maintenance: 20, shift: 2, wage: 1200, ports: 5, webDev: 15, takeImprovement: [false, false, false], dividend: 0, shares: 0, termLoan: 0, termDeposit: 0, machinesBuy: 0, machinesSell: 0, factoryExt: 0, insurance: 1 }); return d; };
const run1 = d => { const ds = Array.from({ length: 4 }, defaultDecisions); ds[0] = structuredClone(d); return runSimulation(ds, SEASON_IDX.map(i => defaultEcon(i))).reports[0]; };
const metrics = r => ({ rev: r.revenue, net: r.netProfit, bank: r.cashEnd - r.overdraftEnd - r.details.balance.deposit, fg: r.details.balance.inventories, unfilled: r.orders.map((row, m) => row.reduce((a, v, p) => a + Math.max(0, v - r.sales[m][p]), 0)).flat().reduce((a, b) => a + b, 0), backlog: r.backlogEnd.flat().reduce((a, b) => a + b, 0) });
const show = (tag, m) => console.log(`${tag}: rev ${eur(m.rev)} net ${eur(m.net)} bank ${eur(m.bank)} FG ${eur(m.fg)} unfilled ${m.unfilled} backlog ${m.backlog}`);

console.log('--- S4 with deposit withdrawal ---');
const P4 = [[335, 490, 700], [345, 490, 725], [395, 590, 850]];
const STOCK = [[198, 132, 112], [50, 39, 33], [0, 0, 0]];
const ORD4 = [[1147, 715, 432], [184, 157, 86], [289, 196, 114]];
const T4 = { rev: 1573850, net: 200311, bank: 1106168, fg: 3424, unfilled: 0, backlog: 0 };
let best4 = null;
for (const spot of [1, 2, 3]) for (const m3 of [0, 1, 2]) {
  const d = base(); d.prices = P4; d.matSpot = spot; d.matM3 = m3; d.termDeposit = -1150;
  d.deliveries = ORD4.map((row, m) => row.map((v, p) => Math.max(0, v - STOCK[m][p])));
  const m = metrics(run1(d)); const sc = Math.abs(m.net - T4.net) / 1e3 + Math.abs(m.bank - T4.bank) / 1e4 + Math.abs(m.fg - T4.fg) / 1e3;
  if (!best4 || sc < best4.sc) best4 = { sc, spot, m3, d: structuredClone(d), m };
}
console.log(`best spot ${best4.spot} m3 ${best4.m3} score ${best4.sc.toFixed(2)}`);
show('S4 best', best4.m); show('S4 target', T4);

console.log('--- S8 with deposit withdrawal ---');
const T8 = { rev: 1503105, net: 172299, bank: 1094408, fg: 10837, unfilled: 181, backlog: 89 };
let best8 = null;
for (let na = 50; na <= 65; na += 5) for (const spot of [3, 4, 5]) for (const m3 of [0, 1]) {
  const d = base(); d.prices = [[325, 490, 700], [335, 490, 725], [415, 620, 880]]; d.matSpot = spot; d.matM3 = m3; d.termDeposit = -1150;
  d.deliveries = [[1000, 625, 325], [150, 150, 75], [250, 150, 100]].map((row, m) => row.map(v => Math.max(0, Math.round(v * (m === 0 ? 100 : m === 1 ? na : 100) / 100))));
  const m = metrics(run1(d)); const sc = Math.abs(m.rev - T8.rev) / 1e4 + Math.abs(m.net - T8.net) / 1e3 + Math.abs(m.unfilled - T8.unfilled) / 5 + Math.abs(m.backlog - T8.backlog) / 5 + Math.abs(m.bank - T8.bank) / 1e4 + Math.abs(m.fg - T8.fg) / 1e3;
  if (!best8 || sc < best8.sc) best8 = { sc, na, spot, m3, d: structuredClone(d), m };
}
console.log(`best NA ${best8.na} spot ${best8.spot} m3 ${best8.m3} score ${best8.sc.toFixed(2)}`);
show('S8 best', best8.m); show('S8 target', T8);

import { writeFileSync, readFileSync } from 'node:fs';
const prev = JSON.parse(readFileSync('tests/.recovered-presets.json', 'utf8'));
writeFileSync('tests/.recovered-presets.json', JSON.stringify({ ...prev, S4: best4.d, S8: best8.d, m4: best4.m, m8: best8.m }, null, 1));
console.log('saved');
