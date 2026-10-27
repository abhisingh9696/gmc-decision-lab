import { readFileSync } from 'node:fs';
const ts = readFileSync('src/engine/source-data.ts', 'utf8');
const start = ts.indexOf('{');
let body = ts.slice(start);
const semi = body.indexOf(';\n');
if (semi > 0) body = body.slice(0, semi);
const hStart = body.indexOf('"history": [');
const hEnd = body.indexOf('], "opening"', hStart);
const hist = JSON.parse('[' + body.slice(body.indexOf('[', hStart) + 1, hEnd) + ']');
const openStart = body.indexOf('"opening": {', hEnd);
const openEnd = body.indexOf('}, "sourceDecisions"', openStart);
const opening = JSON.parse(body.slice(body.indexOf('{', openStart), openEnd + 1));
const official = [
  { q: '2015 Q1', revenue: 0, cogs: 14573, admin: 219190, opProfit: -248763, netProfit: -239763, retained: -239763, cash: 2833842, sharePrice: 0.9131, invPerf: 3652400, machines: 2, eff: 100.0, visits: 0 },
  { q: '2015 Q2', revenue: 489810, cogs: 267205, admin: 283883, opProfit: -90902, netProfit: -84150, retained: -323913, cash: 1852457, sharePrice: 0.9745, invPerf: 3898000, machines: 4, eff: 99.0, visits: 0, currentAssets: 2377948, netAssets: 3676087, deposit: 1900000 },
  { q: '2015 Q3', revenue: 920610, cogs: 485137, admin: 343763, opProfit: 62826, netProfit: 68076, retained: -255837, cash: 1697541, sharePrice: 1.0291, invPerf: 4116400, machines: 4, eff: 98.2, visits: 0 },
  { q: '2015 Q4', revenue: 1228210, cogs: 704934, admin: 413468, opProfit: 104274, netProfit: 108586, retained: -147251, cash: 1695144, sharePrice: 1.0497, invPerf: 4198800, machines: 4, eff: 96.7, visits: 4999 },
  { q: '2016 Q1', revenue: 1314236, cogs: 750076, admin: 438377, opProfit: 100460, netProfit: 103335, retained: -43916, cash: 1976635, sharePrice: 1.0801, invPerf: 4320400, machines: 4, eff: 95.1, visits: 6897 },
];
let mismatches = 0;
for (let i = 0; i < hist.length; i++) {
  const h = hist[i], o = official[i];
  for (const k of Object.keys(o).filter(k => k !== 'q')) {
    const a = h[k], b = o[k];
    if (Math.abs(Number(a) - Number(b)) > 0.001) {
      mismatches++;
      console.log(`MISMATCH ${o.q} ${k}: app=${a} user-table=${b} diff=${Number(a) - Number(b)}`);
    }
  }
  if (h.currentAssets == null || h.netAssets == null || h.deposit == null) { mismatches++; console.log(`MISSING new column in ${h.q}`); }
}
// Official 2016 Q2 (W132162.xls) — the locked sixth actual column lives in
// src/engine/q2-official.ts; bundle it so the mjs test can import the real module.
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
execSync('npx esbuild src/engine/history.ts --bundle --format=esm --outfile=tests/.history-bundle.mjs', { stdio: 'pipe' });
const { HISTORY_ACTUALS } = await import(pathToFileURL('tests/.history-bundle.mjs').href);
const Q2 = { q: '2016 Q2', revenue: 860997, cogs: 384741, admin: 389872, opProfit: 59614, netProfit: 62489, retained: 18573, cash: 2201507, deposit: 1150000, currentAssets: 2916654, netAssets: 4018573, sharePrice: 0.9833, invPerf: 3933200, machines: 4, eff: 93.3, visits: 9132, orders: [838, 121, 375], sold: [840, 121, 331], backlog: [0, 0, 0] };
const q2 = HISTORY_ACTUALS[HISTORY_ACTUALS.length - 1];
if (q2?.q !== '2016 Q2') { mismatches++; console.log('Q2 official row missing from HISTORY_ACTUALS'); }
else for (const k of Object.keys(Q2).filter(k => k !== 'q')) {
  const a = JSON.stringify(q2[k]), b = JSON.stringify(Q2[k]);
  if (a !== b) { mismatches++; console.log(`Q2 OFFICIAL MISMATCH ${k}: app=${a} expected=${b}`); }
}
if (HISTORY_ACTUALS.length !== 6) { mismatches++; console.log(`HISTORY_ACTUALS length ${HISTORY_ACTUALS.length} != 6`); }
console.log(mismatches === 0 ? 'HISTORY: all rows match (incl. 2015 Q2 supplementary + official 2016 Q2)' : `HISTORY: ${mismatches} mismatches`);
for (const h of hist) console.log(`${h.q}: cash=${h.cash} deposit=${h.deposit} curAssets=${h.currentAssets} netAssets=${h.netAssets}`);
console.log('opening Q2->Q3 backlog matrix:', JSON.stringify(opening.backlog));
console.log('opening efficiency:', opening.machineEfficiency, 'machines:', opening.machines, 'cash:', opening.cash, 'deposit:', opening.termDepositAmt);
