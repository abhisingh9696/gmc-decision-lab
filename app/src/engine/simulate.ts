import { resolveModel, type ResolvedModel } from './model-options';
// Core quarterly simulation engine.
// Capacity / cost / cash-flow math follows the published GMC manual tables.
// The DEMAND side is a calibrated heuristic (the official formulas are secret):
// Its base is anchored to actual Q1 orders. The evolving model is not an
// independent backtest of the historical periods; it
// then flexes with price, advertising, quality, channel support, FX, seasonality.
import { P } from './params';
import { DECISION_FIELDS, fieldValue, setField, validDecisions } from './decision-schema';
import type {
  CompanyState, Decisions, EconAssumptions, QuarterReport, Warning, Mat3x3, Vec3,
} from './types';

const M = 3; // markets
const PR = 3; // products
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const clone3 = (m: Mat3x3): Mat3x3 => [[...m[0]], [...m[1]], [...m[2]]] as Mat3x3;
const eur = (n: number) => Math.round(n);

// Table 25 effective visits/hour with linear interpolation between the
// published queuing points (and a straight-line extrapolation above 50 ports).
export function portCapacity(ports: number): number {
  const pts = P.portCapacity;
  if (ports <= pts[0][0]) return Math.max(0, ports / pts[0][0]) * pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (ports <= pts[i][0]) {
      const [x0, y0] = pts[i - 1]; const [x1, y1] = pts[i];
      return y0 + (y1 - y0) * (ports - x0) / (x1 - x0);
    }
  }
  const [x0, y0] = pts[pts.length - 2]; const [x1, y1] = pts[pts.length - 1];
  return y1 + (y1 - y0) * (ports - x1) / (x1 - x0);
}

interface SimOut { state: CompanyState; report: QuarterReport; }

// ---------- INPUT VALIDATION (official limits, dtable.htm) ----------
// Shared by the engine AND the portal export, so what you see exported is
// exactly what the simulator would run. Invalid values are transparently
// adjusted BEFORE any calculation, with a warning.
export function sanitizeDecisions(dIn: Decisions, priorWage: number): { d: Decisions; warnings: Warning[] } {
  const warnings: Warning[] = [];
  if (!validDecisions(dIn)) throw new Error("Decisions require all 75 finite, correctly shaped fields.");
  const d = structuredClone(dIn);
  if (d.wage < P.minWageCents || d.wage < priorWage) {
    const floor = Math.max(P.minWageCents, priorWage);
    warnings.push({ severity: 'critical', title: 'Wage cut not permitted', adjustment: true,
      detail: `Assembly wages cannot be cut below last quarter's effective rate (and never below €9.00/hr). Forced from ${d.wage} to ${floor} cents.` });
    d.wage = floor;
  }
  if (d.shift < 1 || d.shift > 3) {
    warnings.push({ severity: 'critical', title: 'Invalid shift level', adjustment: true,
      detail: `Shift must be 1, 2 or 3. Forced from ${d.shift} into range.` });
    d.shift = clamp(Math.round(d.shift), 1, 3) as 1 | 2 | 3;
  }
  if (d.train < 0 || d.train > 9) {
    warnings.push({ severity: 'warn', title: 'Training quota adjusted', adjustment: true,
      detail: `Workers to train must be 0–9 per quarter. Forced from ${d.train} into range.` });
    d.train = clamp(Math.round(d.train), 0, 9);
  }
  if (d.trainingDays < 0 || d.trainingDays > 90) {
    warnings.push({ severity: 'warn', title: 'Consultant days adjusted', adjustment: true,
      detail: `Staff training consultant days must be 0–90. Forced from ${d.trainingDays} into range.` });
    d.trainingDays = clamp(Math.round(d.trainingDays), 0, 90);
  }
  if (d.termLoan < 0) {
    warnings.push({ severity: 'warn', title: 'Loan repayment not via this field', adjustment: true,
      detail: 'The decision sheet only accepts new borrowing (0 or more). Negative entry forced to 0.' });
    d.termLoan = 0;
  }
  for (const f of DECISION_FIELDS) {
    if (f.boolean) continue;
    const requested = fieldValue(d, f.path) as number;
    const effective = clamp(Math.round(requested), f.min, f.max);
    if (requested !== effective) {
      setField(d, f.path, effective);
      warnings.push({severity:'critical',title:'Official input limit',adjustment:true,
        detail:`${f.label}: requested ${requested}; effective ${effective} (integer range ${f.min}–${f.max}).`});
    }
  }
  return { d, warnings };
}

