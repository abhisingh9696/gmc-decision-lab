// Reconstruct the six reappraisal-site presets: solve deliveries to match published forecast numbers.
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
if (!existsSync('tests/.econ-engine.mjs')) execSync('npx esbuild src/engine/q3-test-shim.ts --bundle --format=esm --outfile=tests/.econ-engine.mjs', { stdio: 'pipe' });
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon, SEASON_IDX } = E;
const eur = n => Math.round(n).toLocaleString('en-IE');

const base = () => {
  const d = defaultDecisions();
  Object.assign(d, { matSpot: 3, matM3: 1, matM6: 0, rd: [15, 15, 25], hire: 0, train: 0, trainingDays: 5, mgmtBudget: 70, maintenance: 20, shift: 2, wage: 1200, ports: 5, webDev: 15, takeImprovement: [false, false, false], dividend: 0, shares: 0, termLoan: 0, termDeposit: 0, machinesBuy: 0, machinesSell: 0, factoryExt: 0, insurance: 1 });
  return d;
};
const q3Econ = () => { const es = SEASON_IDX.map(i => defaultEcon(i)); return es[0]; };
const run1 = d => {
  const ds = Array.from({ length: 4 }, defaultDecisions); ds[0] = structuredClone(d);
  const es = SEASON_IDX.map(i => defaultEcon(i));
  return runSimulation(ds, es).reports[0];
};
const stress1 = d => {
  const ds = Array.from({ length: 4 }, defaultDecisions); ds[0] = structuredClone(d);
  const es = SEASON_IDX.map(i => defaultEcon(i));
  es[0].growth *= .85; es[0].compPrices = es[0].compPrices.map(r => r.map(v => v * .95));
  return runSimulation(ds, es).reports[0];
};
const metrics = r => {
  const bank = r.cashEnd - r.overdraftEnd + r.details.balance.deposit;
  const unful = r.orders.flat().reduce((a, v, i) => a + Math.max(0, v - r.sales.flat()[i]), 0);
  const unful2 = r.orders.flat().reduce((a, v, i) => a + Math.max(0, v - r.sales.flat()[i]), 0);
  const unfilled = r.orders.map((row, m) => row.reduce((a, v, p) => a + Math.max(0, v - r.sales[m][p]), 0));
  const totUnfilled = unfilled.flat().reduce((a, b) => a + b, 0);
  const backlog = r.backlogEnd.flat().reduce((a, b) => a + b, 0);
  return { rev: r.revenue, net: r.netProfit, bank, fg: r.details.balance.inventories, unfilled: totUnfilled, backlog, sold: r.sales.flat().reduce((a, b) => a + b, 0), ord: r.orders.flat().reduce((a, b) => a + b, 0) };
};
const show = (tag, m) => console.log(`${tag}: rev ${eur(m.rev)} net ${eur(m.net)} bank ${eur(m.bank)} FG ${eur(m.fg)} unfilled ${m.unfilled} backlog ${m.backlog} (ord/sold ${m.ord}/${m.sold})`);

// targets from the user's paste
const T = {
  S1: { rev: 1283160, net: 137841, bank: 1164994, fg: 21664, unfilled: 471, backlog: 237 },
  S4: { rev: 1573850, net: 200311, bank: 1106168, fg: 3424, unfilled: 0, backlog: 0 },
  S5: { rev: 1261970, net: 93297, bank: 1155642, fg: 14534, unfilled: 626, backlog: 315 },
  S8: { rev: 1503105, net: 172299, bank: 1094408, fg: 10837, unfilled: 181, backlog: 89 },
};
const score = (m, t) => Math.abs(m.rev - t.rev) / 1e4 + Math.abs(m.net - t.net) / 1e3 + Math.abs(m.unfilled - t.unfilled) / 10 + Math.abs(m.backlog - t.backlog) / 10 + Math.abs(m.bank - t.bank) / 1e4 + Math.abs(m.fg - t.fg) / 1e3;

