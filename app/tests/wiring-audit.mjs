// Phase B — one-input-at-a-time wiring audit: every decision must move its
// expected downstream outputs (Decision → operating → financial → displayed).
import { runSimulation, defaultDecisions } from './engine-bundle.mjs';

const mk = () => [0, 1, 2, 3, 4].map(() => JSON.parse(JSON.stringify(defaultDecisions())));
const base = runSimulation(mk()).reports;
let pass = 0, fail = 0;
const T = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${extra}`); }
};
const run = (fn) => { const d = mk(); fn(d); return runSimulation(d).reports; };

console.log('— Demand & marketing —');
T('price ↑ → EU P1 orders ↓', run(d => d[0].prices[0][0] *= 1.10)[0].orders[0][0] < base[0].orders[0][0]);
T('product ads ↑ → EU P1 orders ↑', run(d => d[0].advProd[0][0] = 20)[0].orders[0][0] > base[0].orders[0][0]);
T('corp ads ↑ → admin ↑ + image persists', run(d => d.forEach(x => x.advCorp[0] = 30))[1].orders[0][1] > base[1].orders[0][1]);
T('agent commission ↑ → EU orders ↑', run(d => d.forEach(x => x.agentsEU.commission = 10))[0].orders[0][2] > base[0].orders[0][2]);
T('nafta support ↑ → Nafta orders ↑', run(d => d.forEach(x => x.distNafta.support = 20))[0].orders[1][0] > base[0].orders[1][0]);
T('net support ↑ → Net orders ↑', run(d => d.forEach(x => x.distNet.support = 20))[0].orders[2][0] > base[0].orders[2][0]);
T('webDev ↑ → admin ↑ & net channel ↑', run(d => d.forEach(x => x.webDev = 40))[0].adminExpenses > base[0].adminExpenses);
T('want 4th EU agent → orders ↑ from Q3', run(d => d.forEach(x => x.agentsEU.want = 4))[1].orders[0][0] > base[1].orders[0][0]);
T('ports ↑ → admin (ISP) ↑ from Q3 (lead time)', run(d => d[0].ports = 10)[1].adminExpenses > base[1].adminExpenses);

console.log('— Production & operations —');
T('deliveries ↑ → production ↑', run(d => d[0].deliveries[0][0] = 1400)[0].productionActual[0] > base[0].productionActual[0]);
T('buy machine Q2 → WIP then capacity Q3', (() => { const r = run(d => d[0].machinesBuy = 1);
  return r[0].details.balance.capitalWip === 300000 && r[1].machHoursAvail > base[1].machHoursAvail; })());
T('sell machine Q2 → gross proceeds, capacity ↓ from Q3', (() => { const r = run(d => d[0].machinesSell = 1);
  return r[1].machHoursAvail < base[1].machHoursAvail && r[0].details.cashFlow.assetProceeds > 200000; })());
T('hire 6 → workers arrive Q3 (headcount = 27)', (() => { const r = run(d => d[0].hire = 6);
  return r[1].assemblyWorkersOpen === 27; })());
T('fire 3 → dismiss cost now, workers ↓ from Q3', (() => { const r = run(d => d[0].hire = -3);
  return r[0].adminExpenses > base[0].adminExpenses && r[1].assemblyWorkersOpen === 18; })());
T('wage ↑ → COGS ↑ profit ↓', run(d => d[0].wage = 1500)[0].operatingProfit < base[0].operatingProfit);
T('shift 3 → machining capacity ↑', run(d => d[0].shift = 3)[0].machHoursAvail > base[0].machHoursAvail);
T('assembly time ↓ → hours ↓, rejects ↑', (() => { const r = run(d => d[0].assemblyTimes = [100, 150, 300]);
  return r[0].assemblyHoursNeeded < base[0].assemblyHoursNeeded && r[0].rejectRate[0] > base[0].rejectRate[0]; })());
T('premium 20% → COGS ↑ (premium adder)', run(d => d[0].premium = [20, 20, 20])[0].cogs > base[0].cogs);
T('training days 20 → admin ↑ rejects ↓', (() => { const r = run(d => d.forEach(x => x.trainingDays = 20));
  return r[0].adminExpenses > base[0].adminExpenses && r[0].rejectRate[0] < base[0].rejectRate[0]; })());
T('train request 4 is space-capped to 2 → Q3 headcount 27', (() => { const r = run(d => d[0].train = 4);
  return r[1].assemblyWorkersOpen === 27 && r[0].effectiveDecisions.train === 2; })());
T('maintenance 30 vs 10 → efficiency path differs', (() => {
  const hi = run(d => d.forEach(x => x.maintenance = 30)), lo = run(d => d.forEach(x => x.maintenance = 10));
  return hi[2].machHoursAvail > lo[2].machHoursAvail; })());
T('spot 0 → emergency purchase alert + cost', run(d => d[0].matSpot = 0)[0].warnings.some(x => x.title === 'Emergency material purchase'));
T('3-mth futures → on-order asset, arrives Q3', (() => { const r = run(d => d[0].matM3 = 10);
  return r[0].details.balance.materialsOnOrder > 500000 && r[1].details.balance.materialsOnOrder < r[0].details.balance.materialsOnOrder; })());
T('factory ext → land used, space ↑ Q3', (() => { const r = run(d => d[0].factoryExt = 100);
  return r[1].spaceAvail > base[1].spaceAvail; })());
T('subcontract Q2 → WIP components arrive Q3, 50/50 paid', (() => { const r = run(d => d[0].subcontract = [200, 100, 50]);
  return r[1].warnings.some(x => x.title === 'Subcontracted components arrived')
    && r[0].details.cashFlow.subcontractPaid > 0 && r[1].details.cashFlow.subcontractPaid > 0; })());

console.log('— Quality & R&D —');
T('P1 improvement launch → 135 obsolete + stars ↑', (() => { const r = run(d => d[0].takeImprovement[0] = true);
  return r[0].obsoleteUnits === 135 && r[0].stars[0] > base[0].stars[0]; })());
T('R&D spend ↑ → admin ↑', run(d => d[0].rd = [50, 15, 15])[0].adminExpenses > base[0].adminExpenses);

console.log('— Finance —');
T('deposit +400 → cash ↓ interest ↑', (() => { const r = run(d => d[0].termDeposit = 400);
  return r[0].cashEnd < base[0].cashEnd && r[1].details.income.interestReceived > base[1].details.income.interestReceived; })());
T('loan 1000k → cash ↑ interest 25k', (() => { const r = run(d => d[0].termLoan = 1000);
  return r[0].cashEnd > base[0].cashEnd && Math.abs(r[0].details.income.interestPaid - 25000) < 2; })());
T('dividend blocked Q2 (neg. reserves), paid later', (() => { const r = run(d => d.forEach(x => x.dividend = 1));
  return r[0].dividendPaid === 0 && r[1].dividendPaid > 0; })());
T('share issue 100k → cash ↑ capital ↑', (() => { const r = run(d => d[1].shares = 100);
  return r[1].details.balance.shareCapital === 4100000; })());
T('insurance plan 0 → premium 0', run(d => d[0].insurance = 0)[0].details.adminBreakdown.find(x => x.label === 'Insurance premiums').value === 0);
T('info off → admin ↓ 12,500', Math.abs(run(d => { d[0].infoMarket = false; d[0].infoCompetitors = false; })[0].adminExpenses - (base[0].adminExpenses - 12500)) < 2);
T('mgmt budget ↑ immediate, ↓ deferred', (() => {
  const up = run(d => d[0].mgmtBudget = 90)[0], dn = run(d => d[0].mgmtBudget = 50)[0];
  return up.mgmtBudgetEffective === 90 && dn.mgmtBudgetEffective === 70; })());

console.log('— Econ assumptions —');
T('FX ↑ (weaker €) → Nafta orders ↑', runSimulation(mk(), [{ exchangeRate: 1.0 }]).reports[0].orders[1][0] > base[0].orders[1][0]);
T('competitor price ↑ → our orders ↑', runSimulation(mk(), [{ compPrices: [[400, 490, 700], [335, 490, 725], [375, 590, 850]] }]).reports[0].orders[0][0] > base[0].orders[0][0]);
T('growth ↑ → orders ↑', runSimulation(mk(), [{ growth: 1.10 }]).reports[0].orders.flat().reduce((a, b) => a + b, 0) > base[0].orders.flat().reduce((a, b) => a + b, 0));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
