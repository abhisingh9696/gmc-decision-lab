import { readFileSync } from 'node:fs';
const ts = readFileSync('src/engine/source-data.ts', 'utf8');
const start = ts.indexOf('{');
// The object ends before ";\nexport" or at the last "};"
let body = ts.slice(start);
const semi = body.indexOf(';\n');
if (semi > 0) body = body.slice(0, semi);
// history array only
const hStart = body.indexOf('"history": [');
const hEnd = body.indexOf('], "opening"', hStart);
const hist = JSON.parse('[' + body.slice(body.indexOf('[', hStart) + 1, hEnd) + ']');
const openStart = body.indexOf('"opening": {', hEnd);
const openEnd = body.indexOf('}, "sourceDecisions"', openStart);
const opening = JSON.parse(body.slice(body.indexOf('{', openStart), openEnd + 1));
const official = [
  { q: '2015 Q1', revenue: 0, cogs: 14573, admin: 219190, opProfit: -248763, netProfit: -239763, retained: -239763, cash: 2833842, sharePrice: 0.9131, invPerf: 3652400, machines: 2, eff: 100.0, visits: 0 },
  { q: '2015 Q2', revenue: 489810, cogs: 267205, admin: 283883, opProfit: -90902, netProfit: -84150, retained: -323913, cash: 1852457, sharePrice: 0.9745, invPerf: 3898000, machines: 4, eff: 99.0, visits: 0 },
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
}
console.log(mismatches === 0 ? 'HISTORY: all rows match user table' : `HISTORY: ${mismatches} mismatches`);
console.log('opening Q2->Q3 backlog matrix:', JSON.stringify(opening.backlog));
console.log('opening efficiency:', opening.machineEfficiency, 'machines:', opening.machines, 'cash:', opening.cash, 'deposit:', opening.termDepositAmt);
