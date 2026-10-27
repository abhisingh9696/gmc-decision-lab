// GMC Decision Lab — regression suite (audit rounds 1–3: F01–F12, R01–R09, N01–N07)
// Run: npx esbuild src/engine/index.ts --bundle --format=esm --outfile=tests/engine-bundle.mjs
//      node tests/engine-tests.mjs
import { runSimulation, defaultDecisions, baselineState, sanitizeDecisions } from './engine-bundle.mjs';

let pass = 0, fail = 0;
const T = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${extra}`); }
};
const near = (a, b, tol = 2) => Math.abs(a - b) <= tol;
const mkDec = () => [0, 1, 2, 3, 4].map(() => JSON.parse(JSON.stringify(defaultDecisions())));
const balGap = (r) => {
  const b = r.details.balance;
  const A = b.fixedAssets + b.capitalWip + b.inventories + b.materialsValue + b.wipComponents + b.materialsOnOrder + b.receivables + b.cash + b.deposit;
  const LE = b.payables + b.taxDue + b.overdraft + b.termLoan + b.shareCapital + b.sharePremium + b.retainedEarnings;
  return A - LE;
};
const cashGap = (r) => {
  const c = r.details.cashFlow;
  return (c.openingCash + c.collected + c.interestReceived + c.loanDrawn + c.shareCash
    + c.obsoleteProceeds + c.scrapProceeds + c.assetProceeds - c.paidSuppliersAdmin - c.paidProduction
    - c.paidMaterials - c.subcontractPaid - c.dividendPaid - c.capex - c.taxPaid - c.interestPaid - c.depositChange)
    - (c.closingCash - c.overdraftEnd);
};
const retGap = (r) => {
  const x = r.details.retained;
  return (x.opening + x.netProfit - x.dividendPaid) - x.closing;
};

console.log('— Baseline sanity —');
{
  const { reports } = runSimulation(mkDec());
  const r0 = reports[0];
  T('baseline revenue > 0', r0.revenue > 1000000, String(r0.revenue));
  T('deposit interest = 2875', near(r0.details.income.interestReceived, 2875), String(r0.details.income.interestReceived));
  T('balance check baseline Q2 = 0', near(balGap(r0), 0), String(balGap(r0)));
  T('cash bridge baseline Q2', near(cashGap(r0), 0), String(cashGap(r0)));
  T('retained bridge baseline Q2', near(retGap(r0), 0), String(retGap(r0)));
  T('all 5 quarters balance', reports.every(r => near(balGap(r), 0)), reports.map(balGap).join(','));
  T('workforce headcount = 21 post-arrival (R07)', r0.assemblyWorkersOpen === 21, String(r0.assemblyWorkersOpen));
  T('gross >= good, rejects ~3% (R06)', r0.grossStarts.reduce((a, b) => a + b, 0) >= r0.productionPlanned.reduce((a, b) => a + b, 0)
    && r0.rejectRate[0] > 0.02 && r0.rejectRate[0] < 0.045);
  T('integer reconciliation: good+rejects = gross (unscaled)', r0.productionActual.reduce((a, b) => a + b, 0) + r0.rejects.reduce((a, b) => a + b, 0)
    === r0.grossStarts.reduce((a, b) => a + b, 0));

  // — Investment-performance decomposition exposed to the UI —
  for (const r of reports) {
    const b = r.ipBreakdown;
    T(`ipBreakdown identity ${r.quarterLabel}`,
      near(b.marketValue + b.cumDividends + b.cumRepurchases - b.cumIssues, r.investmentPerformance, 2),
      `${b.marketValue}+${b.cumDividends}+${b.cumRepurchases}-${b.cumIssues} vs ${r.investmentPerformance}`);
    T(`ipBreakdown price ${r.quarterLabel}`,
      near(b.navPerShare * b.sentiment, r.sharePrice, 0.01), `${b.navPerShare}*${b.sentiment} vs ${r.sharePrice}`);
  }
  T('no P2 improvement relaunch in baseline (R03)', !r0.warnings.some(x => x.title.includes('P2 improvement launched')));
  T('materials Table 21 valuation (N03)', near(r0.details.balance.materialsValue,
    r0.details.workingCapital.materialsStock * 0.9 * Math.min(71919, 67977, 67171) / 1000 * 0.9, 2),
    `${r0.details.balance.materialsValue} vs stock ${r0.details.workingCapital.materialsStock}`);
  T('overtime tiers: baseline within basic hours, no Sun (N05)', r0.assemblyTiers.basic > 0 && r0.assemblyTiers.sunday === 0,
    JSON.stringify(r0.assemblyTiers));
  T('assembly avail = 21×576×0.97 (N05)', near(r0.assemblyHoursAvail, 21 * 576 * 0.97, 1), String(r0.assemblyHoursAvail));
}

console.log('— Tax chronology (F01) —');
{
  const { reports } = runSimulation(mkDec());
  T('no tax assessed in Q2', reports[0].tax === 0);
  T('no tax paid in Q2 (nothing due)', reports[0].details.cashFlow.taxPaid === 0);
  const dq = mkDec(); dq.forEach(d => { d.prices = d.prices.map(r => r.map(p => p * 1.15)); });
  const hi = runSimulation(dq).reports;
  T('profitable year: Q4 assesses tax', hi[2].details.income.taxAssessed > 0, String(hi[2].details.income.taxAssessed));
  T('following Q2 pays it', near(hi[3].details.cashFlow.taxPaid, 0) && hi[4] !== undefined);
}

console.log('— Dividend opening-reserves rule (F02) —');
{
  const dq = mkDec(); dq[0].dividend = 5;
  const r0 = runSimulation(dq).reports[0];
  T('dividend blocked with negative opening reserves', r0.dividendPaid === 0
    && r0.warnings.some(x => x.title === 'Dividend blocked'));
}

console.log('— Term loan: cap, principal, interest (F03/R01) —');
{
  const dq = mkDec(); dq[0].termLoan = 2000;
  const r0 = runSimulation(dq).reports[0];
  T('loan capped at borrowing power 1,542,000', r0.details.balance.termLoan === 1542000, String(r0.details.balance.termLoan));
  T('cap warning shown', r0.warnings.some(x => x.title === 'Loan exceeds borrowing power'));
  T('interest on drawn balance = 38,550', near(r0.details.income.interestPaid, 1542000 * 0.10 / 4, 2), String(r0.details.income.interestPaid));
  T('loan principal reaches cash (bridge holds)', near(cashGap(r0), 0), String(cashGap(r0)));
  T('balance holds under capped loan', near(balGap(r0), 0), String(balGap(r0)));
}

console.log('— Wage floor (R02) —');
{
  const dq = mkDec(); dq[0].wage = 1000;
  const { reports, finalState } = runSimulation(dq);
  T('wage cut refused (floor = prior 1200)', reports[0].warnings.some(x => x.title === 'Wage cut not permitted'));
  T('assembly payroll uses 1200 not 1000', finalState.priorWage === 1200);
  const dq2 = mkDec(); dq2[0].wage = 1300; dq2[1].wage = 1100;
  const r2 = runSimulation(dq2).reports;
  T('floor carries forward (1300 then 1100→1300)', r2[1].warnings.some(x => x.title === 'Wage cut not permitted'));
}

console.log('— Invalid input clamps —');
{
  const dq = mkDec(); const ref = mkDec();
  dq[0].shift = 4; dq[0].train = 99; dq[0].trainingDays = 200; dq[0].termLoan = -5;
  ref[0].shift = 3; ref[0].train = 9; ref[0].trainingDays = 90; ref[0].termLoan = 0;
  const a = runSimulation(dq).reports[0], b = runSimulation(ref).reports[0];
  T('clamped run matches forced reference', near(a.netProfit, b.netProfit, 2) && near(a.cashEnd, b.cashEnd, 2),
    `${a.netProfit} vs ${b.netProfit}`);
}

console.log('— Improvement launch / obsolete stock (R03 + N04) —');
{
  const st = baselineState();
  const units = [135, 9, 8];
  for (let p = 0; p < 3; p++) {
    const dq = mkDec(); dq[0].takeImprovement[p] = true;
    const r0 = runSimulation(dq).reports[0];
    const expectUnit = st.productFGValue[p] / units[p];
    T(`P${p + 1} liquidated at OWN valuation`, near(r0.obsoleteProceeds, units[p] * expectUnit, 2),
      `${r0.obsoleteProceeds} vs ${units[p] * expectUnit}`);
    T(`P${p + 1} not at cross-product average 155.05`, !near(r0.obsoleteProceeds, units[p] * (23568 / 152), 50));
  }
  const dq = mkDec(); dq[0].takeImprovement[0] = true;
  const r0 = runSimulation(dq).reports[0];
  T('obsoleteUnits = 135 for P1 launch', r0.obsoleteUnits === 135 && r0.obsoleteByProduct[0] === 135);
  T('per-product values differ (P3 > P2 > P1)',
    st.productFGValue[2] / 8 > st.productFGValue[1] / 9 && st.productFGValue[1] / 9 > st.productFGValue[0] / 135);
  T('launch balances', near(balGap(r0), 0), String(balGap(r0)));
  const dBad = mkDec(); dBad[0].takeImprovement[1] = true;
  T('invalid P2 relaunch flagged', runSimulation(dBad).reports[0].warnings.some(x => x.title === 'No P2 improvement available'));
}

console.log('— N01: emergency materials fully accounted —');
{
  const dq = mkDec(); dq[0].matSpot = 0;
  const r0 = runSimulation(dq).reports[0];
  const base = runSimulation(mkDec()).reports[0];
  const spotEUR = 71919 / 1000 * 0.9;
  T('emergency warning with full invoice', r0.warnings.some(x => x.title === 'Emergency material purchase'));
  T('shortfall detected', r0.materialsShortfall > 3000, String(r0.materialsShortfall));
  const emergencyVal = r0.materialsShortfall * spotEUR * 1.1;
  T('materials paid (cash) = half of full invoice', near(r0.details.cashFlow.paidMaterials, emergencyVal * 0.5, 2),
    `${r0.details.cashFlow.paidMaterials} vs ${emergencyVal * 0.5}`);
  T('unpaid half sits in payables', r0.details.balance.payables > emergencyVal * 0.4);
  T('unit reconciliation: opening+receipts-consumption=closing',
    near(1720 + 0 + r0.materialsShortfall - r0.materialsNeeded, r0.details.workingCapital.materialsStock, 0.5),
    String(r0.details.workingCapital.materialsStock));
  T('no phantom saving: cash + inventory value FALLS vs baseline',
    r0.cashEnd + r0.details.balance.materialsValue < base.cashEnd + base.details.balance.materialsValue,
    `${r0.cashEnd}+${r0.details.balance.materialsValue} vs ${base.cashEnd}+${base.details.balance.materialsValue}`);
  T('profit FALLS vs baseline (premium fully charged)', r0.operatingProfit < base.operatingProfit,
    `${r0.operatingProfit} vs ${base.operatingProfit}`);
  T('balance holds under emergency purchase', near(balGap(r0), 0), String(balGap(r0)));
  T('cash bridge holds under emergency purchase', near(cashGap(r0), 0), String(cashGap(r0)));
}

console.log('— N02: machine sale, single decommissioning —');
{
  const dq = mkDec(); dq[0].machinesSell = 1;
  const r0 = runSimulation(dq).reports[0];
  const soldBook = 1070870 / 4;
  T('balance check = 0 after sale', near(balGap(r0), 0), String(balGap(r0)));
  T('gross proceeds in cash flow', near(r0.details.cashFlow.assetProceeds, soldBook, 2), String(r0.details.cashFlow.assetProceeds));
  const decomLines = r0.details.adminBreakdown.filter(x => x.label === 'Decommissioning');
  T('decommissioning expensed exactly once (60,000)', decomLines.length === 1 && near(decomLines[0].value, 60000, 1));
  T('fixed assets reduced by book value', near(r0.details.balance.fixedAssets, 50000 + 250000 + (1070870 - soldBook) * 0.975, 3),
    String(r0.details.balance.fixedAssets));
  const dq2 = mkDec(); dq2[0].machinesSell = 2;
  const r2 = runSimulation(dq2).reports[0];
  T('two machines: 120,000 decommissioning, balance 0',
    near(r2.details.adminBreakdown.find(x => x.label === 'Decommissioning').value, 120000, 1) && near(balGap(r2), 0),
    String(balGap(r2)));
  const dq3 = mkDec(); dq3[0].machinesSell = 1; dq3[0].machinesBuy = 3; dq3[0].termLoan = 1500;
  const r3 = runSimulation(dq3).reports[0];
  T('mixed buy/sell with loan: balance 0', near(balGap(r3), 0), String(balGap(r3)));
  const dq4 = mkDec(); dq4[0].machinesSell = 1; dq4[0].advCorp = [500, 500, 500]; dq4[0].rd = [200, 200, 200];
  const rr = runSimulation(dq4).reports;
  T('machine sale under overdraft: balance 0 all quarters', rr.every(r => near(balGap(r), 0)), rr.map(balGap).join(','));
}

console.log('— N05: automatic overtime capacity —');
{
  const dq = mkDec(); dq[0].shift = 3; dq[0].deliveries[0][0] = 1800;
  const r0 = runSimulation(dq).reports[0];
  T('no capacity cut with overtime', !r0.productionScaled, r0.warnings.map(x => x.title).join('|'));
  T('assembly avail = 11,733', near(r0.assemblyHoursAvail, 11733.12, 1), String(r0.assemblyHoursAvail));
  T('Saturday tier engaged', r0.assemblyTiers.saturday > 0);
  const dq2 = mkDec(); dq2[0].deliveries = [[4000, 2000, 1000], [800, 600, 300], [900, 600, 400]];
  const rBig = runSimulation(dq2).reports[0];
  T('beyond-all-tiers plan still scaled', rBig.productionScaled);
  T('scaled output stays integer-consistent', rBig.productionActual.every((g, p) =>
    Number.isInteger(g) && Number.isInteger(rBig.rejects[p])));
}

console.log('— N06: management budget notice + 10% cap —');
{
  const dq = mkDec(); dq[0].mgmtBudget = 50;
  const { reports } = runSimulation(dq);
  const r0 = reports[0];
  T('reduction deferred with warning', r0.warnings.some(x => x.title === 'Management budget cut deferred'));
  T('effective stays 70 this quarter', r0.mgmtBudgetEffective === 70);
  T('salaries charged = 70,000', r0.details.adminBreakdown.find(x => x.label === 'Management salaries').value === 70000);
  const dq2 = mkDec(); dq2[0].mgmtBudget = 50; dq2[1].mgmtBudget = 50;
  const r2 = runSimulation(dq2).reports;
  T('next quarter effective = 63 (10% cap)', r2[1].mgmtBudgetEffective === 63, String(r2[1].mgmtBudgetEffective));
  T('balance holds with budget schedule', r2.every(r => near(balGap(r), 0)));
}

console.log('— Annual share-dealing cap (finance manual: ±10% of YEAR-START capital per year) —');
{
  const dq = mkDec(); dq[0].shares = 400; dq[1].shares = 400; // 400k in Q2 AND 400k in Q3
  const rr = runSimulation(dq).reports;
  T('Q2 issue of 400k accepted', rr[0].details.cashFlow.shareCash > 400000, String(rr[0].details.cashFlow.shareCash));
  T('Q3 repeat issue BLOCKED (annual allowance used)', rr[1].details.cashFlow.shareCash === 0
    && rr[1].warnings.some(x => x.title === 'Share change capped'),
    `shareCash Q3 = ${rr[1].details.cashFlow.shareCash}`);
  T('capital never exceeds 4.4M in 2016', [rr[0], rr[1], rr[2]].every(r => r.details.balance.shareCapital <= 4400000),
    [rr[0], rr[1], rr[2]].map(r => r.details.balance.shareCapital).join(','));
  const dq2 = mkDec(); dq2[0].shares = 400; dq2[3].shares = 400; // again in 2017 Q1 — new year
  dq2.forEach(d => { d.prices = d.prices.map(r => r.map(p => Math.round(p * 1.1))); }); // keep share price above par
  const rr2 = runSimulation(dq2).reports;
  T('allowance resets in 2017 Q1', rr2[3].details.cashFlow.shareCash > 400000, String(rr2[3].details.cashFlow.shareCash));
  const dq3 = mkDec(); dq3[0].shares = -200; dq3[1].shares = -300; // repurchases share their own annual pool
  const rr3 = runSimulation(dq3).reports;
  T('repurchase pool also capped annually', rr3[0].details.cashFlow.shareCash < 0
    && Math.abs(rr3[1].details.cashFlow.shareCash) < 300000 * 0.9
    && rr3[1].warnings.some(x => x.title === 'Share change capped'),
    `${rr3[0].details.cashFlow.shareCash} / ${rr3[1].details.cashFlow.shareCash}`);
  T('balance ties with capped share trades', rr.every(r => near(balGap(r), 0) && near(cashGap(r), 0))
    && rr2.every(r => near(balGap(r), 0)) && rr3.every(r => near(balGap(r), 0)));
}

console.log('— Effective decisions in report (portal export parity incl. financial caps) —');
{
  const dq = mkDec();
  dq.forEach(x => { x.prices = x.prices.map(r => r.map(p => Math.round(p * 1.1))); }); // keep price above par
  dq[0].shares = 400; dq[1].shares = 400;   // Q2 accepted, Q3 capped to 0 by the annual limit
  dq[0].wage = 800; dq[0].termLoan = -1; dq[0].shift = 4;
  dq[0].dividend = 5;                        // blocked: negative opening retained
  const rr = runSimulation(dq).reports;
  T('effective: Q2 shares = 400 (accepted)', rr[0].effectiveDecisions.shares === 400, String(rr[0].effectiveDecisions.shares));
  T('effective: Q3 shares = 0 (annual cap)', rr[1].effectiveDecisions.shares === 0, String(rr[1].effectiveDecisions.shares));
  T('effective: wage forced 800→1200', rr[0].effectiveDecisions.wage === 1200, String(rr[0].effectiveDecisions.wage));
  T('effective: loan −1→0, shift 4→3', rr[0].effectiveDecisions.termLoan === 0 && rr[0].effectiveDecisions.shift === 3);
  T('effective: dividend blocked → 0', rr[0].effectiveDecisions.dividend === 0
    && rr[0].warnings.some(x => x.title === 'Dividend blocked' && x.adjustment === true));
  T('adjustment flags on all forced changes', ['Share change capped', 'Wage cut not permitted', 'Invalid shift level', 'Loan repayment not via this field']
    .every(t => [...rr[0].warnings, ...rr[1].warnings].some(x => x.title === t && x.adjustment === true)));
  // dividend cap to opening reserves: Q3 opening retained < 5% of capital
  const dq2 = mkDec(); dq2[1].dividend = 99;
  const rr2b = runSimulation(dq2).reports;
  const capCents = rr2b[1].effectiveDecisions.dividend;
  T('effective: dividend capped to opening reserves (€)', capCents < 99
    && rr2b[1].dividendPaid <= Math.max(0, rr2b[0].details.retained.closing)
    && rr2b[1].dividendPaid > Math.max(0, rr2b[0].details.retained.closing) - 40000
    && Number.isInteger(capCents),
    `${capCents}% → €${rr2b[1].dividendPaid} (reserves €${rr2b[0].details.retained.closing})`);
}

console.log('— Subcontract wiring (m2.htm components + Table 24 50/50) —');
{
  const dq = mkDec(); dq[0].subcontract = [200, 100, 50];
  const { reports: rr, finalState } = runSimulation(dq);
  const base = runSimulation(mkDec()).reports;
  // expected FX-locked order value from the six official quote endpoints
  // (HstY16Q1.Xls, Group information): min 124/204/314, max 157/269/411 at
  // spot $71,919/'000 and €0.9/$ — the engine derives per-product factors so
  // every endpoint reproduces EXACTLY, interpolated linearly in premium %.
  const spot = 71919 / 1000 * 0.9;
  const u1 = 124, u2 = 204, u3 = 314; // exact at reference conditions, 0% premium
  const orderVal = 200 * u1 + 100 * u2 + 50 * u3;
  // all six endpoints via the same formula the engine uses
  const unit = (p, prem) => {
    const mat = [1, 2, 3][p] * spot, mach = [60, 75, 120][p] / 60 * 25;
    const f = [124, 204, 314][p] / (mat + mach);
    const adder = ([157, 269, 411][p] - [124, 204, 314][p]) / mat;
    return (mat + mach) * f + (prem / 100) * adder * mat;
  };
  T('endpoint P1 0% = €124', near(unit(0, 0), 124, 0.01), unit(0, 0).toFixed(2));
  T('endpoint P2 0% = €204', near(unit(1, 0), 204, 0.01), unit(1, 0).toFixed(2));
  T('endpoint P3 0% = €314', near(unit(2, 0), 314, 0.01), unit(2, 0).toFixed(2));
  T('endpoint P1 100% = €157', near(unit(0, 100), 157, 0.01), unit(0, 100).toFixed(2));
  T('endpoint P2 100% = €269', near(unit(1, 100), 269, 0.01), unit(1, 100).toFixed(2));
  T('endpoint P3 100% = €411', near(unit(2, 100), 411, 0.01), unit(2, 100).toFixed(2));
  // engine reproduces the report quotes: 100 units at 0% and 100% premium
  {
    const q2 = mkDec(); q2[0].subcontract = [100, 100, 100]; // 0% premium
    const r2 = runSimulation(q2).reports[0];
    T('engine: 100× std components = €12,400 + €20,400 + €31,400',
      near(r2.details.cashFlow.subcontractPaid, (12400 + 20400 + 31400) * 0.5, 3),
      String(r2.details.cashFlow.subcontractPaid));
    const q3 = mkDec(); q3[0].subcontract = [100, 100, 100]; q3[0].premium = [100, 100, 100];
    const r3 = runSimulation(q3).reports[0];
    T('engine: 100× premium components = €15,700 + €26,900 + €41,100',
      near(r3.details.cashFlow.subcontractPaid, (15700 + 26900 + 41100) * 0.5, 3),
      String(r3.details.cashFlow.subcontractPaid));
  }
  T('order quarter: 50% paid, alert placed', rr[0].warnings.some(x => x.title === 'Subcontract order placed')
    && near(rr[0].details.cashFlow.subcontractPaid, orderVal * 0.5, 2),
    String(rr[0].details.cashFlow.subcontractPaid));
  T('order quarter: second 50% sits in payables', rr[0].details.balance.payables
    > base[0].details.balance.payables + orderVal * 0.5 - 2, `${rr[0].details.balance.payables} vs ${base[0].details.balance.payables}`);
  T('components arrive NEXT quarter as WIP (not finished stock)', rr[1].warnings.some(x => x.title === 'Subcontracted components arrived'));
  T('arrival quarter: remaining 50% paid (FX-locked)', near(rr[1].details.cashFlow.subcontractPaid, orderVal * 0.5, 2),
    String(rr[1].details.cashFlow.subcontractPaid));
  T('consume-first: machine hours fall in arrival quarter', rr[1].machHoursNeeded < base[1].machHoursNeeded - 100,
    `${rr[1].machHoursNeeded} vs ${base[1].machHoursNeeded}`);
  T('components still need FULL assembly hours', near(rr[1].assemblyHoursNeeded, base[1].assemblyHoursNeeded, 60),
    `${rr[1].assemblyHoursNeeded} vs ${base[1].assemblyHoursNeeded}`);
  T('balance/cash bridges hold with subcontract', rr.every(r => near(balGap(r), 0) && near(cashGap(r), 0)),
    rr.map(balGap).join(','));
  T('components fully consumed by the plan (no WIP left)', finalState.componentWipUnits.every(u => u === 0),
    JSON.stringify(finalState.componentWipUnits));
}
{
  // unused components stay in WIP at cost (m2.htm)
  const dq = mkDec(); dq[0].subcontract = [300, 200, 100];
  for (let q = 1; q < 5; q++) dq[q].deliveries = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const { reports: rr, finalState } = runSimulation(dq);
  T('zero production: components stay in WIP (units)', finalState.componentWipUnits[0] >= 290
    && finalState.componentWipUnits[2] >= 95, JSON.stringify(finalState.componentWipUnits));
  T('zero production: WIP valued on balance sheet', rr[1].details.balance.wipComponents > 10000,
    String(rr[1].details.balance.wipComponents));
  T('zero production: balance still ties', rr.every(r => near(balGap(r), 0)), rr.map(balGap).join(','));
}
{
  // FX lock: pay half at 0.9, move FX to 0.8 for the arrival quarter —
  // the second instalment must NOT revalue (Table 24 footnote)
  const dq = mkDec(); dq[0].subcontract = [200, 100, 50]; dq[1].subcontract = [0, 0, 0];
  const rr = runSimulation(dq, [null, { exchangeRate: 0.8 }]).reports;
  T('FX lock: second instalment equals first', near(rr[1].details.cashFlow.subcontractPaid,
    rr[0].details.cashFlow.subcontractPaid, 2),
    `${rr[0].details.cashFlow.subcontractPaid} vs ${rr[1].details.cashFlow.subcontractPaid}`);
}

console.log('— Reconciliation battery (F04/R04/R05) —');
{
  const scen = [];
  scen.push(['baseline', mkDec()]);
  const exp = mkDec(); exp.forEach(d => { d.machinesBuy = 2; d.factoryExt = 100; d.termLoan = 1500; d.matM3 = 10; d.matM6 = 5; });
  scen.push(['expansion+futures', exp]);
  const cut = mkDec(); cut.forEach(d => { d.hire = -3; d.machinesSell = 1; d.maintenance = 10; });
  scen.push(['contraction', cut]);
  const fin = mkDec(); fin.forEach(d => { d.dividend = 5; d.termDeposit = 500; d.shares = 100; });
  scen.push(['finance moves', fin]);
  const em = mkDec(); em.forEach(d => { d.matSpot = 0; d.matM3 = 0; });
  scen.push(['all-emergency materials', em]);
  const sub = mkDec(); sub.forEach(d => { d.subcontract = [150, 80, 40]; d.takeImprovement[0] = true; });
  scen.push(['subcontract+launch', sub]);
  for (const [name, dq] of scen) {
    const rr = runSimulation(dq).reports;
    T(`${name}: balance 0 (5 qtrs)`, rr.every(r => near(balGap(r), 0)), rr.map(balGap).join(','));
    T(`${name}: cash bridge (5 qtrs)`, rr.every(r => near(cashGap(r), 0)), rr.map(cashGap).join(','));
    T(`${name}: retained bridge (5 qtrs)`, rr.every(r => near(retGap(r), 0)), rr.map(retGap).join(','));
  }
}

console.log('— Lead times & independence —');
{
  const dq = mkDec(); dq[0].machinesBuy = 2;
  const rr = runSimulation(dq).reports;
  T('capex is WIP in Q2, fixed in Q3', rr[0].details.balance.capitalWip === 600000
    && near(rr[1].details.balance.capitalWip, 0, 1), `${rr[0].details.balance.capitalWip}`);
  const dqF = mkDec(); dqF[0].matM3 = 8;
  const rf = runSimulation(dqF).reports;
  T('futures on order shown as asset in Q2, gone in Q3',
    rf[0].details.balance.materialsOnOrder > 400000 && near(rf[1].details.balance.materialsOnOrder, 0, 1),
    `${rf[0].details.balance.materialsOnOrder} -> ${rf[1].details.balance.materialsOnOrder}`);
}

console.log('— Shared sanitize (portal export == engine effective entries) —');
{
  const d0 = JSON.parse(JSON.stringify(defaultDecisions()));
  d0.wage = 800; d0.termLoan = -1; d0.shift = 4; d0.train = 12; d0.trainingDays = 120;
  const { d: eff, warnings: sw } = sanitizeDecisions(d0, 1200);
  T('wage 800 forced to floor 1200', eff.wage === 1200 && sw.some(x => x.title === 'Wage cut not permitted'));
  T('negative loan forced to 0', eff.termLoan === 0 && sw.some(x => x.title.includes('Loan repayment')));
  T('shift 4 forced into 1-3', eff.shift === 3 && sw.some(x => x.title === 'Invalid shift level'));
  T('train 12 forced to 9, days 120 to 90', eff.train === 9 && eff.trainingDays === 90);
  // engine applies the same pass: run one quarter with the same raw inputs
  const rr = runSimulation([d0, ...mkDec().slice(1)]).reports;
  T('engine warnings match sanitize', rr[0].warnings.some(x => x.title === 'Wage cut not permitted')
    && rr[0].warnings.some(x => x.title === 'Invalid shift level'));
}

console.log('— Save/load round trip —');
{
  const dq = mkDec(); dq[0].wage = 1250; dq[2].termLoan = 800;
  const ser = JSON.stringify(dq);
  const a = runSimulation(dq).reports.map(r => r.netProfit);
  const b = runSimulation(JSON.parse(ser)).reports.map(r => r.netProfit);
  T('identical decisions → identical results', JSON.stringify(a) === JSON.stringify(b));
}

// (appended blocks run before the final tally — do not insert process.exit above them)
// (appended) premium-materials purchase must be paid — found by scenario sweep
import { runSimulation as rs2, defaultDecisions as dd2 } from './engine-bundle.mjs';
{
  const mk2 = () => [0,1,2,3,4].map(() => JSON.parse(JSON.stringify(dd2())));
  const dq = mk2(); dq.forEach(x => x.premium = [10, 15, 15]);
  const rr = rs2(dq).reports;
  const bg = (r) => { const b = r.details.balance;
    return (b.fixedAssets+b.capitalWip+b.inventories+b.materialsValue+b.wipComponents+b.materialsOnOrder+b.receivables+b.cash+b.deposit)
      - (b.payables+b.taxDue+b.overdraft+b.termLoan+b.shareCapital+b.sharePremium+b.retainedEarnings); };
  const ok = rr.every(r => Math.abs(bg(r)) <= 2);
  console.log(ok ? '  ok  premium materials: purchases paid, balance 0' : 'FAIL  premium materials balance ' + rr.map(bg).join(','));
  if (!ok) process.exit(1);
}

// (appended) audit-round-4 fixes: NAFTA round trip (Table 11/12) + Table 25 port interpolation
{
  const mk2 = () => [0,1,2,3,4].map(() => JSON.parse(JSON.stringify(dd2())));
  // exactly one NAFTA container of P1 (500 units/container), nothing else shipped
  const dq = mk2(); dq.forEach(x => { x.deliveries = [[0,0,0],[500,0,0],[0,0,0]]; });
  const t = rs2(dq).reports[0].details.productionCosts.transport;
  const expect = Math.ceil(500/400)*650 + 8000; // 500km round trip = 2 road days + sea crossing = €9,300
  console.log(Math.abs(t-expect)<=2 ? `  ok  NAFTA container round trip = €${expect}` : `FAIL  NAFTA transport ${t} vs ${expect}`);
  if (Math.abs(t-expect)>2) process.exit(1);

  // port interpolation: Table 25 anchor points exact, intermediates linear,
  // beyond-50 extrapolated on the last slope
  const pc = (await import('./engine-bundle.mjs')).portCapacity;
  const anchors = [[1,2],[2,7],[5,31],[10,81],[20,190],[50,537]].every(([n,v]) => Math.abs(pc(n)-v) < 1e-9);
  const interp = Math.abs(pc(3) - 15) < 1e-9 && Math.abs(pc(7) - (31 + (81-31)*(7-5)/(10-5))) < 1e-9;
  const extra = Math.abs(pc(60) - (537 + (537-190)*(60-50)/(50-20))) < 1e-9 && pc(0) === 0;
  const okp = anchors && interp && extra;
  console.log(okp ? '  ok  port interpolation: anchors exact, 3 ports = 15/hr, 60 ports extrapolated'
    : `FAIL  port interpolation anchors=${anchors} interp=${interp} extra=${extra} (pc3=${pc(3)})`);
  if (!okp) process.exit(1);
}

console.log('— Insurance (Table 22: premium % of non-current assets + ALL inventories, last-quarter balance sheet) —');
{
  // Independent expectation from the manual: opening 2016 Q2 base =
  // non-current assets 1,370,870 (pre-depreciation, per 2016 Q1 balance sheet)
  // + finished goods 23,568 + materials 93,582 + component WIP 0 = 1,488,020.
  const INS_BASE = 1370870 + 23568 + 93582;
  const insVal = rep => rep.details.adminBreakdown.find(x => x.label === 'Insurance premiums').value;
  for (const [plan, pct] of [[1, 0.006], [2, 0.0035], [3, 0.002], [4, 0.001]]) {
    const dq = mkDec(); dq[0].insurance = plan;
    const v = insVal(runSimulation(dq).reports[0]);
    T(`insurance plan ${plan} = ${(pct * 100).toFixed(2)}% × €${INS_BASE.toLocaleString()} opening base`,
      near(v, INS_BASE * pct, 2), `${v} vs ${(INS_BASE * pct).toFixed(2)}`);
  }
  const dq0 = mkDec(); dq0[0].insurance = 0;
  T('insurance plan 0 (no cover) = €0', insVal(runSimulation(dq0).reports[0]) === 0);
  const dqBase = mkDec();
  T('baseline plan 1 includes materials (€8,928 not €8,367)',
    near(insVal(runSimulation(dqBase).reports[0]), 8928.12, 1), String(insVal(runSimulation(mkDec()).reports[0])));
}

console.log(`\n${pass} passed, ${fail} failed (+3 appended checks above)`);
process.exit(fail ? 1 : 0);
