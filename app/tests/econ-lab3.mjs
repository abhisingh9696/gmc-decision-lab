// Economics lab — part 3: refined integrated strategies after part-2 lessons.
// Lessons applied: Q3 issue illegal (SP 0.9833 < 1.000), expansion space-blocked
// (375 m² cap), futures must be right-sized, demand levers wasted while capacity-bound.
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
if (!existsSync('tests/.econ-engine.mjs')) execSync('npx esbuild src/engine/q3.ts --bundle --format=esm --outfile=tests/.econ-engine.mjs', { stdio: 'pipe' });
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon, QUARTERS } = E;
const mk = () => Array.from({ length: 4 }, () => defaultDecisions());
const eur = n => '€' + Math.round(n).toLocaleString('en-IE');
const SEAS = [2, 3, 0, 1];
const down = es => es.map(e => ({ ...e, growth: e.growth * 0.85, compPrices: e.compPrices.map(r => r.map(v => Math.round(v * 0.95))) }));

// Capacity-max deliveries: scale default mix so machining hours ≈ available (with reject allowance)
// Default: P1 1400, P2 925, P3 500 → 3,696h incl rejects. Scale ×1.07 ≈ 3,950h.
const DELIV = [1.07, 1.07, 1.03, 1.05]; // Q4 slightly under (peak prices cut demand), Q1 trough
const scaleDeliv = (ds, qi, f) => { ds[qi].deliveries = ds[qi].deliveries.map(r => r.map(v => Math.round(v * f))); };
const peakQ4 = (ds, p3, p2, p1) => { ds[1].prices = ds[1].prices.map((row, m) => row.map((v, p) => Math.min(999, Math.round(v * (p === 2 ? p3 : p === 1 ? p2 : p1))))); };

const S = {};
S['R1 Baseline'] = ds => {};
S['R2 Peak harvest (capacity-max + Q4 +18/18/10%)'] = ds => {
  for (let i = 0; i < 4; i++) scaleDeliv(ds, i, DELIV[i]);
  peakQ4(ds, 1.18, 1.18, 1.10);
  for (let i = 0; i < 4; i++) ds[i].maintenance = 25;
};
S['R3 Peak harvest DEEP (Q4 +28/25/15%)'] = ds => {
  for (let i = 0; i < 4; i++) scaleDeliv(ds, i, DELIV[i]);
  peakQ4(ds, 1.28, 1.25, 1.15);
  for (let i = 0; i < 4; i++) ds[i].maintenance = 25;
};
S['R4 R2 + futures 8k×3m (right-sized for Q4)'] = ds => {
  S['R2 Peak harvest (capacity-max + Q4 +18/18/10%)'](ds);
  ds[0].matSpot = 5; ds[0].matM3 = 8;
};
S['R5 R2 + extension 500sqm + 2 machines + staff Q4'] = ds => {
  S['R2 Peak harvest (capacity-max + Q4 +18/18/10%)'](ds);
  ds[0].factoryExt = 500; ds[0].machinesBuy = 2; ds[0].termLoan = 900;
  ds[1].hire = 20;              // arrive Q4, space then 750×0.75=562... assembly 23×10+mach 150
  ds[1].deliveries = ds[1].deliveries.map(r => r.map(v => Math.round(v * 1.35))); // more Q4 production
};
S['R6 R2 + IP endgame (Q4 issue 400k, dividends 40% Q4→Q2)'] = ds => {
  S['R2 Peak harvest (capacity-max + Q4 +18/18/10%)'](ds);
  ds[1].shares = 400; ds[1].dividend = 40; ds[2].dividend = 40; ds[3].dividend = 40;
};
S['R7 R6 + deeper Q4 prices (+28/25/15%)'] = ds => {
  for (let i = 0; i < 4; i++) scaleDeliv(ds, i, DELIV[i]);
  peakQ4(ds, 1.28, 1.25, 1.15);
  for (let i = 0; i < 4; i++) ds[i].maintenance = 25;
  ds[1].shares = 400; ds[1].dividend = 40; ds[2].dividend = 40; ds[3].dividend = 40;
};
S['R8 R6 + Q1 trough support (EU supp 15 only Q1-17, slack capacity)'] = ds => {
  S['R6 R2 + IP endgame (Q4 issue 400k, dividends 40% Q4→Q2)'](ds);
  ds[2].agentsEU.support = 15; ds[2].advProd = ds[2].advProd.map(r => r.map(v => Math.min(99, v * 2)));
};

const run1 = (name, fn) => {
  const ds = mk(); fn(ds);
  const es = SEAS.map(q => defaultEcon(q));
  const b = runSimulation(ds);
  const d = runSimulation(ds, down(SEAS.map(q => defaultEcon(q))));
  const agg = sim => {
    let rev = 0, np = 0, alerts = 0, minCash = Infinity, ip = 0, revQ = [];
    for (const r of sim.reports) {
      rev += r.revenue; np += r.netProfit; revQ.push(Math.round(r.revenue / 1000));
      alerts += r.warnings.filter(w => w.severity !== 'info').length;
      minCash = Math.min(minCash, r.cashEnd - r.overdraftEnd + r.details.balance.deposit);
    }
    return { rev, np, alerts, minCash, ip: sim.reports[3].investmentPerformance, revQ };
  };
  const B = agg(b), D = agg(d);
  const crit = [];
  b.reports.forEach((r, i) => r.warnings.forEach(w => { if (w.severity === 'critical' || /refus|block|unauthor|breach/i.test(w.title)) crit.push(`${QUARTERS[i]}: ${w.title}`); }));
  console.log(`\n${name}\n  BASE: rev ${eur(B.rev)} [${B.revQ.join(', ')}k] | net ${eur(B.np)} | IP ${eur(B.ip)} | minCash ${eur(B.minCash)} | alerts ${B.alerts}${crit.length ? '\n        ⚠ ' + crit.slice(0, 2).join(' · ') : ''}\n  DOWN: net ${eur(D.np)} | IP ${eur(D.ip)} | minCash ${eur(D.minCash)}`);
  return { B, D };
};

const R = {};
for (const [n, f] of Object.entries(S)) R[n] = run1(n, f);
console.log('\n=== FINAL RANK (base net | downside net) ===');
Object.entries(R).sort((a, b) => b[1].B.np - a[1].B.np).forEach(([n, r], i) =>
  console.log(`${i + 1}. ${n.replace(/ \(.*\)/, '')}: ${eur(r.B.np)} | down ${eur(r.D.np)} | IP ${eur(r.B.ip)}`));
console.log('\nDONE part 3');
