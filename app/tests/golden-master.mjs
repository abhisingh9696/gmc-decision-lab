// Golden-master snapshot: pins the outputs of baseline + key strategies so
// accuracy work (27-table register fixes) can measure EXACT drift per change.
// Usage:
//   node tests/golden-master.mjs write   -> writes tests/golden-master.json
//   node tests/golden-master.mjs diff    -> compares live engine to snapshot
import { runSimulation, defaultDecisions } from './engine-bundle.mjs';
import { readFileSync, writeFileSync } from 'fs';

const mk = () => [0, 1, 2, 3, 4].map(() => JSON.parse(JSON.stringify(defaultDecisions())));
const scen = [];
const add = (name, fn) => { const d = mk(); fn(d); scen.push([name, d]); };

add('S00 Baseline', () => {});
add('S03 Premium pricing +5% all', d => d.forEach(x => { x.prices = x.prices.map(r => r.map(p => Math.round(p * 1.05))); }));
add('S07 Quality push', d => d.forEach(x => { x.wage = 1300; x.trainingDays = 20; x.premium = [10, 15, 15]; }));
add('S10 Materials hedge', d => d.forEach(x => { x.matSpot = 2; x.matM3 = 6; x.matM6 = 4; }));

const snap = {};
for (const [name, dec] of scen) {
  const { reports } = runSimulation(dec);
  snap[name] = reports.map(r => ({
    q: r.quarterLabel, revenue: r.revenue, cogs: r.cogs, grossProfit: r.grossProfit,
    adminExpenses: r.adminExpenses, operatingProfit: r.operatingProfit, netProfit: r.netProfit,
    cashEnd: r.cashEnd, overdraftEnd: r.overdraftEnd, dividendPaid: r.dividendPaid,
    sharePrice: r.sharePrice, investmentPerformance: r.investmentPerformance,
    insurance: r.details.adminBreakdown.find(x => x.label === 'Insurance premiums')?.value,
  }));
}

const mode = process.argv[2] ?? 'diff';
if (mode === 'write') {
  writeFileSync(new URL('./golden-master.json', import.meta.url), JSON.stringify(snap, null, 1));
  console.log('golden-master.json written:', Object.keys(snap).join(', '));
} else {
  const before = JSON.parse(readFileSync(new URL('./golden-master.json', import.meta.url), 'utf8'));
  let diffs = 0;
  for (const name of Object.keys(snap)) {
    for (let i = 0; i < 5; i++) {
      for (const k of Object.keys(snap[name][i])) {
        const a = before[name]?.[i]?.[k], b = snap[name][i][k];
        if (a !== b) {
          diffs++;
          const d = (typeof a === 'number' && typeof b === 'number') ? ` (Δ ${b - a})` : '';
          console.log(`${name} ${snap[name][i].q} ${k}: ${a} -> ${b}${d}`);
        }
      }
    }
  }
  console.log(diffs === 0 ? 'NO DRIFT — engine identical to snapshot' : `${diffs} drifted values`);
}