export function simulateQuarter(prev: CompanyState, dIn: Decisions, econ: EconAssumptions, model: ResolvedModel=resolveModel()): SimOut {
  const sv = sanitizeDecisions(dIn, prev.priorWage);
  const w: Warning[] = [...sv.warnings];
  const d = sv.d;
  const s: CompanyState = { ...prev,
    productStocks: clone3(prev.productStocks), backlog: clone3(prev.backlog),
    corpImage: [...prev.corpImage] as Vec3, stars: [...prev.stars] as Vec3,
    rdProgress: [...prev.rdProgress] as Vec3,
    subcontractPipeline: [...prev.subcontractPipeline] as Vec3,
    subcontractPipelineVal: [...prev.subcontractPipelineVal] as Vec3,
    componentWipUnits: [...prev.componentWipUnits] as Vec3,
    componentWipValue: [...prev.componentWipValue] as Vec3,
    improvementsAvailable: [...prev.improvementsAvailable] as [boolean, boolean, boolean],
    productFGValue: [...prev.productFGValue] as Vec3,
  };

  // ---------- MANAGEMENT BUDGET (more.htm: reductions need ONE QUARTER'S
  // NOTICE and may not exceed 10% per quarter; increases take effect at once) ----------
  s.mgmtBudgetEffective = prev.mgmtBudgetPending != null ? prev.mgmtBudgetPending : prev.mgmtBudgetEffective;
  s.mgmtBudgetPending = null;
  if (d.mgmtBudget < s.mgmtBudgetEffective) {
    const noticeFloor = Math.ceil(s.mgmtBudgetEffective * 0.9);
    s.mgmtBudgetPending = Math.max(d.mgmtBudget, noticeFloor);
    w.push({ severity: 'warn', title: 'Management budget cut deferred', adjustment: true,
      detail: `Reductions need one quarter's notice and are capped at 10% per quarter. This quarter stays at €${s.mgmtBudgetEffective}k; €${s.mgmtBudgetPending}k takes effect next quarter.` });
  } else if (d.mgmtBudget > s.mgmtBudgetEffective) {
    s.mgmtBudgetEffective = d.mgmtBudget; // increases apply immediately
  }

  s.machineCohorts = prev.machineCohorts ? prev.machineCohorts.map(c => ({...c}))
    : (s.machines ? [{count:s.machines,value:s.machineValue}] : []);
  if(s.machinesPipeline) s.machineCohorts.push({count:s.machinesPipeline,value:s.machinesPipeline*P.machineCost});
  // ---------- 0. Arrivals from pipelines (decisions made last quarter) ----------
  // capital work-in-progress converts to fixed assets on arrival
  s.machineValue += s.machinesPipeline * P.machineCost;
  s.buildingValue += s.factoryExtPipeline * P.buildingCostPerSqm;
  s.capitalWip = Math.max(0, s.capitalWip - s.machinesPipeline * P.machineCost - s.factoryExtPipeline * P.buildingCostPerSqm);
  s.machines += s.machinesPipeline; s.machinesPipeline = 0;
  s.assemblyWorkers += s.workersPipeline + s.traineesPipeline;
  s.workersPipeline = 0; s.traineesPipeline = 0;
  s.factoryArea += s.factoryExtPipeline; s.factoryExtPipeline = 0;
  s.agentsEU += s.agentsPipeline; s.agentsPipeline = 0;
  const wasInternetOpen=s.ports>0;
  if(s.portsPipeline!==null)s.ports=s.portsPipeline;
  s.portsPipeline=null;
  s.distNet=s.ports>0?1:0;
  const internetChange: 'none'|'open'|'close' = wasInternetOpen===(s.ports>0)?'none':s.ports>0?'open':'close';
  if(d.hire < -s.assemblyWorkers) {
    w.push({severity:'critical',title:'Dismissal capped',adjustment:true,detail:`Only ${s.assemblyWorkers} assembly workers are available; dismissal reduced to that number.`});
    d.hire=-s.assemblyWorkers;
  }
  for(let m=0;m<3;m++)if([s.agentsEU,s.distNafta,s.distNet][m]===0)for(let p=0;p<3;p++)if(d.deliveries[m][p]>0){
    w.push({severity:'critical',title:'No active sales channel',adjustment:true,detail:`Market ${['EU','NAFTA','NET'][m]} P${p+1}: delivery forced to zero because no agent/distributor is active.`});
    d.deliveries[m][p]=0;
  }
  // subcontracted COMPONENTS ordered last quarter arrive now (m2.htm): they are
  // machined components, NOT finished goods — they enter work-in-progress stock
  // at their FX-locked purchase cost and still need assembly before sale.
  const subcontractArriving = [...s.subcontractPipeline] as Vec3;
  const subcontractArrivingVal = [...s.subcontractPipelineVal] as Vec3;
  s.subcontractPipeline = [0, 0, 0];
  s.subcontractPipelineVal = [0, 0, 0];
  const subcontractTotal = subcontractArriving.reduce((a, b) => a + b, 0);
  if (subcontractTotal > 0) {
    for (let p = 0; p < PR; p++) {
      s.componentWipUnits[p] += subcontractArriving[p];
      s.componentWipValue[p] += subcontractArrivingVal[p];
    }
    w.push({ severity: 'info', title: 'Subcontracted components arrived',
      detail: `${eur(subcontractTotal)} machined components delivered into work-in-progress (€${eur(subcontractArrivingVal.reduce((a, b) => a + b, 0)).toLocaleString()} at order-locked cost). They still need assembly labour this quarter; anything unused stays in WIP for later.` });
  }
  // Physical space and opening credit restrict assets and future hires before
  // fees are charged. Materials/components may use external warehouses;
  // machines and people require actual factory floor area.
  const orderCredit=Math.max(0,s.borrowingPower+s.cash-s.overdraft+s.termDepositAmt);
  let acceptedBuy=Math.min(d.machinesBuy,Math.floor(orderCredit/P.machineCost));
  let acceptedExt=Math.min(d.factoryExt,s.landUnused,Math.floor(Math.max(0,orderCredit-acceptedBuy*P.machineCost)/P.buildingCostPerSqm));
  const futureWorkers=s.assemblyWorkers+Math.min(0,d.hire);
  const soldMachines=Math.min(d.machinesSell,s.machines);
  const buySpace=Math.max(0,Math.floor(((s.factoryArea+acceptedExt)*P.factoryUseMax-futureWorkers*P.sqmPerWorker)/P.sqmPerMachine)-(s.machines-soldMachines));
  acceptedBuy=Math.min(acceptedBuy,buySpace);
  acceptedExt=Math.min(d.factoryExt,s.landUnused,Math.floor(Math.max(0,orderCredit-acceptedBuy*P.machineCost)/P.buildingCostPerSqm));
  for(const [key,value]of [['machinesBuy',acceptedBuy],['factoryExt',acceptedExt]]as const)if(d[key]!==value){
    w.push({severity:'critical',title:'Capital order capped',adjustment:true,detail:`${key}: requested ${d[key]}, accepted ${value}; limited by opening credit, land or factory floor space.`});d[key]=value;
  }
  const futureMachines=s.machines-soldMachines+d.machinesBuy;
  let hiringRoom=Math.max(0,Math.floor(((s.factoryArea+d.factoryExt)*P.factoryUseMax-futureMachines*P.sqmPerMachine)/P.sqmPerWorker)-futureWorkers);
  if(d.hire>hiringRoom){w.push({severity:'critical',title:'Recruitment limited by factory space',adjustment:true,detail:`Requested ${d.hire} new assembly workers; room for ${hiringRoom}. Effective hiring reduced before fees and next-quarter arrival.`});d.hire=hiringRoom;}
  hiringRoom-=Math.max(0,d.hire);
  if(d.train>hiringRoom){w.push({severity:'critical',title:'Training limited by factory space',adjustment:true,detail:`Requested ${d.train} trainees; room for ${hiringRoom}. Effective training reduced before fees and arrival.`});d.train=hiringRoom;}
  // Sold machines leave production at the START of this quarter.
  const soldNow=Math.min(d.machinesSell,s.machines);
  if(soldNow!==d.machinesSell) w.push({severity:'critical',title:'Machine sale capped',adjustment:true,detail:`Requested ${d.machinesSell}; effective ${soldNow}.`});
  d.machinesSell=soldNow;
  let remainingSale=soldNow, machineSaleProceeds=0;
  for(const cohort of s.machineCohorts!) {
    const count=Math.min(remainingSale,cohort.count);
    const value=cohort.count ? cohort.value*count/cohort.count : 0;
    cohort.count-=count;cohort.value-=value;remainingSale-=count;machineSaleProceeds+=value;
  }
  s.machineCohorts=s.machineCohorts!.filter(c=>c.count>0);
  s.machines-=soldNow;s.machineValue-=machineSaleProceeds;
  const decommissionCost=soldNow*P.decommissionCharge;
  const blockedMachineArea=soldNow*P.sqmPerMachine;
  s.priorWage = d.wage; // effective wage becomes next quarter's floor

  // ---------- 1. DEMAND ----------
  const fxFactor = Math.pow(econ.exchangeRate / P.fxRef, 1.0); // weaker euro => more Nafta/Net demand
  const orders: Mat3x3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

  // corporate image accumulates with spending
  for (let m = 0; m < M; m++) {
    const refCorp = P.refAdvCorp[m];
    const spendRatio = refCorp > 0 ? d.advCorp[m] / refCorp : 1;
    s.corpImage[m] = 0.7 * s.corpImage[m] + 0.3 * refCorp * spendRatio;
  }

  // ---------- 2b. PRODUCT IMPROVEMENT LAUNCH ----------
  // Manual (more.htm): a major launch renders old models obsolete — opening stock
  // of the old version is liquidated at valuation OUTSIDE the normal markets.
  // An unavailable launch still disposes of the stock, but without the quality gain.
  let obsoleteUnits = 0;
  const obsoleteByProduct: Vec3 = [0, 0, 0];
  for (let p = 0; p < PR; p++) {
    if (!d.takeImprovement[p]) continue;
    const oldUnits = s.productStocks[0][p] + s.productStocks[1][p] + s.productStocks[2][p];
    if (oldUnits > 0) {
      s.productStocks[0][p] = 0; s.productStocks[1][p] = 0; s.productStocks[2][p] = 0;
      obsoleteUnits += oldUnits;
      obsoleteByProduct[p] = oldUnits;
    }
    if (s.improvementsAvailable[p]) {
      s.improvementsAvailable[p] = false;
      s.rdProgress[p] = 0; // consume legacy completed-project progress before new spending
      s.stars[p] = clamp(s.stars[p] + 0.6, 1, 5);
      w.push({ severity: 'info', title: `P${p + 1} improvement launched`,
        detail: `${eur(oldUnits)} obsolete units liquidated at valuation outside normal markets (see cash flow). Star rating improved; the improvement is now consumed.` });
    } else {
      w.push({ severity: 'warn', title: `No P${p + 1} improvement available`,
        detail: `No completed R&D improvement to take up — ${eur(oldUnits)} old units disposed of WITHOUT the quality benefit. The official sim would star this decision.` });
    }
  }

  // product stars drift with quality inputs
  for (let p = 0; p < PR; p++) {
    const timeRatio = d.assemblyTimes[p] / P.minAssemblyMin[p];
    const premBoost = d.premium[p] / 100;
    const target = clamp(1.2 + 2.2 * clamp(timeRatio - 1, 0, 0.35) / 0.35 + 1.4 * premBoost
      + (s.rdProgress[p] > 60 ? 0.4 : s.rdProgress[p] > 30 ? 0.2 : 0), 1, 5);
    s.stars[p] = clamp(0.75 * s.stars[p] + 0.25 * target, 1, 5);
    s.rdProgress[p] += d.rd[p];
  }
  s.webImage = 0.7 * s.webImage + 0.3 * d.webDev;
  const webStars = clamp(1 + s.webImage / 15, 1, 5);

  for (let m = 0; m < M; m++) {
    for (let p = 0; p < PR; p++) {
      if (d.prices[m][p] <= 0 || [s.agentsEU,s.distNafta,s.distNet][m]===0) { orders[m][p] = 0; continue; }
      const compP = econ.compPrices[m][p] > 0 ? econ.compPrices[m][p] : d.prices[m][p];
      const relPrice = d.prices[m][p] / compP;
      let fPrice = Math.pow(relPrice, P.priceElasticity[p]*model.demandElasticityScale);
      if (relPrice < 0.72) fPrice *= 0.75; // public suspicious of very low prices
      const fAdv = 1 + 0.35 * (Math.sqrt(Math.max(0, d.advProd[m][p]) / Math.max(1,P.refAdvProd[m][p])) - 1);
      const fCorp = 1 + 0.22 * (s.corpImage[m] / P.refAdvCorp[m] - 1);
      const fQual = 1 + 0.10 * (s.stars[p] - P.refStars[p]);
      let fChan = 1;
      if (m === 0) {
        fChan = clamp(Math.sqrt(Math.max(0.2, s.agentsEU) / P.refAgents.n)
          * Math.sqrt(Math.max(1, d.agentsEU.support) / P.refAgents.support)
          * Math.pow(Math.max(1, d.agentsEU.commission) / P.refAgents.comm, 0.5), 0.25, 1.35);
      } else if (m === 1) {
        fChan = clamp(Math.sqrt(Math.max(0.2, s.distNafta) / P.refDist.n)
          * Math.sqrt(Math.max(1, d.distNafta.support) / P.refDist.support)
          * Math.pow(Math.max(1, d.distNafta.commission) / P.refDist.comm, 0.5), 0.25, 1.3)
          * fxFactor;
      } else {
        const fWeb = 1 + 0.12 * (webStars - 2);
        fChan = clamp(Math.sqrt(Math.max(1, d.distNet.support) / P.refNetDist.support)
          * Math.pow(Math.max(1, d.distNet.commission) / P.refNetDist.comm, 0.5), 0.3, 1.25)
          * fWeb * fxFactor;
      }
      orders[m][p] = eur(P.baseDemand[m][p] * econ.seasonality * econ.growth
        * fPrice * fAdv * fCorp * fQual * fChan);
    }
  }

  // website capacity -> failed visits eat internet demand
  // Table 25 gives effective capacity at 1/2/5/10/20/50 ports; intermediate
  // counts are linearly interpolated (beyond 50: extrapolated on the last slope).
  const netVisits = (orders[2][0] + orders[2][1] + orders[2][2]) * 9; // ~9 visits per order (calibrated)
  const capVisitsHr = portCapacity(s.ports);
  const capacityVisits = capVisitsHr * 24 * 90;
  const failedVisitsPct = clamp((netVisits - capacityVisits) / Math.max(1, netVisits) * 100 * 4, 0, 40);
  if (failedVisitsPct > 0) {
    for (let p = 0; p < PR; p++) orders[2][p] = eur(orders[2][p] * (1 - failedVisitsPct / 100));
  }
  if (failedVisitsPct > 5) w.push({ severity: 'warn', title: 'Website congested',
    detail: `~${failedVisitsPct.toFixed(0)}% of website visits fail with ${s.ports} ports. Add ports or expect lost internet orders and image damage.` });

  // ---------- 2. PRODUCTION ----------
  // target = planned GOOD units; gross starts add a reject allowance (R06).
  // Historical reference: 87 rejects / 2,912 gross = 2.99% (2016 Q1 actual).
  const recalled: Vec3 = [0,0,0];
  for (let p=0;p<3;p++) {
    let room = [0,1,2].reduce((a,m)=>a+Math.max(0,d.deliveries[m][p]),0);
    for (const m of [0,2]) if (d.deliveries[m][p]<0) {
      const requested=-d.deliveries[m][p];
      const actual=d.takeImprovement[p]?0:Math.min(requested,s.productStocks[m][p],room);
      s.productStocks[m][p]-=actual; recalled[p]+=actual; room-=actual;
      d.deliveries[m][p]=-actual;
      w.push({severity:actual<requested?'warn':'info',title:'Stock redistribution',adjustment:actual<requested,
        detail:`${m===0?'EU':'NET'} P${p+1}: ${actual} units returned and redistributed to positive delivery destinations. Limited by opening stock and requested destinations; launching a new model prevents old-stock redistribution. Return-leg freight is approximated by the outbound route model.`});
    }
  }
  const planTotal: Vec3 = [0,1,2].map(p=>[0,1,2].reduce((a,m)=>a+Math.max(0,d.deliveries[m][p]),0)-recalled[p]) as Vec3;

  // reject rate falls with assembly time, premium materials, training
  const rejectRate: Vec3 = [0, 0, 0];
  for (let p = 0; p < PR; p++) {
    const qualityFactor = clamp(1.35 - 0.5 * (d.assemblyTimes[p] / P.minAssemblyMin[p] - 1)
      - 0.5 * d.premium[p] / 100 - 0.002 * d.trainingDays, 0.4, 1.5);
    rejectRate[p] = P.rejectBaseRate * qualityFactor;
  }
  const grossStarts: Vec3 = [0, 1, 2].map(p =>
    Math.ceil(planTotal[p] / Math.max(0.5, 1 - rejectRate[p]))) as Vec3;

  const machHoursAvail = s.machines * P.shiftMachHours[d.shift] * (s.machineEfficiency / 100);
  // Assembly is single-shift with AUTOMATIC overtime tiers (more.htm):
  // 420 basic + 84 Saturday + 72 Sunday hours per worker, less 3% absence.
  const att = P.assemblyAttendance;
  const asmBasicAvail = s.assemblyWorkers * P.assemblyBasicHours * att;
  const asmSatAvail = s.assemblyWorkers * P.assemblySaturdayHours * att;
  const asmSunAvail = s.assemblyWorkers * P.assemblySundayHours * att;
  const assemblyHoursAvail = asmBasicAvail + asmSatAvail + asmSunAvail;

  // m2.htm SUBCONTRACTING: "your operations department will use any outsourced
  // components first. If required, machining will then be used to complete the
  // schedule." Component-sourced units need NO machine hours and NO materials —
  // but they DO need the full assembly time.
  const compPlan: Vec3 = [0, 1, 2].map(p =>
    Math.min(s.componentWipUnits[p], grossStarts[p])) as Vec3;
  const machinedPlan: Vec3 = [0, 1, 2].map(p => grossStarts[p] - compPlan[p]) as Vec3;

  const machHoursNeeded = machinedPlan.reduce((a, q, p) => a + q * P.machTimeMin[p] / 60, 0);
  const assemblyHoursNeeded = grossStarts.reduce((a, q, p) => a + q * d.assemblyTimes[p] / 60, 0);
  const materialsNeeded = machinedPlan.reduce((a, q, p) => a + q * P.materialContent[p], 0);
  const capRatio = Math.min(
    machHoursNeeded > 0 ? machHoursAvail / machHoursNeeded : 1,
    assemblyHoursNeeded > 0 ? assemblyHoursAvail / assemblyHoursNeeded : 1,
    1);
  const productionScaled = capRatio < 0.999;
  if (productionScaled) {
    const binding = machHoursAvail / Math.max(1, machHoursNeeded) < assemblyHoursAvail / Math.max(1, assemblyHoursNeeded)
      ? `machine shop (${eur(machHoursAvail)} of ${eur(machHoursNeeded)} hrs)` : `assembly (${eur(assemblyHoursAvail)} of ${eur(assemblyHoursNeeded)} hrs)`;
    w.push({ severity: 'critical', title: 'Production plan exceeds capacity',
      detail: `Plan cut ~${((1 - capRatio) * 100).toFixed(0)}% — binding constraint: ${binding}. In the real sim your delivery numbers would be starred (*).` });
  }

  const productionActual: Vec3 = [0, 0, 0]; // GOOD units out (integers)
  const rejects: Vec3 = [0, 0, 0];
  const compUsed: Vec3 = [0, 0, 0];       // WIP components assembled (consume-first)
  const machinedActual: Vec3 = [0, 0, 0]; // units machined in-house this quarter
  for (let p = 0; p < PR; p++) {
    // integer allocation: good + rejects ALWAYS equals gross units made
    const grossMade = eur(grossStarts[p] * capRatio);
    rejects[p] = Math.min(grossMade, eur(grossMade * rejectRate[p]));
    productionActual[p] = Math.min(planTotal[p], grossMade - rejects[p]);
    rejects[p] = grossMade - productionActual[p];
    // components are used first; only the remainder consumes machine hours
    compUsed[p] = Math.min(s.componentWipUnits[p], grossMade);
    machinedActual[p] = grossMade - compUsed[p];
  }

  // overtime tiers actually worked (basic first, then Saturday, then Sunday)
  const asmHoursUsed = Math.min(assemblyHoursNeeded * capRatio, assemblyHoursAvail);
  const tierBasic = Math.min(asmHoursUsed, asmBasicAvail);
  const tierSat = Math.min(Math.max(0, asmHoursUsed - tierBasic), asmSatAvail);
  const tierSun = Math.min(Math.max(0, asmHoursUsed - tierBasic - tierSat), asmSunAvail);
  const assemblyTiers = { basic: tierBasic, saturday: tierSat, sunday: tierSun };

  // materials actually consumed scale with the capacity ratio and only cover
  // IN-HOUSE machined units — component-sourced units carry their own WIP cost.
  const materialsConsumed = machinedActual.reduce((a, q, p) => a + q * P.materialContent[p], 0);

  // (materials stock/value and factory-space checks are handled in finishQuarter,
  //  where unit flows and € values are reconciled together)

  // efficiency & maintenance dynamics
  const effBefore = s.machineEfficiency;
  if (d.maintenance >= 24) s.machineEfficiency = clamp(s.machineEfficiency + 0.2, 80, 100);
  else s.machineEfficiency = clamp(s.machineEfficiency - Math.max(0.4, 1.4 - d.maintenance * 0.06), 80, 100);
  if (d.maintenance < 15) w.push({ severity: 'warn', title: 'Maintenance too low',
    detail: `${d.maintenance} hrs/machine is below the safe zone. Efficiency fell ${(effBefore - s.machineEfficiency).toFixed(1)} pts and breakdown risk is rising.` });

  // R&D progress can grant a new improvement
  for (let p = 0; p < PR; p++) {
    if (!s.improvementsAvailable[p] && s.rdProgress[p] > 60) {
      s.improvementsAvailable[p] = true;
      s.rdProgress[p] = 0; // a completed project cannot be discovered twice
      w.push({ severity: 'info', title: `P${p + 1} R&D breakthrough`, detail: 'Cumulative R&D has produced a new product improvement, available next quarter; discovery threshold is an unofficial model assumption.' });
    }
  }

  // ---------- 3. SALES / AVAILABILITY ----------
  const sales: Mat3x3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const backlogEnd: Mat3x3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const lostInternetDemand: Vec3 = [0, 0, 0];
  const delivered: Mat3x3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

  // Largest-remainder allocation conserves every finished unit across markets.
  for (let p = 0; p < PR; p++) {
    const total = Math.max(0, planTotal[p] + recalled[p]);
    const exact = [0,1,2].map(m => total > 0 ? Math.max(0,d.deliveries[m][p]) * (productionActual[p]+recalled[p]) / total : 0);
    const alloc = exact.map(Math.floor);
    let left = productionActual[p]+recalled[p] - alloc.reduce((a,b)=>a+b,0);
    const order = [0,1,2].sort((a,b)=>(exact[b]-alloc[b])-(exact[a]-alloc[a]));
    for (const m of order) if(left-- > 0) alloc[m]++;
    for(let m=0;m<3;m++) delivered[m][p]=alloc[m];
  }
  for (let m = 0; m < M; m++) {
    for (let p = 0; p < PR; p++) {
      const avail = delivered[m][p] + s.productStocks[m][p];
      const demandHere = orders[m][p] + (m < 2 ? s.backlog[m][p] : 0);
      sales[m][p] = Math.min(demandHere, avail);
      const unfulfilled = demandHere - sales[m][p];
      if (m < 2) backlogEnd[m][p] = eur(unfulfilled * 0.5); // ≥half cancel
      else lostInternetDemand[p] = unfulfilled;
      s.productStocks[m][p] = avail - sales[m][p];
    }
  }
  const totalUnfulfilled = backlogEnd[0].concat(backlogEnd[1]).reduce((a, b) => a + b, 0)
    + lostInternetDemand.reduce((a, b) => a + b, 0);
  if (totalUnfulfilled > 30) w.push({ severity: 'warn', title: 'Stock-out risk',
    detail: `~${eur(totalUnfulfilled)} units of demand unmet (backlog after cancellations + lost internet sales). Produce more or temper demand (price/ads).` });

  s.backlog = backlogEnd;
  return finishQuarter(s, d, econ, w, { orders, sales, backlogEnd, lostInternetDemand,
    productionPlanned: planTotal, productionActual, productionScaled, rejects,
    grossStarts, rejectRate, assemblyWorkersOpen: s.assemblyWorkers,
    machHoursNeeded, machHoursAvail, assemblyHoursNeeded, assemblyHoursAvail,
    assemblyTiers, capRatio, compUsed, machinedActual,
    materialsNeeded, materialsConsumed, delivered, internetChange,
    openingProductStocks: prev.productStocks, openingComponentUnits: prev.componentWipUnits,
    physicalMachineHours: machinedActual.reduce((a,n,p)=>a+n*P.machTimeMin[p]/60,0)/Math.max(.01,prev.machineEfficiency/100), subcontractArriving, subcontractArrivingVal,
    webStars, failedVisitsPct, obsoleteUnits, obsoleteByProduct,
    openingFGUnitsByProduct: [0, 1, 2].map(p =>
      prev.productStocks[0][p] + prev.productStocks[1][p] + prev.productStocks[2][p]) as Vec3,
    openingMaterialsUnits: prev.materialsStock, openingMaterialsValue: prev.materialsValue,
    machineSaleProceeds, decommissionCost, blockedMachineArea,
    openingInsuredBase: 50000 + prev.capitalWip + prev.buildingValue + prev.machineValue + prev.finishedGoodsValue + prev.materialsValue
      + prev.componentWipValue.reduce((a,b)=>a+b,0) + prev.matPipeline3Val + prev.matPipeline6Val
      + prev.subcontractPipelineVal.reduce((a,b)=>a+b,0) }, model);
}

// second half in simulate-fin.ts to keep files readable
import { finishQuarter } from './simulate-fin';
export type { SimOut };