// S4: demand-matched deliveries (buffer search) at prices [335/490/700 | 345/490/725 | 395/590/850]
console.log('--- S4 solver (demand-matched buffer search) ---');
const P4 = [[335, 490, 700], [345, 490, 725], [395, 590, 850]];
let best4 = null;
for (let b4 = 90; b4 <= 130; b4 += 1) {
  const d = base(); d.prices = P4;
  const probe = run1(d); // orders at these prices with default deliveries
  d.deliveries = probe.orders.map((row, m) => row.map((v, p) => {
    // stock from opening; approximation via probe: production needed = orders + backlog - stock; stock unknown here -> use buffer factor
    return Math.max(0, Math.ceil(v * (b4 / 100)));
  }));
  const m = metrics(run1(d)); const sc = score(m, T.S4);
  if (!best4 || sc < best4.sc) best4 = { sc, b4, d: structuredClone(d), m };
}
console.log(`best buffer ${best4.b4}%`); show('S4 best', best4.m); show('S4 target', T.S4);

// S1: quality-candidate delivery pattern, per-market multipliers, assembly 125/180/345
console.log('--- S1 solver ---');
const PAT1 = [[605, 435, 230], [45, 65, 15], [275, 185, 145]];
let best1 = null;
for (let eu = 100; eu <= 220; eu += 10) for (let na = 60; na <= 160; na += 10) for (let ne = 80; ne <= 200; ne += 10) {
  const d = base(); d.prices = [[360, 530, 730], [370, 530, 755], [430, 640, 900]]; d.assemblyTimes = [125, 180, 345];
  d.deliveries = PAT1.map((row, m) => row.map(v => Math.max(0, Math.round(v * (m === 0 ? eu : m === 1 ? na : ne) / 100))));
  const m = metrics(run1(d)); const sc = score(m, T.S1);
  if (!best1 || sc < best1.sc) best1 = { sc, eu, na, ne, d: structuredClone(d), m };
}
console.log(`best mult EU ${best1.eu}% NA ${best1.na}% NET ${best1.ne}%`); show('S1 best', best1.m); show('S1 target', T.S1);

// S5: prices 350/510/710, assembly 125/180/345, premium 10 all, deliveries search
console.log('--- S5 solver ---');
let best5 = null;
const PATS5 = [[605, 435, 230], [45, 65, 15], [275, 185, 145]];
for (let eu = 90; eu <= 200; eu += 10) for (let na = 50; na <= 160; na += 10) for (let ne = 60; ne <= 180; ne += 10) {
  const d = base(); d.prices = [[350, 510, 710], [360, 510, 735], [415, 620, 870]]; d.assemblyTimes = [125, 180, 345]; d.premium = [10, 10, 10];
  d.deliveries = PATS5.map((row, m) => row.map(v => Math.max(0, Math.round(v * (m === 0 ? eu : m === 1 ? na : ne) / 100))));
  const m = metrics(run1(d)); const sc = score(m, T.S5);
  if (!best5 || sc < best5.sc) best5 = { sc, eu, na, ne, d: structuredClone(d), m };
}
console.log(`best mult EU ${best5.eu}% NA ${best5.na}% NET ${best5.ne}%`); show('S5 best', best5.m); show('S5 target', T.S5);

// S8: peer EU/NAFTA prices, higher NET prices, restrained NET deliveries
console.log('--- S8 solver ---');
let best8 = null;
for (let eu = 90; eu <= 160; eu += 5) for (let na = 60; na <= 160; na += 10) for (let ne = 10; ne <= 120; ne += 5) {
  const d = base(); d.prices = [[325, 490, 700], [335, 490, 725], [415, 620, 880]];
  d.deliveries = [[1000, 625, 325], [150, 150, 75], [250, 150, 100]].map((row, m) => row.map(v => Math.max(0, Math.round(v * (m === 0 ? eu : m === 1 ? na : ne) / 100))));
  const m = metrics(run1(d)); const sc = score(m, T.S8);
  if (!best8 || sc < best8.sc) best8 = { sc, eu, na, ne, d: structuredClone(d), m };
}
console.log(`best mult EU ${best8.eu}% NA ${best8.na}% NET ${best8.ne}%`); show('S8 best', best8.m); show('S8 target', T.S8);

import { writeFileSync } from 'node:fs';
writeFileSync('tests/.recovered-presets.json', JSON.stringify({ S1: best1.d, S4: best4.d, S5: best5.d, S8: best8.d, m1: best1.m, m4: best4.m, m5: best5.m, m8: best8.m }, null, 1));
console.log('saved tests/.recovered-presets.json');
