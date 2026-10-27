// Economics lab — part 6: scenario-robust strategy design.
// 36 demand cases (elasticity LOW/MID/HIGH × market −10/base/+10 × rivals flat/−5% × internet normal/cyber−30%)
// × 6 strategies. Ranking: mean & max regret on net profit + worst-case cash (incl. 15-day collections stress).
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
if (!existsSync('tests/.econ-engine.mjs')) execSync('npx esbuild src/engine/q3.ts --bundle --format=esm --outfile=tests/.econ-engine.mjs', { stdio: 'pipe' });
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon } = E;
const P = E.P;
const mk = () => Array.from({ length: 4 }, () => defaultDecisions());
const SEAS = [2, 3, 0, 1];
const eur = n => '€' + Math.round(n).toLocaleString('en-IE');

// pristine P
const PRISTINE_ELAS = [...P.priceElasticity];
const PRISTINE_BASE = JSON.parse(JSON.stringify(P.baseDemand));

const ELAS = { LOW: [-1, -1, -1], MID: [-2.1, -1.8, -1.3], HIGH: [-3.4, -3, -2.5] };
const cases = [];
for (const eK of Object.keys(ELAS)) for (const mK of [0.9, 1, 1.1]) for (const rK of [1, 0.95]) for (const iK of [1, 0.7]) {
  cases.push({ eK, m: mK, r: rK, i: iK, key: `${eK}/m${mK}/r${rK}/i${iK}` });
}

function withCase(c, fn) {
  // set P for the case, run, restore
  P.priceElasticity = [...ELAS[c.eK]];
  P.baseDemand = PRISTINE_BASE.map(row => row.map(v => v * c.m));
  // internet/cyber factor on NET row
  P.baseDemand[2] = P.baseDemand[2].map(v => v * c.i);
  try { return fn(); } finally { P.priceElasticity = [...PRISTINE_ELAS]; P.baseDemand = JSON.parse(JSON.stringify(PRISTINE_BASE)); }
}
const econ = (c) => SEAS.map(q => { const e = defaultEcon(q); if (c.r !== 1) e.compPrices = e.compPrices.map(r => r.map(v => Math.round(v * c.r))); return e; });

// ---------- strategies ----------
const FIN = ds => { ds[1].shares = 400; ds[1].dividend = 40; ds[2].dividend = 40; ds[3].dividend = 90; };
const MAINT = ds => { for (const d of ds) d.maintenance = 25; };
const DELIV = (ds, f = [1.07, 1.07, 1.03, 1.05]) => { for (let i = 0; i < 4; i++) ds[i].deliveries = ds[i].deliveries.map(r => r.map(v => Math.round(v * f[i]))); };
const setP = (ds, qi, m, p, v) => { ds[qi].prices[m][p] = v; };

const STRATS = {
  // A. Parity recovery — all prices = rival level, capacity-max supply, finance layer
  'W1 Parity recovery + finance': ds => {
    for (const qi of [0, 1, 2, 3]) ds[qi].prices = [[325, 490, 700], [335, 490, 725], [375, 590, 850]];
    DELIV(ds); MAINT(ds); FIN(ds);
  },
  // B. Elasticity-weighted: discount P1 (ε−2.1) below parity, hold P3 premium (ε−1.3)
  'W2 Elastic-hedge mix + finance': ds => {
    for (const qi of [0, 1, 2, 3]) ds[qi].prices = [[309, 490, 756], [319, 490, 783], [357, 590, 918]];
    DELIV(ds); MAINT(ds); FIN(ds);
  },
  // C. Peak harvest DEEP + persistent P3 premium (Q3/Q4 peak, P3 +8% all quarters)
  'W3 Peak harvest deep + finance': ds => {
    for (const qi of [0, 2, 3]) ds[qi].prices = [[325, 490, 756], [335, 490, 783], [375, 590, 918]];
    ds[1].prices = [[374, 613, 896], [385, 613, 928], [431, 738, 999]];
    DELIV(ds); MAINT(ds); FIN(ds);
  },
  // D. Peak harvest SOFT (Q4 +15/12/8%) + persistent P3
  'W4 Peak harvest soft + finance': ds => {
    for (const qi of [0, 2, 3]) ds[qi].prices = [[325, 490, 730], [335, 490, 755], [375, 590, 880]];
    ds[1].prices = [[374, 549, 742], [385, 549, 769], [431, 661, 901]];
    DELIV(ds); MAINT(ds); FIN(ds);
  },
  // E. Moderate premium (reappraisal candidate prices), capacity-max supply, finance layer
  'W5 Moderate premium + finance': ds => {
    for (const qi of [0, 1, 2, 3]) ds[qi].prices = [[360, 530, 730], [370, 530, 755], [430, 640, 900]];
    DELIV(ds); MAINT(ds); FIN(ds);
  },
  // F. W1 without finance layer (isolate finance contribution)
  'W6 Parity recovery, no finance': ds => {
    for (const qi of [0, 1, 2, 3]) ds[qi].prices = [[325, 490, 700], [335, 490, 725], [375, 590, 850]];
    DELIV(ds); MAINT(ds);
  },
  // G. W5 premium + Q4 peak bump (+15/12/10)
  'W7 Premium + Q4 bump + finance': ds => {
    for (const qi of [0, 2, 3]) ds[qi].prices = [[360, 530, 730], [370, 530, 755], [430, 640, 900]];
    ds[1].prices = [[414, 594, 803], [426, 594, 831], [495, 717, 990]];
    DELIV(ds); MAINT(ds); FIN(ds);
  },
};

