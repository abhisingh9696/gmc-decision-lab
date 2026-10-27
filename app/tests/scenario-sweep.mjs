// Phase C — strategy sweep: rank coherent 5-quarter strategies by MODELLED
// investment performance (proxy of the GMC winning metric).
import { runSimulation, defaultDecisions } from './engine-bundle.mjs';

const mk = () => [0, 1, 2, 3, 4].map(() => JSON.parse(JSON.stringify(defaultDecisions())));
const scen = [];
const add = (name, fn) => { const d = mk(); fn(d); scen.push([name, d]); };

add('S00 Baseline (repeat 2016 Q1 decisions)', () => {});
add('S01 Launch P1 improvement in Q2', d => { d[0].takeImprovement[0] = true; });
add('S02 Value pricing −5% all', d => d.forEach(x => { x.prices = x.prices.map(r => r.map(p => Math.round(p * 0.95))); }));
add('S03 Premium pricing +5% all', d => d.forEach(x => { x.prices = x.prices.map(r => r.map(p => Math.round(p * 1.05))); }));
add('S04 Marketing push (+60% product ads)', d => d.forEach(x => { x.advProd = x.advProd.map(r => r.map(a => Math.round(a * 1.6))); x.advCorp = x.advCorp.map(a => Math.round(a * 1.3)); }));
add('S05 Capacity build (hire 6, machine Q2, shift 3 from Q3)', d => {
  d[0].hire = 6; d[0].machinesBuy = 1; d.forEach((x, i) => { if (i > 0) x.shift = 3; });
});
add('S06 S01 + S05 (launch + capacity)', d => {
  d[0].takeImprovement[0] = true; d[0].hire = 6; d[0].machinesBuy = 1;
  d.forEach((x, i) => { if (i > 0) x.shift = 3; });
});
add('S07 Quality push (wage 1300, training 20d, premium 15%)', d => d.forEach(x => {
  x.wage = 1300; x.trainingDays = 20; x.premium = [10, 15, 15];
}));
add('S08 Volume push (price −8%, ads +40%, capacity)', d => {
  d.forEach((x, i) => {
    x.prices = x.prices.map(r => r.map(p => Math.round(p * 0.92)));
    x.advProd = x.advProd.map(r => r.map(a => Math.round(a * 1.4)));
    if (i > 0) x.shift = 3;
  });
  d[0].hire = 6; d[0].machinesBuy = 1;
});
add('S09 Cost discipline (fire 2, maint 15, budget −10% path)', d => d.forEach((x, i) => {
  if (i === 0) x.hire = -2;
  x.maintenance = 15; x.mgmtBudget = i === 0 ? 63 : 57; x.trainingDays = 0; x.rd = [15, 10, 10];
}));
add('S10 Materials hedge (3m/6m futures instead of spot)', d => d.forEach(x => {
  x.matSpot = 2; x.matM3 = 6; x.matM6 = 4;
}));
add('S11 Cash management (deposit 500 Q2, dividend 1¢ from Q3)', d => {
  d[0].termDeposit = 500; d.forEach((x, i) => { if (i > 0) x.dividend = 1; });
});
add('S12 Launch + volume + quality (combined aggressive)', d => {
  d[0].takeImprovement[0] = true; d[0].hire = 6; d[0].machinesBuy = 1;
  d.forEach((x, i) => {
    x.prices = x.prices.map(r => r.map(p => Math.round(p * 0.97)));
    x.advProd = x.advProd.map(r => r.map(a => Math.round(a * 1.4)));
    x.wage = 1250; x.trainingDays = 10;
    if (i > 0) x.shift = 3;
  });
});
add('S13 Subcontract surge (cover peak via subcontractors)', d => d.forEach((x, i) => {
  if (i >= 1) x.subcontract = [200, 100, 50];
}));
add('S14 Lean premium niche (price +8%, quality, fewer units)', d => d.forEach(x => {
  x.prices = x.prices.map(r => r.map(p => Math.round(p * 1.08)));
  x.wage = 1250; x.premium = [0, 20, 20]; x.trainingDays = 15;
  x.advProd = x.advProd.map(r => r.map(a => Math.round(a * 1.2)));
}));

console.log('Strategy'.padEnd(58), 'InvPerf(Q5)', '  vs S00', '  Q5 cash', '  cumNP', ' alerts');
const rows = [];
for (const [name, d] of scen) {
  const { reports } = runSimulation(d);
  const last = reports[4];
  const cumNP = reports.reduce((a, r) => a + r.netProfit, 0);
  const alerts = reports.reduce((a, r) => a + r.warnings.filter(x => x.severity === 'critical').length, 0);
  const gapOK = reports.every(r => {
    const b = r.details.balance;
    const A = b.fixedAssets + b.capitalWip + b.inventories + b.materialsValue + b.materialsOnOrder + b.receivables + b.cash + b.deposit;
    return Math.abs(A - (b.payables + b.taxDue + b.overdraft + b.termLoan + b.shareCapital + b.sharePremium + b.retainedEarnings)) <= 2;
  });
  rows.push({ name, ip: last.investmentPerformance, cash: last.cashEnd - last.overdraftEnd, cumNP, alerts, gapOK,
    sp: last.sharePrice, unauth: reports.some(r => r.unauthorised) });
}
const baseIP = rows[0].ip;
rows.sort((a, b) => b.ip - a.ip);
for (const r of rows) {
  console.log(r.name.padEnd(58),
    String(r.ip.toLocaleString()).padStart(10),
    String(((r.ip / baseIP - 1) * 100).toFixed(1) + '%').padStart(8),
    String(Math.round(r.cash / 1000) + 'k').padStart(8),
    String(Math.round(r.cumNP / 1000) + 'k').padStart(7),
    String(r.alerts).padStart(6),
    r.gapOK ? '' : 'BALANCE-FAIL', r.unauth ? 'UNAUTH-OD' : '');
}
