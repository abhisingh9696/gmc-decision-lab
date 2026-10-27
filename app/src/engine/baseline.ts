// Baseline company state = end of 2016 Q1 (from the team's history files),
// i.e. the position from which the team's first decision (2016 Q2) starts.
import { P } from './params';
import { SOURCE } from './source-data';
import type { CompanyState, Decisions, EconAssumptions, Vec3 } from './types';

// Table 21 standard cost weight per product (material + machining + assembly content)
function fgStdWeight(p: number, fx: number): number {
  const matVal = P.matValuationDiscount
    * Math.min(P.matPriceSpotUSD, P.matPrice3mUSD, P.matPrice6mUSD) / 1000 * fx;
  return P.materialContent[p] * matVal
    + (P.machTimeMin[p] / 60) * P.fgValMachineRate
    + (P.minAssemblyMin[p] / 60) * P.fgValAssemblyRate;
}

// The Q1 report gives finished stock of €23,568 over 135 P1 / 9 P2 / 8 P3 units
// as ONE total. Table 21 values each product on its own content, so the total is
// split in proportion to each product's standard cost build-up — the total still
// ties to the report exactly, but P1/P2/P3 no longer share a common average.
function baselineProductFGValue(): Vec3 {
  const units = [135, 9, 8];
  const w = [0, 1, 2].map(p => fgStdWeight(p, 0.9));
  const denom = units.reduce((a, u, p) => a + u * w[p], 0);
  const total = 23568;
  return [0, 1, 2].map(p => total * (units[p] * w[p]) / denom) as Vec3;
}

export const QUARTERS = ['2016 Q2', '2016 Q3', '2016 Q4', '2017 Q1', '2017 Q2'];
export const SEASON_IDX = [1, 2, 3, 0, 1]; // season index per simulation quarter

export function baselineState(): CompanyState {
  const state: CompanyState = {
    quarterLabel: '2016 Q2',
    seasonIndex: 1,
    machines: 4,
    machineEfficiency: 95.1,
    machineValue: 1070870,
    assemblyWorkers: 21,
    machinists: 27,
    factoryArea: 500,
    landUnused: 300,
    machinesPipeline: 0,
    workersPipeline: 0,
    traineesPipeline: 0,
    factoryExtPipeline: 0,
    agentsPipeline: 0,
    portsPipeline: null,
    subcontractPipeline: [0, 0, 0],
    subcontractPipelineVal: [0, 0, 0],
    subcontractPayable: 0,
    matPipeline3: 0,
    matPipeline6: 0,
    materialsStock: 1720,
    componentWipUnits: [0, 0, 0],
    componentWipValue: [0, 0, 0],
    productStocks: [
      [110, 0, 0],
      [13, 9, 0],
      [12, 0, 8],
    ],
    backlog: [
      [0, 5, 6],
      [0, 0, 1],
      [0, 0, 0],
    ],
    agentsEU: 3,
    distNafta: 1,
    distNet: 1,
    ports: 5,
    cash: 826635,          // 1,976,635 total incl. 1,150,000 term deposit
    termDepositAmt: 1150000,
    receivables: 818125,
    payables: 326696,
    taxDue: 0,
    termLoanAmt: 0,
    shareCapital: 4000000,
    shareCapYearStart: 4000000, // 2016 opening issued capital (annual ±10% cap basis)
    sharesIssuedThisYear: 0,
    sharesRepurchasedThisYear: 0,
    retainedEarnings: -43916,
    sharePrice: 1.0801,
    machineryBoughtThisYear: 0,
    corpImage: [10, 5, 10], // = last quarter corporate ad spend (index base)
    webImage: 15,
    stars: [2, 3, 2],
    rdProgress: [25, 15, 15],
    cumDividends: 0,
    cumRepurchases: 0,
    cumIssues: 0,
    taxableCarryforward: -43916,
    improvementsAvailable: [true, false, false], // P1 major pending; P2 minor was consumed in 2016 Q1
    priorWage: 1200,
    overdraftLimit: 618000,
    borrowingPower: 1542000,   // per 2016 Q1 management report
    sharePremium: 0,
    finishedGoodsValue: 23568, // per 2016 Q1 report (= sum of productFGValue)
    productFGValue: baselineProductFGValue(),
    materialsValue: 93582,     // per 2016 Q1 report (Table 21 basis: 1,720 u × €54.41)
    matPipeline3Val: 0,
    matPipeline6Val: 0,
    buildingValue: 250000,
    capitalWip: 0,
    overdraft: 0,
    mgmtBudgetEffective: 70,   // €'000 — 2016 Q1 actual management budget
    mgmtBudgetPending: null,
  };
  // Report cells, not repeated hand-entered constants, drive the opening ledger.
  return { ...state, ...SOURCE.opening } as unknown as CompanyState;
}

// The decisions the previous management made for 2016 Q1 — used as the
// sensible default starting point for the team's first decision.
export function defaultDecisions(): Decisions {
  const d = structuredClone(SOURCE.sourceDecisions) as Decisions;
  // Explicit Q2 changes from historical Q1: do not repeat the consumed P2
  // improvement; buy market-share information for planning (€5,000).
  d.takeImprovement = [false, false, false];
  d.infoMarket = true;
  return d;
}

export function defaultEcon(seasonIdx: number): EconAssumptions {
  return {
    exchangeRate: SOURCE.context.exchangeRate,
    baseRate: SOURCE.context.baseRate,
    seasonality: [0.85, 0.95, 1.06, 1.38][seasonIdx],
    growth: 1.01,
    compPrices: structuredClone(SOURCE.sourceDecisions.prices) as EconAssumptions['compPrices'],
  };
}