const runStrat = (name, fn, c) => withCase(c, () => {
  const ds = mk(); fn(ds);
  const sim = runSimulation(ds, econ(c));
  let rev = 0, np = 0, minCash = Infinity;
  for (const r of sim.reports) {
    rev += r.revenue; np += r.netProfit;
    minCash = Math.min(minCash, r.cashEnd - r.overdraftEnd + r.details.balance.deposit);
  }
  // collections stress: 15 extra days of traditional (EU+NAFTA) receipts withheld ≈ rev/6 per quarter, cumulative
  let hold = 0;
  for (const r of sim.reports) { hold += (r.revenue * 0.72) / 6; minCash -= hold > 0 ? (r.revenue * 0.72) / 6 : 0; } // traditional share ~72% of revenue
  return { rev, np, minCashAdj: minCash, ip: sim.reports[3].investmentPerformance };
});

// base case for reference = MID/m1/r1/i1
const BASE = cases.find(c => c.eK === 'MID' && c.m === 1 && c.r === 1 && c.i === 1);
const out = {};
for (const [name, fn] of Object.entries(STRATS)) {
  const perCase = {};
  for (const c of cases) perCase[c.key] = runStrat(name, fn, c);
  out[name] = perCase;
}

// regret analysis on net profit
const best = {};
for (const c of cases) best[c.key] = Math.max(...Object.values(out).map(o => o[c.key].np));
console.log('=== ROBUST RANKING (36 scenarios) ===');
const rank = Object.entries(out).map(([name, o]) => {
  const npAll = cases.map(c => o[c.key].np);
  const regret = cases.map(c => best[c.key] - o[c.key].np);
  const b = out[name][BASE.key];
  const worst = npAll.reduce((a, v, i) => v < npAll[a] ? i : a, 0);
  const minCashWorst = Math.min(...cases.map(c => o[c.key].minCashAdj));
  const posCases = npAll.filter(v => v > 0).length;
  return { name, base: b, meanRegret: regret.reduce((a, v) => a + v, 0) / regret.length, maxRegret: Math.max(...regret), worstNP: npAll[worst], worstCase: cases[worst].key, minCashWorst, posCases };
}).sort((a, b) => a.meanRegret - b.meanRegret);
for (const r of rank) {
  console.log(`\n${r.name}`);
  console.log(`  BASE      : rev ${eur(r.base.rev)} | net ${eur(r.base.np)} | IP ${eur(r.base.ip)} | minCash ${eur(r.base.minCashAdj)} (stress-adj)`);
  console.log(`  WORST     : net ${eur(r.worstNP)} (${r.worstCase}) | minCash ${eur(r.minCashWorst)} | profitable in ${r.posCases}/36`);
  console.log(`  REGRET    : mean ${eur(r.meanRegret)} | max ${eur(r.maxRegret)}`);
}
// per-elasticity breakdown for top 3
console.log('\n=== NET PROFIT BY ELASTICITY FAMILY (market 1.0, rival 1, internet 1) ===');
for (const eK of Object.keys(ELAS)) {
  const c = cases.find(x => x.eK === eK && x.m === 1 && x.r === 1 && x.i === 1);
  console.log(eK + ': ' + Object.entries(out).map(([n, o]) => `${n.split(' ')[0]} ${eur(o[c.key].np)}`).join(' | '));
}
console.log('\n=== CYBER SENSITIVITY (MID elasticity, market 1, rival 1, i0.7 vs i1) ===');
{
  const c1 = cases.find(x => x.eK === 'MID' && x.m === 1 && x.r === 1 && x.i === 1);
  const c2 = cases.find(x => x.eK === 'MID' && x.m === 1 && x.r === 1 && x.i === 0.7);
  for (const [n, o] of Object.entries(out)) console.log(`${n.split(' ')[0]}: ${eur(o[c1.key].np)} → ${eur(o[c2.key].np)} (${((o[c2.key].np / o[c1.key].np - 1) * 100).toFixed(0)}%)`);
}
