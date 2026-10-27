// 27-Table Compliance Register — one entry per official manual table.
// Each entry records: the source rule, where the engine implements it, when it
// applies, an INDEPENDENT expectation (derived from the manual/report, not from
// engine output), and the verification status.
// Statuses: VERIFIED (independent expectation tested) · PARTIAL (some cases
// tested) · UNVERIFIED (represented, not independently checked) · ASSUMPTION
// (official formula undisclosed — calibrated heuristic, cannot be verified).
import { writeFileSync } from 'node:fs';
import { runSimulation, defaultDecisions } from './engine-bundle.mjs';

const mk = () => [0, 1, 2, 3, 4].map(() => JSON.parse(JSON.stringify(defaultDecisions())));
const adm = (r, label) => r.details.adminBreakdown.find(x => x.label === label)?.value;

const REGISTER = [
  { t: 1, area: 'Demographics / market demand', status: 'ASSUMPTION',
    source: 'Manual Table 1 (population, segments)',
    engine: 'simulate.ts demand block (calibrated heuristic)',
    note: 'Official demand function undisclosed. Calibrated to 2016 Q1 report orders; can never be fully verified.' },
  { t: 2, area: 'Information costs', status: 'VERIFIED',
    source: 'Table 2: market shares €5,000; competitor activity €7,500',
    engine: 'params.ts infoMarketCost/infoCompetitorsCost',
    expectation: 'Q2 admin breakdown: Business intelligence €12,500 with both purchased',
    check: () => adm(runSimulation(mk()).reports[0], 'Business intelligence') === 12500 },
  { t: 3, area: 'Agent costs & changes', status: 'PARTIAL',
    source: 'Table 3 (support, commission, appointment/dismissal)',
    engine: 'simulate-fin.ts agentsCost',
    note: 'Steady-state costs verified via Q2 reconciliation; appoint/dismiss transition costs untested.' },
  { t: 4, area: 'Internet costs', status: 'PARTIAL',
    source: 'Table 4 (ISP, ports, opening/closure)',
    engine: 'simulate-fin.ts ispCost + port interpolation',
    expectation: 'Port interpolation anchors exact (engine-tests port block)',
    note: 'Opening/closure costs untested.' },
  { t: 5, area: 'Production requirements', status: 'PARTIAL',
    source: 'Table 5 (materials, machining, assembly per product)',
    engine: 'params.ts materialContent/machTimeMin/assembly',
    note: 'Selected products verified; full matrix not independently traced.' },
  { t: 6, area: 'Maintenance', status: 'PARTIAL',
    source: 'Table 6 (cost & efficiency response)',
    engine: 'simulate.ts efficiency dynamics',
    note: 'Cost verified; breakdown events are stochastic — untestable deterministically.' },
  { t: 7, area: 'Machine shifts', status: 'PARTIAL',
    source: 'Table 7 (shift capacity & manning)',
    engine: 'params.ts shift capacity tables',
    note: 'Capacity checks verified; every shift/constraint combination not exhaustively checked.' },
  { t: 8, area: 'Scrap / rejects', status: 'PARTIAL',
    source: 'Table 8 (reject rates)',
    engine: 'simulate.ts rejectRate',
    expectation: 'Rejects ~3–4% and good+rejects=gross identity (engine-tests)',
    note: 'Product-specific rates not independently traced.' },
  { t: 9, area: 'Warranty / guarantee', status: 'PARTIAL',
    source: 'Table 9 (guarantee servicing)',
    engine: 'simulate-fin.ts guaranteeCost',
    note: 'Q2 amount reconciles; product-specific rates untested.' },
  { t: 10, area: 'Production expenses', status: 'PARTIAL',
    source: 'Table 10 (running costs)',
    engine: 'simulate-fin.ts production payroll & running',
    note: 'Total reconciles; line-level composition not independently verified.' },
  { t: 11, area: 'Containers', status: 'PARTIAL',
    source: 'Table 11 (container capacity per product)',
    engine: 'params.ts containerCap + ContainerFill UI',
    expectation: 'NAFTA container round trip = €9,300 (engine-tests)' },
  { t: 12, area: 'Transport / freight', status: 'PARTIAL',
    source: 'Table 12 (freight rates per route)',
    engine: 'simulate-fin.ts transportCost',
    expectation: 'NAFTA round trip tested; remaining routes untested' },
  { t: 13, area: 'Purchasing & warehousing', status: 'PARTIAL',
    source: 'Table 13: purchasing admin €7,500; unplanned +10%; premium +50%; external storage €2.50/material unit, €3.00/component',
    engine: 'params.ts purchasingAdmin, unplannedPremium, premiumMaterialsPremium, storage rates',
    expectation: 'Q2 Purchasing & warehousing = €7,500 + storage charges (reconciles in baseline)',
    check: () => adm(runSimulation(mk()).reports[0], 'Purchasing & warehousing') === Math.round(7500 + ((110+15)/2 + (20+5)/2)*3.5 + (22+4)/2*4*.9),
    note: 'Emergency +10% tested. External-storage overflow paths partially tested.' },
  { t: 14, area: 'Average stocks', status: 'PARTIAL',
    source: 'Table 14: 0.5 × (opening + closing)',
    engine: 'used wherever averages required',
    note: 'Formula pinned; each usage site not separately audited.' },
  { t: 15, area: 'Personnel costs', status: 'PARTIAL',
    source: 'Table 15: recruit 2000/1000; dismiss 5000/2000; train 8500; consultant €1,000/day',
    engine: 'params.ts hire/dismiss/train/consultant costs',
    note: 'Amounts reconcile in Q2; combined multi-action quarters untested.' },
  { t: 16, area: 'Overtime', status: 'PARTIAL',
    source: 'Table 16 (Saturday 1.5×, Sunday 2× premiums)',
    engine: 'simulate-fin.ts assemblyTiers costing',
    note: 'Tier selection tested; full overtime cost curve not independently verified.' },
  { t: 17, area: 'Minimum pay & parity', status: 'PARTIAL',
    source: 'Table 17 (wage floor, no wage cuts)',
    engine: 'sanitize.ts wage floor chain',
    expectation: 'Wage cut blocked + adjustment warning (engine-tests effective-decisions block)',
    note: 'Parity/minimum-pay edge cases untested.' },
  { t: 18, area: 'Machinery purchase/disposal/depreciation', status: 'PARTIAL',
    source: 'Table 18 (prices, disposal values, 2.5% quarterly depreciation)',
    engine: 'simulate-fin.ts machine buy/sell + depreciation',
    expectation: 'Machine sale balance-tie tested; disposal-value combinations untested' },
  { t: 19, area: 'Financial limits', status: 'PARTIAL',
    source: 'Table 19 (overdraft limit & borrowing power formulas)',
    engine: 'simulate-fin.ts overdraftLimit/borrowingPower',
    expectation: 'Opening 2016 Q2 authorised overdraft = reported €618,000 (engine-tests + Q2 reconciliation)',
    note: 'Official Q1 report prints the limit ROUNDED to €1,000 (618,000 vs computed 618,192) and borrowing power 1,542,000 — the latter implies the OFFICIAL share price after Q1 was exactly €1.08 (MV €4,320,000): an observation; the report limit is rounded while share price is 1.0801, so no exact hidden price can be inferred (official NAV/share 0.989, sentiment 1.092). Engine keeps € precision — immaterial (±€200), single data point, not worth rounding code.' },
  { t: 20, area: 'Taxes & interest', status: 'PARTIAL',
    source: 'Table 20 (25% tax at Q4, paid next Q2; deposit/loan/overdraft rates)',
    engine: 'simulate-fin.ts tax & interest blocks',
    expectation: 'Deposit interest Q2 = €2,875 (engine-tests); loss-carryforward tested',
    note: 'Full boundary coverage (negative PBT chains, mid-quarter rate changes) incomplete.' },
  { t: 21, area: 'Inventory valuation', status: 'PARTIAL',
    source: 'Table 21: 90% lowest quote for materials held/on order; components at purchase cost; FG at 110% content standard with weighted carry-forward',
    engine: 'simulate-fin.ts manual-standard branch; model-options.ts retains legacy cost pool for uncertainty tests',
    expectation: 'Independent per-product closing calculation and futures asset/cash tests pass in re-audit-v2.mjs',
    note: 'Additive shift-premium interpretation. Independent five-period history trace still differs about 0.8–2.1% after startup; opening per-product split is estimated. Do not call exact historical matching or certification.' },
  { t: 22, area: 'Insurance', status: 'PARTIAL',
    source: 'Table 22: premium % of "non-current assets and inventories, taken from last quarter\'s balance sheet"; m2.htm confirms materials in warehouse/transit are insured risks',
    engine: 'simulate-fin.ts insurancePremium (opening NCA + FG + materials + component WIP)',
    expectation: 'Q2 Plan 1 = 0.60% × (1,370,870 + 23,568 + 93,582) = €8,928.12 — engine-tests insurance block, all 5 plans',
    check: () => Math.abs(adm(runSimulation(mk()).reports[0], 'Insurance premiums') - 8928.12) < 1,
    note: 'FIXED 2026-10-23: materials inventory was omitted (charged €8,367). CROSS-VERIFIED against the official Q1 report: premium €9,153 = 0.60% × (opening NCA €1,398,328 + opening inventories €127,328) exactly. Claims side UNVERIFIED — official Q1 shows a real event (claimed €3,660, receipts €2,135, uninsured €1,525); our risk model is uncalibrated against it.' },
  { t: 23, area: 'Customer collections', status: 'PARTIAL',
    source: 'Table 23: internet 0d, EU agents 60d, NAFTA 90d',
    engine: 'simulate-fin.ts receivables roll-forward',
    note: 'Cash flows reconcile to €0 gap; each collection lag not independently verified.' },
  { t: 24, area: 'Supplier payments', status: 'PARTIAL',
    source: 'Table 24 (payment timing incl. subcontract 50/50 FX-locked)',
    engine: 'simulate-fin.ts payables + subcontract payment split',
    expectation: 'Subcontract 50/50 split verified at all six endpoints (engine-tests)' },
  { t: 25, area: 'Website throughput', status: 'PARTIAL',
    source: 'Table 25 (visits per port)',
    engine: 'simulate.ts port capacity curve',
    expectation: 'Interpolation anchors + extrapolation tested; full curve shape unverified' },
  { t: 26, area: 'Factory space', status: 'PARTIAL',
    source: 'Table 26 (space per machine/1000 units, extension limits)',
    engine: 'simulate-fin.ts spaceNeeded/spaceAvail + refusal warnings',
    note: 'Warnings tested; occupancy and expansion limit combinations untested.' },
  { t: 27, area: 'Carbon emissions', status: 'PARTIAL',
    source: 'Table 27 (emission coefficients)',
    engine: 'simulate-fin.ts carbonTonnes',
    note: 'Factory 9.5 kg/m², machining 2.82 kg/physical hour and assembly 0.47 kg/hour. Using displayed Q1 hours gives 19.46617 tonnes, versus source 21.03172: unexplained 1.56555 tonnes. Coefficients match Table 27; historical timing/base remains UNVERIFIED, not forced to match.' },
];

console.log('TABLE  STATUS       AREA');
console.log('-----  -----------  ----');
let fails = 0;
for (const e of REGISTER) {
  let res = '';
  if (e.check) {
    try { res = e.check() ? ' [check PASS]' : ' [check FAIL]'; if (res.includes('FAIL')) fails++; }
    catch (err) { res = ` [check ERROR ${err.message}]`; fails++; }
  }
  console.log(`T${String(e.t).padStart(2)}   ${e.status.padEnd(11)} ${e.area}${res}`);
}
const counts = REGISTER.reduce((a, e) => ({ ...a, [e.status]: (a[e.status] ?? 0) + 1 }), {});
console.log('\nSummary:', Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' · '), `· total ${REGISTER.length}`);
writeFileSync('public/audit/table-register.json',JSON.stringify(REGISTER.map(({check,...e})=>({...e,check:check?(check()?'PASS':'FAIL'):'not independently executable'})),null,2));
process.exit(fails ? 1 : 0);
