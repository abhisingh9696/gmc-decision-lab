import type { ResolvedModel } from './model-options';
// Financial half of the quarterly simulation: costs, P&L, cash flow,
// finance-limit checks, share price heuristic, and pipeline updates.
// Accounting is fully articulated: every P&L / cash / inventory / balance-sheet
// movement reconciles, so assets = liabilities + equity to the euro.
import { P } from './params';
import type { CompanyState, Decisions, EconAssumptions, QuarterReport, Warning, Mat3x3, Vec3 } from './types';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const eur = (n: number) => Math.round(n);

interface Mid {
  machineSaleProceeds: number; decommissionCost: number; blockedMachineArea: number;
  orders: Mat3x3; sales: Mat3x3; backlogEnd: Mat3x3; lostInternetDemand: Vec3;
  productionPlanned: Vec3; productionActual: Vec3; productionScaled: boolean; rejects: Vec3;
  grossStarts: Vec3; rejectRate: Vec3; assemblyWorkersOpen: number;
  machHoursNeeded: number; machHoursAvail: number;
  assemblyHoursNeeded: number; assemblyHoursAvail: number;
  assemblyTiers: { basic: number; saturday: number; sunday: number };
  capRatio: number;
  compUsed: Vec3; machinedActual: Vec3;
  materialsNeeded: number; materialsConsumed: number;
  openingProductStocks: Mat3x3; openingComponentUnits: Vec3; physicalMachineHours: number;
  internetChange: 'none'|'open'|'close';
  delivered: Mat3x3; webStars: number; failedVisitsPct: number;
  subcontractArriving: Vec3; subcontractArrivingVal: Vec3;
  obsoleteUnits: number; obsoleteByProduct: Vec3;
  openingFGUnitsByProduct: Vec3; openingMaterialsUnits: number; openingMaterialsValue: number; openingInsuredBase: number;
}

export function finishQuarter(s: CompanyState, d: Decisions, econ: EconAssumptions,
  w: Warning[], mid: Mid, model: ResolvedModel): { state: CompanyState; report: QuarterReport } {

  const qOfYear = parseInt(s.quarterLabel.slice(-1), 10); // "2016 Q2" -> 2

  // ---------- OPENING BALANCES (captured before any mutation) ----------
  const openingCash = s.cash;
  const openingOverdraft = s.overdraft;
  const openingReceivables = s.receivables;
  const openingPayables = s.payables;
  const openingRetained = s.retainedEarnings;
  const openingSubcontractPayable = s.subcontractPayable;

  const { sales, orders, productionActual, rejects } = mid;
  const totalProduced = productionActual.reduce((a, b) => a + b, 0);

  // ---------- REVENUE ----------
  let revenue = 0, orderValue = 0;
  for (let m = 0; m < 3; m++) for (let p = 0; p < 3; p++) {
    revenue += sales[m][p] * d.prices[m][p];
    orderValue += orders[m][p] * d.prices[m][p];
  }

  const marketRevenue = revenue;
  const scrapProceeds = rejects.reduce((a,n,p)=>a+n*P.scrapValue[p],0);

  // ---------- MATERIALS: units AND value, reconciled ----------
  // Cost flow follows Table 21: expense = opening value + ALL purchases − closing
  // valuation, where closing stock is valued at 90% of the LOWEST quoted price.
  const spotEUR = P.matPriceSpotUSD / 1000 * econ.exchangeRate;
  const matUnitVal = P.matValuationDiscount * Math.min(
    spotEUR,
    P.matPrice3mUSD / 1000 * econ.exchangeRate,
    P.matPrice6mUSD / 1000 * econ.exchangeRate);
  // futures pipeline arrivals (3-month ordered last quarter arrives now)
  const arrivalUnits = s.matPipeline3 * 1000;
  const arrivalVal = s.matPipeline3Val;
  s.matPipeline3 = s.matPipeline6; s.matPipeline3Val = s.matPipeline6Val;
  s.matPipeline6 = 0; s.matPipeline6Val = 0;
  // spot purchases arrive for this quarter's production
  const spotUnits = d.matSpot * 1000;
  const spotVal = spotUnits * spotEUR;
  const availUnits = mid.openingMaterialsUnits + arrivalUnits + spotUnits;
  const availVal = mid.openingMaterialsValue + arrivalVal + spotVal;
  // N01 — emergency purchases are charged at the FULL spot-plus-premium price:
  // they add to purchases (payables/cash), to material expense, and their units
  // are fully consumed by this quarter's production. Consumption is based on
  // units actually started (plan × capacity ratio), not the raw plan.
  const materialsShortfall = Math.max(0, mid.materialsConsumed - availUnits);
  const emergencyVal = materialsShortfall * spotEUR * (1 + P.unplannedPremium);
  if (materialsShortfall > 0) {
    w.push({ severity: 'warn', title: 'Emergency material purchase',
      detail: `Short ${eur(materialsShortfall)} material units — auto-bought on spot market at +10% premium (€${eur(emergencyVal).toLocaleString()}, fully charged to cost of sales and supplier payments). Order more spot/futures next time.` });
  }
  const consumedUnits = mid.materialsConsumed - materialsShortfall; // emergency units consumed in full
  const premiumAdder = [0, 1, 2].reduce((a, p) =>
    a + mid.machinedActual[p] * P.materialContent[p] * spotEUR * (d.premium[p] / 100) * P.premiumMaterialsPremium, 0);
  s.materialsStock = availUnits - consumedUnits;
  s.materialsValue = s.materialsStock * matUnitVal; // Table 21 closing valuation
  let materialCostEUR = availVal + emergencyVal - s.materialsValue + premiumAdder;

  // Table 21 also covers materials on order. Revalue the remaining futures
  // assets, while keeping their FX-locked contractual payables unchanged.
  const futureOrderedCost=d.matM3*P.matPrice3mUSD*econ.exchangeRate+d.matM6*P.matPrice6mUSD*econ.exchangeRate;
  if(model.inventoryValuation==='manual-standard') {
    const closingOnOrderUnits=(s.matPipeline3+d.matM3+d.matM6)*1000;
    materialCostEUR += s.matPipeline3Val+futureOrderedCost-closingOnOrderUnits*matUnitVal;
  }

  // ---------- PRODUCTION COSTS ----------
  const wageEUR = d.wage / 100;
  const unskilledWage = wageEUR * P.unskilledWageRatio;
  const requiredMachinists = s.machines * P.unskilledPerMachine[d.shift];
  const recruitedMachinists = Math.max(0,requiredMachinists-s.machinists);
  const dismissedMachinists = Math.ceil(Math.max(0,s.machinists-requiredMachinists)/2);
  s.machinists += recruitedMachinists-dismissedMachinists;
  // Four operators attend each working machine; shifts split their hours.
  // No random breakdown/absence hours are added: those events are unmodeled.
  const hoursPerMachinist = requiredMachinists>0 ? mid.physicalMachineHours*4/requiredMachinists : 0;
  const basicMachinistHours=Math.max(360,Math.min(420,hoursPerMachinist));
  const saturdayMachinistHours=Math.min(d.shift===1?84:42,Math.max(0,hoursPerMachinist-420));
  const sundayMachinistHours=Math.min(72,Math.max(0,hoursPerMachinist-420-(d.shift===1?84:42)));
  const payPerMachinist=(basicMachinistHours+saturdayMachinistHours*1.5+sundayMachinistHours*2)
    *unskilledWage*(1+P.shiftPremium[d.shift]);
  const machinistWages = s.machinists*payPerMachinist;
  const assemblyTimeWages = (mid.assemblyTiers.basic
    + mid.assemblyTiers.saturday * P.saturdayPremium
    + mid.assemblyTiers.sunday * P.sundayPremium) * wageEUR;
  // Parity assumes all active employees worked the same 12-week quarter.
  // The official weekly attendance/strike path is not disclosed; zero assembly
  // work has zero worked weeks and therefore no assumed parity payment.
  const parityPayment=assemblyTimeWages>0?Math.max(0,s.assemblyWorkers*payPerMachinist*model.parityWeeksFactor-assemblyTimeWages):0;
  const assemblyWages=assemblyTimeWages+parityPayment;

  const runningCosts = mid.physicalMachineHours * P.machineRunningPerHour;
  const supervision = P.supervisionPerShift * d.shift;
  const prodOverheads = P.overheadPerMachine * s.machines;
  const planning = mid.productionPlanned.reduce((a, b) => a + b, 0) * P.planningPerUnit;
  const inspection = (totalProduced + rejects.reduce((a,b)=>a+b,0)) * P.inspectionPerUnit;
  const maintenanceCost = d.maintenance * s.machines * P.maintContractRate
    + (d.maintenance < 12 ? (12 - d.maintenance) * s.machines * P.maintBreakdownRate : 0);

  // ---------- OBSOLETE STOCK LIQUIDATION (improvement launch) ----------
  // Old models are sold at book valuation OUTSIDE normal markets: cash in,
  // inventory value out, no P&L gain/loss. N04 — each product is liquidated at
  // ITS OWN per-unit book value (Table 21 product-level roll-forward), never at
  // a cross-product average.
  let obsoleteProceeds = 0;
  const fgPoolVal: Vec3 = [0, 0, 0];
  const fgPoolUnits: Vec3 = [0, 0, 0];
  for (let p = 0; p < 3; p++) {
    const openUnits = mid.openingFGUnitsByProduct[p];
    const openVal = s.productFGValue[p];
    const unitVal = openUnits > 0 ? openVal / openUnits : 0;
    obsoleteProceeds += mid.obsoleteByProduct[p] * unitVal;
    fgPoolVal[p] = openVal - mid.obsoleteByProduct[p] * unitVal;
    fgPoolUnits[p] = openUnits - mid.obsoleteByProduct[p];
  }

  const { machineSaleProceeds, decommissionCost } = mid;

  // ---------- ADMIN / OVERHEAD EXPENSES ----------
  const advTotal = (d.advCorp.reduce((a, b) => a + b, 0)
    + d.advProd.flat().reduce((a, b) => a + b, 0)) * 1000;
  const rdTotal = d.rd.reduce((a, b) => a + b, 0) * 1000;
  const agentsCost = s.agentsEU * d.agentsEU.support * 1000
    + s.distNafta * d.distNafta.support * 1000 + s.distNet*d.distNet.support * 1000
    + Math.max(0,d.agentsEU.want-s.agentsEU)*P.agentSetup + Math.max(0,s.agentsEU-d.agentsEU.want)*P.agentTermination
    + Math.max(0,d.distNafta.want-s.distNafta)*P.agentSetup + Math.max(0,s.distNafta-d.distNafta.want)*P.agentTermination
    + (mid.internetChange==='open'?P.agentSetup:mid.internetChange==='close'?P.agentTermination:0)
    + (d.agentsEU.commission / 100) * (orders[0][0] * d.prices[0][0] + orders[0][1] * d.prices[0][1] + orders[0][2] * d.prices[0][2])
    + (d.distNafta.commission / 100) * (sales[1][0] * d.prices[1][0] + sales[1][1] * d.prices[1][1] + sales[1][2] * d.prices[1][2])
    + (d.distNet.commission / 100) * (sales[2][0] * d.prices[2][0] + sales[2][1] * d.prices[2][1] + sales[2][2] * d.prices[2][2]);
  const ispCost = (mid.internetChange==='open'?7500:mid.internetChange==='close'?5000:0) + s.ports * P.ispPerPort + P.internetServicePct * (sales[2][0] * d.prices[2][0] + sales[2][1] * d.prices[2][1] + sales[2][2] * d.prices[2][2]);
  const salesOffice = P.salesOfficePctOrders * orderValue;
  const guaranteeCost = (sales[0][0] + sales[1][0] + sales[2][0]) * P.guaranteeFee[0] * 0.02
    + (sales[0][1] + sales[1][1] + sales[2][1]) * P.guaranteeFee[1] * 0.02
    + (sales[0][2] + sales[1][2] + sales[2][2]) * P.guaranteeFee[2] * 0.02;
  const personnelCost = recruitedMachinists*1000 + dismissedMachinists*2000 + Math.max(0, d.hire) * P.recruitCost
    + Math.max(0, -d.hire) * P.dismissCost + d.train * P.trainCost + d.trainingDays * P.consultantPerDay;
  const factoryFixed = P.factoryFixedPerSqm * s.factoryArea;
  const infoCost = (d.infoMarket ? P.infoMarketCost : 0) + (d.infoCompetitors ? P.infoCompetitorsCost : 0);
  const creditControl = P.creditControlPerUnit * (sales[0].reduce((a, b) => a + b, 0) + sales[1].reduce((a, b) => a + b, 0))
    + P.creditCardPerUnit * sales[2].reduce((a, b) => a + b, 0);
  const webDevCost = d.webDev * 1000;
  const mgmtCost = s.mgmtBudgetEffective * 1000; // effective budget (notice rule applied)

  // transport (rough container model)
  const loads = (m: number) => {
    const units = [mid.delivered[m][0], mid.delivered[m][1], mid.delivered[m][2]];
    return Math.ceil(units[0] / P.containerCap[0] + units[1] / P.containerCap[1] + units[2] / P.containerCap[2]);
  };
  // transport (rough container model) — NAFTA road leg is a ROUND TRIP
  // (250 km each way = 500 km => 2 road days at 400 km/day) plus the sea crossing
  const euDays = Math.ceil(P.europeJourneyKm / P.kmPerDay);
  const transportCost = loads(0) * euDays * P.transportPerDay
    + loads(1) * (Math.ceil(2 * P.naftaPortKm / P.kmPerDay) * P.transportPerDay + P.naftaContainerCrossing)
    + loads(2) * Math.ceil(P.netAgentKm / P.kmPerDay) * P.transportPerDay;

  // space check (Table 26) + external storage cost — WIP components take space too
  const spaceNeeded = mid.blockedMachineArea + s.machines * P.sqmPerMachine + s.assemblyWorkers * P.sqmPerWorker
    + (s.materialsStock / 1000) * P.sqmPer1000Materials
    + s.componentWipUnits[0] * P.wipSqm[0] + s.componentWipUnits[1] * P.wipSqm[1] + s.componentWipUnits[2] * P.wipSqm[2];
  const spaceAvail = s.factoryArea * P.factoryUseMax;
  if (spaceNeeded > spaceAvail) w.push({ severity: 'warn', title: 'Factory space overflow',
    detail: `Need ~${eur(spaceNeeded)} m² vs ${eur(spaceAvail)} m² usable. Excess materials/WIP stored externally at extra cost; new hires/machines may be capped.` });

  // Tables 13–14: storage is charged on average opening/closing units.
  let warehousing = 0;
  for (let p = 0; p < 3; p++) for(let m=0;m<3;m++) {
    const average=(mid.openingProductStocks[m][p]+s.productStocks[m][p])/2;
    warehousing += average * (m===1?P.storageProductNaftaUSD*econ.exchangeRate:P.storageProductEU);
  }
  const avgMaterials=(mid.openingMaterialsUnits+s.materialsStock)/2;
  const avgComponents=[0,1,2].map(p=>(mid.openingComponentUnits[p]+s.componentWipUnits[p]-mid.compUsed[p])/2);
  const componentArea=avgComponents.reduce((a,n,p)=>a+n*P.wipSqm[p],0);
  const availableStorageArea=Math.max(0,spaceAvail-mid.blockedMachineArea-s.machines*P.sqmPerMachine-s.assemblyWorkers*P.sqmPerWorker);
  let overflow=Math.max(0,avgMaterials/1000*P.sqmPer1000Materials+componentArea-availableStorageArea);
  // Storage allocation is explicit: materials external first, then components
  // in proportion to component space. Official allocation priority is unknown.
  const externalMaterials=Math.min(avgMaterials,overflow*1000/P.sqmPer1000Materials);
  overflow=Math.max(0,overflow-externalMaterials/1000*P.sqmPer1000Materials);
  const externalComponents=componentArea>0?avgComponents.reduce((a,n)=>a+n,0)*Math.min(1,overflow/componentArea):0;
  warehousing += externalMaterials*P.extStorageMaterial + externalComponents*3;

  // insurance premium (Table 22): premium % of "non-current assets AND
  // inventories, taken from last quarter's balance sheet" — i.e. OPENING
  // values: non-current assets + finished goods + materials + component WIP.
  // (m2.htm confirms materials in warehouse and in transit are insured risks.)
  const insPlan = P.insurance[d.insurance];
  const insurancePremium = insPlan.premium * mid.openingInsuredBase;

  // carbon footprint (Table 27)
  const assemblyHoursWorked = mid.assemblyTiers.basic + mid.assemblyTiers.saturday + mid.assemblyTiers.sunday;
  const carbonTonnes = (s.factoryArea * 9.5 + mid.physicalMachineHours * 2.82
    + assemblyHoursWorked * 0.47) / 1000;

  const carbonOffsetCost = carbonTonnes * 40; // m3: €40 per tonne, Other costs

  const adminExpenses = advTotal + agentsCost + ispCost + salesOffice + guaranteeCost + rdTotal
    + webDevCost + personnelCost + maintenanceCost + P.purchasingAdmin + infoCost + creditControl
    + insurancePremium + mgmtCost + factoryFixed + warehousing + decommissionCost + carbonOffsetCost;

  const depreciation = s.machineValue * P.machineDepreciation;
  s.machineValue -= depreciation;
  if(s.machineCohorts) for(const c of s.machineCohorts) c.value *= 1-P.machineDepreciation;

  // ---------- COGS via per-product finished-goods pools (exact inventory flow) ----------
  // The production pool is apportioned to products by standard cost build-up
  // (Table 21 weights); each product's pool then covers its opening units +
  // production, and COGS removes that product's sold units at average value.
  const productionPool = materialCostEUR + machinistWages + assemblyWages + runningCosts
    + supervision + prodOverheads + planning + inspection;
  const stdW: Vec3 = [0, 1, 2].map(p =>
    P.materialContent[p] * matUnitVal
    + (P.machTimeMin[p] / 60) * P.fgValMachineRate
    + (P.minAssemblyMin[p] / 60) * P.fgValAssemblyRate) as Vec3;
  // ---------- SUBCONTRACTED COMPONENTS (m2.htm + Table 24) ----------
  // Consumption: components are used FIRST (see simulate.ts). Their WIP book
  // value flows into each product's finished-goods pool as they are assembled;
  // unused components stay in WIP at purchase cost.
  const usedComponentValues:Vec3=[0,0,0];
  for (let p = 0; p < 3; p++) {
    const wipU = s.componentWipUnits[p];
    if (wipU > 0 && mid.compUsed[p] > 0) {
      const wipUnitCost = s.componentWipValue[p] / wipU;
      const consumed = mid.compUsed[p] * wipUnitCost;
      usedComponentValues[p]=consumed;
      fgPoolVal[p] += consumed; // units enter the pool via productionActual below
      s.componentWipUnits[p] -= mid.compUsed[p];
      s.componentWipValue[p] -= consumed;
    }
  }
  // New orders: cost per component calibrated to the six official quote
  // endpoints (params.subcontractQuoteRef): per-product contractor factor on
  // (materials at CURRENT spot + machining at the standard rate), plus a
  // premium-materials adder interpolated LINEARLY in the premium % — so all
  // six report endpoints (124/204/314 → 157/269/411) reproduce exactly at
  // reference conditions. The € value is locked NOW (Table 24: the second
  // instalment is not affected by later FX moves). Payment is 50% this
  // quarter, 50% next quarter via a subcontract payable.
  const compOrderUnitCost: Vec3 = [0, 1, 2].map(p => {
    const ref = P.subcontractQuoteRef;
    const matCost = P.materialContent[p] * spotEUR;
    const machCost = (P.machTimeMin[p] / 60) * P.fgValMachineRate;
    const refMat = P.materialContent[p] * ref.spotEUR;
    const contractorFactor = ref.min[p] / (refMat + machCost);
    const premiumAdderFrac = (ref.max[p] - ref.min[p]) / refMat; // per 100% premium
    return (matCost + machCost) * contractorFactor
      + (d.premium[p] / 100) * premiumAdderFrac * matCost;
  }) as Vec3;
  const subcontractOrderVal = [0, 1, 2].reduce((a, p) => a + d.subcontract[p] * compOrderUnitCost[p], 0);
  s.subcontractPipeline = [...d.subcontract] as Vec3;
  s.subcontractPipelineVal = [0, 1, 2].map(p => d.subcontract[p] * compOrderUnitCost[p]) as Vec3;
  s.subcontractPayable = subcontractOrderVal * 0.5;
  const subcontractPaid = subcontractOrderVal * 0.5 + openingSubcontractPayable;
  if (subcontractOrderVal > 0) {
    w.push({ severity: 'info', title: 'Subcontract order placed',
      detail: `${eur(d.subcontract.reduce((a, b) => a + b, 0))} components ordered for €${eur(subcontractOrderVal).toLocaleString()} (FX-locked): 50% paid now, 50% next quarter. Delivery next quarter as WIP — they still need assembly.` });
  }
  const prodDenom = [0, 1, 2].reduce((a, p) => a + productionActual[p] * stdW[p], 0);
  let cogs = 0;
  const standardUnits:Vec3=[0,0,0];
  if(model.inventoryValuation==='manual-standard') {
    // Table 21 literal standard-cost interpretation. Its additive shift-rate
    // reading is exposed as an assumption; the history trace does not fit
    // exactly. Opening product allocation remains estimated; total is exact.
    cogs=productionPool+fgPoolVal.reduce((a,b)=>a+b,0);
    for(let p=0;p<3;p++) {
      const standardUnit=1.1*(P.materialContent[p]*matUnitVal*(1+d.premium[p]/100*.5)
        +wageEUR*(.65+P.shiftPremium[d.shift])*4*P.machTimeMin[p]/60
        +wageEUR*d.assemblyTimes[p]/60);
      standardUnits[p]=standardUnit;
      const units=fgPoolUnits[p]+productionActual[p];
      const openValue=fgPoolVal[p]-usedComponentValues[p];
      const weightedUnit=units>0?(openValue+productionActual[p]*standardUnit)/units:0;
      const closingUnits=s.productStocks.reduce((a,row)=>a+row[p],0);
      s.productFGValue[p]=closingUnits*weightedUnit;
      cogs-=s.productFGValue[p];
    }
  } else   if (prodDenom > 0) {
    for (let p = 0; p < 3; p++) {
      const alloc = productionPool * (productionActual[p] * stdW[p]) / prodDenom;
      fgPoolVal[p] += alloc;
      fgPoolUnits[p] += productionActual[p];
      const soldP = sales[0][p] + sales[1][p] + sales[2][p];
      const cogsP = fgPoolUnits[p] > 0 ? fgPoolVal[p] * (soldP / fgPoolUnits[p]) : 0;
      cogs += cogsP;
      s.productFGValue[p] = fgPoolVal[p] - cogsP;
    }
  } else {
    // nothing good produced (e.g. capacity scaled to zero): the whole pool is
    // a period cost — it must still hit the P&L, never vanish from the books.
    cogs = productionPool;
    for (let p = 0; p < 3; p++) {
      const soldP = sales[0][p] + sales[1][p] + sales[2][p];
      const cogsP = fgPoolUnits[p] > 0 ? fgPoolVal[p] * (soldP / fgPoolUnits[p]) : 0;
      cogs += cogsP;
      s.productFGValue[p] = fgPoolVal[p] - cogsP;
    }
  }
  revenue += obsoleteProceeds + scrapProceeds;
  cogs += transportCost; // Official report classifies hired transport in cost of sales.
  cogs += obsoleteProceeds; // liquidation at book value: revenue and cost cancel.
  s.finishedGoodsValue = s.productFGValue[0] + s.productFGValue[1] + s.productFGValue[2];
  const grossProfit = revenue - cogs;
  const operatingProfit = grossProfit - adminExpenses - depreciation;

  // ---------- FINANCE ----------
  // R01 — term loan capped by the borrowing power reported LAST quarter
  // (50% of market value − term loans − overdraft limit); principal credits
  // cash at the beginning of the quarter; interest on the new balance.
  let loanDrawn = 0;
  if (d.termLoan > 0) {
    let req = d.termLoan * 1000;
    if (req > s.borrowingPower) {
      w.push({ severity: 'critical', title: 'Loan exceeds borrowing power', adjustment: true,
        detail: `Requested €${eur(req).toLocaleString()} but last quarter's reported borrowing power is €${eur(s.borrowingPower).toLocaleString()}. Effective draw capped at €${eur(s.borrowingPower).toLocaleString()}.` });
      req = s.borrowingPower;
    }
    req = Math.floor(req / 1000) * 1000; // portal units are whole €'000
    s.termLoanAmt += req;
    loanDrawn = req;
  }
  let depositChange = d.termDeposit * 1000;
  if (depositChange < 0 && -depositChange > s.termDepositAmt) {
    w.push({ severity: 'warn', title: 'Deposit withdrawal capped', adjustment: true,
      detail: `Only €${eur(s.termDepositAmt).toLocaleString()} on deposit. Withdrawal cut to that.` });
    depositChange = -s.termDepositAmt;
  }
  s.termDepositAmt += depositChange;

  const interestReceived = s.termDepositAmt * (econ.baseRate / 100) / 4;
  const interestPaidLoan = s.termLoanAmt * (P.termLoanRate / 100) / 4;

  // ---------- WORKING CAPITAL ----------
  const receivablesEnd = (sales[0][0] * d.prices[0][0] + sales[0][1] * d.prices[0][1] + sales[0][2] * d.prices[0][2]) * (P.creditDays[0] / 90)
    + (sales[1][0] * d.prices[1][0] + sales[1][1] * d.prices[1][1] + sales[1][2] * d.prices[1][2]) * (P.creditDays[1] / 90);
  const collected = marketRevenue - receivablesEnd + s.receivables;
  s.receivables = receivablesEnd;

  // N01 — purchases include the FULL emergency invoice (spot + 10% premium) and
  // the premium-materials surcharge (spot +50% on premium share); futures
  // contracts ordered this quarter are also recognised now (their value sits in
  // the "materials on order" pipeline asset until arrival). Half of all
  // purchases is paid this quarter, half becomes trade payables.
  const futuresOrderedVal = d.matM3 * 1000 * (P.matPrice3mUSD / 1000) * econ.exchangeRate
    + d.matM6 * 1000 * (P.matPrice6mUSD / 1000) * econ.exchangeRate;
  const materialPurchasesVal = spotVal + emergencyVal + futuresOrderedVal + premiumAdder;
  const deferredNow = advTotal + guaranteeCost + webDevCost + maintenanceCost + warehousing + infoCost + transportCost;
  // Table 24: materials & components are paid 50% this quarter / 50% next —
  // the subcontract second instalment sits in payables alongside trade credit.
  const payablesEnd = deferredNow + materialPurchasesVal * 0.5 + s.subcontractPayable;
  const productionCashCosts = machinistWages + assemblyWages + runningCosts + supervision
    + prodOverheads + planning + inspection;
  const paidSuppliersAdmin = (adminExpenses + transportCost - deferredNow) + (openingPayables - openingSubcontractPayable);
  const paidMaterials = materialPurchasesVal * 0.5;
  const paidNow = paidSuppliersAdmin + productionCashCosts + paidMaterials + subcontractPaid;
  s.payables = payablesEnd;

  // ---------- DIVIDEND (opening-reserves rule) ----------
  let dividendPaid = 0;
  const sharesCount = s.shareCapital; // €1 nominal
  const maxDividend = Math.max(0, openingRetained);
  const wantDividend = (d.dividend / 100) * (sharesCount / 1);
  if (wantDividend > 0 && maxDividend <= 0) {
    w.push({ severity: 'critical', title: 'Dividend blocked', adjustment: true,
      detail: `Opening retained earnings are €${eur(openingRetained).toLocaleString()} — no dividend is legally payable until reserves are positive at the START of the quarter. Forced to 0.` });
  } else if (wantDividend > maxDividend) {
    dividendPaid = Math.floor(maxDividend / sharesCount * 100) / 100 * sharesCount; // whole cents/share fit the portal
    w.push({ severity: 'warn', title: 'Dividend capped', adjustment: true,
      detail: `Requested dividend exceeds opening retained earnings; cut to €${eur(maxDividend).toLocaleString()}.` });
  } else dividendPaid = wantDividend;

  // ---------- CAPEX (credit-worthiness from last report) ----------
  const creditWorthiness = Math.max(0, s.borrowingPower + openingCash - openingOverdraft + s.termDepositAmt - depositChange);
  let machinesCost = d.machinesBuy * P.machineCost;
  let extCost = d.factoryExt * P.buildingCostPerSqm;
  if (machinesCost + extCost > creditWorthiness) {
    const affordable = Math.max(0, creditWorthiness);
    if (machinesCost > affordable) { machinesCost = Math.floor(affordable / P.machineCost) * P.machineCost; w.push({ severity: 'critical', title: 'Machine order refused', adjustment: true, detail: 'Credit-worthiness insufficient — the supplier would cut or refuse your machine order (starred decision).' }); }
    if (machinesCost + extCost > affordable) { extCost = Math.max(0, affordable - machinesCost); w.push({ severity: 'critical', title: 'Factory extension refused', adjustment: true, detail: 'Credit-worthiness insufficient — the contractor would shrink or refuse the extension.' }); }
  }
  if (d.factoryExt * P.buildingCostPerSqm > 0 && d.factoryExt > s.landUnused) w.push({ severity: 'critical', title: 'Not enough land', adjustment: true, detail: `Only ${s.landUnused} m² of unused land — extension would be capped.` });
  extCost = Math.floor(Math.min(extCost / P.buildingCostPerSqm, s.landUnused)) * P.buildingCostPerSqm;
  s.capitalWip += machinesCost + extCost; // paid now, arrives next quarter

  // ---------- SHARE ISSUE / REPURCHASE ----------
  // Manual (finance): the number of shares issued OR repurchased in ANY ONE
  // YEAR may not exceed 10% of the issued capital AT THE START OF THE YEAR.
  // Tracked cumulatively per direction; counters reset each Q1.
  if (qOfYear === 1) {
    s.shareCapYearStart = s.shareCapital;
    s.sharesIssuedThisYear = 0;
    s.sharesRepurchasedThisYear = 0;
  }
  let repurchaseCharge = 0;
  let shareCash = 0;
  let effSharesK = 0; // effective nominal trade in €'000 — what the portal would actually execute
  if (d.shares !== 0) {
    const annualCap = s.shareCapYearStart * 0.10; // € nominal = shares (€1 par)
    const roomIssue = Math.max(0, annualCap - s.sharesIssuedThisYear);
    const roomRepurchase = Math.max(0, annualCap - s.sharesRepurchasedThisYear);
    const reqEur = d.shares * 1000;
    const effEur = reqEur > 0 ? Math.min(reqEur, roomIssue) : Math.max(reqEur, -roomRepurchase);
    if (effEur !== reqEur) w.push({ severity: 'warn', title: 'Share change capped', adjustment: true,
      detail: `Annual limit is ±10% of the €${eur(s.shareCapYearStart).toLocaleString()} capital at the start of the year (€${eur(annualCap).toLocaleString()}); already used €${eur(reqEur > 0 ? s.sharesIssuedThisYear : s.sharesRepurchasedThisYear).toLocaleString()}. Effective trade: €${eur(effEur).toLocaleString()} nominal.` });
    if (effEur !== 0) {
      if (s.sharePrice < 1.0) w.push({ severity: 'critical', title: 'Share dealing blocked', adjustment: true, detail: 'Share price below par (€1) — no issue or repurchase allowed.' });
      else {
        shareCash = effEur * s.sharePrice;
        effSharesK = effEur / 1000;
        const premiumChange = effEur * (s.sharePrice - 1);
        if (premiumChange < 0) {
          repurchaseCharge = Math.max(0, -premiumChange - s.sharePremium);
          s.sharePremium = Math.max(0, s.sharePremium + premiumChange);
          s.retainedEarnings -= repurchaseCharge;
        } else s.sharePremium += premiumChange;
        if (effEur > 0) { s.cumIssues += shareCash; s.sharesIssuedThisYear += effEur; }
        else { s.cumRepurchases += -shareCash; s.sharesRepurchasedThisYear += -effEur; }
        s.shareCapital += effEur;
      }
    }
  }

  // ---------- PIPELINES (arrive next quarter) ----------
  const machinesBought = eur(machinesCost / P.machineCost);
  s.machinesPipeline = machinesBought;
  s.factoryExtPipeline = eur(extCost / P.buildingCostPerSqm);
  s.landUnused = Math.max(0, s.landUnused - s.factoryExtPipeline);
  s.workersPipeline = Math.max(0, d.hire);
  s.traineesPipeline = Math.max(0, d.train);
  if (d.hire < 0) s.assemblyWorkers = Math.max(0, s.assemblyWorkers + d.hire);
  // futures orders carry their contract value (ADD to the pipeline — the
  // 6-month order shifted into the 3-month slot at the top of the quarter
  // must be preserved; assigning here would silently destroy its value)
  s.matPipeline3 += d.matM3; s.matPipeline3Val += d.matM3 * 1000 * (P.matPrice3mUSD / 1000) * econ.exchangeRate;
  s.matPipeline6 += d.matM6; s.matPipeline6Val += d.matM6 * 1000 * (P.matPrice6mUSD / 1000) * econ.exchangeRate;
  if(model.inventoryValuation==='manual-standard') {
    s.matPipeline3Val=s.matPipeline3*1000*matUnitVal;
    s.matPipeline6Val=s.matPipeline6*1000*matUnitVal;
  }
  s.agentsPipeline = Math.max(0, d.agentsEU.want - s.agentsEU);
  if (d.agentsEU.want < s.agentsEU) s.agentsEU = d.agentsEU.want;
  s.distNafta = Math.max(0, d.distNafta.want);
  s.portsPipeline = d.ports; // zero is a real one-quarter closure notice

  // ---------- CASH & OVERDRAFT ----------
  // Tax assessed at a prior Q4 is settled in Q2 — a cash payment known upfront.
  const taxPaid = qOfYear === 2 ? s.taxDue : 0;
  if (taxPaid > 0) {
    w.push({ severity: 'info', title: 'Tax settled',
      detail: `Paid €${eur(taxPaid).toLocaleString()} of tax assessed at last Q4.` });
    s.taxDue = 0;
  }

  let cash = openingCash + collected + interestReceived + shareCash + loanDrawn
    + machineSaleProceeds + obsoleteProceeds + scrapProceeds
    - paidNow - dividendPaid - machinesCost - extCost - taxPaid - interestPaidLoan - depositChange;

  // overdraft roll: opening overdraft is repaid before cash accumulates
  let overdraftEnd = openingOverdraft;
  if (cash >= 0 && overdraftEnd > 0) {
    const repay = Math.min(cash, overdraftEnd);
    overdraftEnd -= repay; cash -= repay;
  }
  if (cash < 0) { overdraftEnd += -cash; cash = 0; }

  // overdraft limit from LAST quarter's (opening) balances — manual Table 19
  const overdraftLimit = s.overdraftLimit; // use the prior management report, not a differently rounded reconstruction

  let overdraftInterest = 0;
  let unauthorised = false;
  if (overdraftEnd > 0) {
    unauthorised = overdraftEnd > overdraftLimit;
    const rate = (econ.baseRate / 100 + (unauthorised ? P.unauthorisedSpread : P.overdraftSpread)) / 4;
    overdraftInterest = overdraftEnd * rate;
    overdraftEnd += overdraftInterest; // unpaid interest capitalises into the overdraft
    w.push({ severity: unauthorised ? 'critical' : 'warn', title: unauthorised ? 'UNAUTHORISED overdraft' : 'Overdraft used',
      detail: `Overdraft €${eur(overdraftEnd).toLocaleString()} vs limit €${eur(overdraftLimit).toLocaleString()}. ${unauthorised ? 'Punitive interest (base+10%) on the WHOLE overdraft.' : 'Within authorised limit (base+4%).'}` });
  }
  s.cash = cash;
  s.overdraft = overdraftEnd;

  // ---------- TAX (assessed at Q4, paid the following Q2) ----------
  const interestPaidTotal = interestPaidLoan + overdraftInterest;
  const netInterest = interestReceived - interestPaidTotal;
  const pbt = operatingProfit + netInterest;
  s.taxableCarryforward += pbt;
  let tax = 0;
  if (qOfYear === 4) {
    if (s.taxableCarryforward > 0) {
      tax = s.taxableCarryforward * P.taxRate;
      s.taxDue += tax;
      s.taxableCarryforward = 0;
      w.push({ severity: 'info', title: 'Annual tax assessed',
        detail: `25% on accumulated taxable profit — €${eur(tax).toLocaleString()} payable in next year's Q2.` });
    }
  }
  const netProfit = pbt - tax;
  s.retainedEarnings += netProfit - dividendPaid;
  s.cumDividends += dividendPaid;

  // ---------- SHARE PRICE & INVESTMENT PERFORMANCE (MODEL PROXY) ----------
  const equity = s.shareCapital + s.sharePremium + s.retainedEarnings;
  const navPerShare = equity / (s.shareCapital / 1);
  const annROE = equity > 0 ? (netProfit / equity) * 4 : -0.5;
  const divYield = s.cumDividends > 0 ? dividendPaid / Math.max(1, s.sharePrice * sharesCount) : 0;
  const liquidityPenalty = unauthorised ? 0.15 : overdraftEnd > 0 ? 0.05 : 0;
  const sentiment = clamp(1 + 0.9 * annROE + model.dividendSentimentWeight * divYield - liquidityPenalty
    + (netProfit > 0 ? 0.02 : -0.06), 0.5, 2.2);
  s.sharePrice = clamp(navPerShare * sentiment, 0.01, 50);
  const marketValue = s.sharePrice * (s.shareCapital / 1);
  const investmentPerformance = marketValue + s.cumDividends + s.cumRepurchases - s.cumIssues;

  // next quarter's reported limits (manual Table 19, end-of-quarter balances)
  const wipValueEnd = s.componentWipValue[0] + s.componentWipValue[1] + s.componentWipValue[2];
  const overdraftLimitNext = Math.max(0,
    0.5 * (50000 + s.buildingValue + s.finishedGoodsValue + s.materialsValue + wipValueEnd
      + s.matPipeline3Val + s.matPipeline6Val + s.subcontractPipelineVal.reduce((a,b)=>a+b,0))
    + 0.9 * s.receivables - s.taxDue - s.payables);
  s.overdraftLimit = overdraftLimitNext;
  s.borrowingPower = Math.max(0, 0.5 * (s.sharePrice * s.shareCapital) - s.termLoanAmt - overdraftLimitNext);


  if (s.mgmtBudgetEffective < 50) w.push({ severity: 'warn', title: 'Management budget thin',
    detail: 'Low management budget degrades quality across the whole company and raises incident risk.' });

  // ---------- STATEMENT DETAILS (audit trail for the UI) ----------
  const adminBreakdown = [
    { label: 'Advertising', value: advTotal },
    { label: 'Agents & distributors', value: agentsCost },
    { label: 'Internet service provider', value: ispCost },
    { label: 'Sales office', value: salesOffice },
    { label: 'Guarantee servicing', value: guaranteeCost },
    { label: 'Product development (R&D)', value: rdTotal },
    { label: 'Website development', value: webDevCost },
    { label: 'Personnel department', value: personnelCost },
    { label: 'Machine maintenance', value: maintenanceCost },
    { label: 'Purchasing & warehousing', value: P.purchasingAdmin + warehousing },
    { label: 'Business intelligence', value: infoCost },
    { label: 'Credit control', value: creditControl },
    { label: 'Insurance premiums', value: insurancePremium },
    { label: 'Management salaries', value: mgmtCost },
    { label: 'Factory rates & fixed', value: factoryFixed },
    { label: 'Carbon offsets', value: carbonOffsetCost },
    { label: 'Decommissioning', value: decommissionCost },
  ].map(x => ({ label: x.label, value: eur(x.value) }));

  const details = {
    inventoryEvidence:{method:model.inventoryValuation,standardUnit:standardUnits,productValues:[...s.productFGValue] as Vec3,materialsOnOrderValue:eur(s.matPipeline3Val+s.matPipeline6Val)},
    productionCosts: {machinists:s.machinists,recruited:recruitedMachinists,dismissed:dismissedMachinists,
      physicalMachineHours:mid.physicalMachineHours,machinistHoursPerPerson:hoursPerMachinist,
      machinistWages:eur(machinistWages),assemblyTimeWages:eur(assemblyTimeWages),parityPayment:eur(parityPayment),
      assemblyWages:eur(assemblyWages),runningCosts:eur(runningCosts),inspection:eur(inspection),transport:eur(transportCost)},
    income: {
      revenue: eur(revenue), cogs: eur(cogs), grossProfit: eur(grossProfit),
      adminExpenses: eur(adminExpenses), depreciation: eur(depreciation),
      operatingProfit: eur(operatingProfit), interestReceived: eur(interestReceived),
      interestPaid: eur(interestPaidTotal), pbt: eur(pbt), taxAssessed: eur(tax), netProfit: eur(netProfit),
    },
    adminBreakdown,
    cashFlow: {
      openingCash: eur(openingCash - openingOverdraft), collected: eur(collected), interestReceived: eur(interestReceived),
      loanDrawn: eur(loanDrawn), shareCash: eur(shareCash),
      obsoleteProceeds: eur(obsoleteProceeds), scrapProceeds: eur(scrapProceeds), assetProceeds: eur(machineSaleProceeds),
      paidSuppliersAdmin: eur(paidSuppliersAdmin), paidProduction: eur(productionCashCosts),
      paidMaterials: eur(paidMaterials), subcontractPaid: eur(subcontractPaid), dividendPaid: eur(dividendPaid),
      capex: eur(machinesCost + extCost), taxPaid: eur(taxPaid),
      interestPaid: eur(interestPaidTotal), depositChange: eur(depositChange),
      closingCash: eur(s.cash), overdraftEnd: eur(s.overdraft),
    },
    workingCapital: {
      receivablesOpen: eur(openingReceivables), receivablesEnd: eur(s.receivables),
      payablesOpen: eur(openingPayables), payablesEnd: eur(s.payables),
      closingInvValue: eur(s.finishedGoodsValue), materialsStock: eur(s.materialsStock),
    },
    retained: {
      opening: eur(openingRetained), netProfit: eur(netProfit),
      dividendPaid: eur(dividendPaid), repurchaseCharge: eur(repurchaseCharge), closing: eur(s.retainedEarnings),
    },
    balance: {
      fixedAssets: eur(50000 + s.buildingValue + s.machineValue),
      capitalWip: eur(s.capitalWip),
      inventories: eur(s.finishedGoodsValue), materialsValue: eur(s.materialsValue),
      wipComponents: eur(wipValueEnd),
      materialsOnOrder: eur(s.matPipeline3Val + s.matPipeline6Val
        + s.subcontractPipelineVal[0] + s.subcontractPipelineVal[1] + s.subcontractPipelineVal[2]),
      receivables: eur(s.receivables), cash: eur(s.cash), deposit: eur(s.termDepositAmt),
      payables: eur(s.payables), taxDue: eur(s.taxDue), overdraft: eur(s.overdraft),
      termLoan: eur(s.termLoanAmt), shareCapital: eur(s.shareCapital),
      sharePremium: eur(s.sharePremium), retainedEarnings: eur(s.retainedEarnings),
    },
  };

  // Decisions as ACTUALLY executed: sanitized inputs (d) overridden by every
  // financial restriction enforced above, so Portal Export can print exactly
  // what the engine ran — including zeroed/capped financial entries.
  const effectiveDecisions: Decisions = {
    ...d,
    mgmtBudget: d.mgmtBudget, // portal instruction announces the reduction; expense is shown separately
    dividend: dividendPaid > 0 ? Math.round((dividendPaid / sharesCount) * 10000) / 100 : 0,
    shares: effSharesK,
    termLoan: eur(loanDrawn / 1000),
    termDeposit: eur(depositChange / 1000),
    machinesBuy: machinesBought,
    factoryExt: s.factoryExtPipeline,
  };

  const report: QuarterReport = {
    quarterLabel: s.quarterLabel,
    orders: mid.orders, sales, backlogEnd: mid.backlogEnd, lostInternetDemand: mid.lostInternetDemand,
    productionPlanned: mid.productionPlanned, productionActual, productionScaled: mid.productionScaled,
    rejects, grossStarts: mid.grossStarts, rejectRate: mid.rejectRate,
    assemblyWorkersOpen: mid.assemblyWorkersOpen,
    obsoleteUnits: mid.obsoleteUnits, obsoleteByProduct: mid.obsoleteByProduct,
    obsoleteProceeds: eur(obsoleteProceeds),
    machHoursNeeded: mid.machHoursNeeded, machHoursAvail: mid.machHoursAvail,
    assemblyHoursNeeded: mid.assemblyHoursNeeded, assemblyHoursAvail: mid.assemblyHoursAvail,
    assemblyTiers: mid.assemblyTiers, mgmtBudgetEffective: s.mgmtBudgetEffective,
    materialsNeeded: mid.materialsNeeded, materialsShortfall: eur(materialsShortfall),
    componentWipEnd: [...s.componentWipUnits] as Vec3,
    spaceNeeded: eur(spaceNeeded), spaceAvail: eur(spaceAvail),
    revenue: eur(revenue), cogs: eur(cogs), grossProfit: eur(grossProfit),
    adminExpenses: eur(adminExpenses), operatingProfit: eur(operatingProfit),
    netInterest: eur(netInterest), pbt: eur(pbt), tax: eur(tax), netProfit: eur(netProfit),
    cashEnd: eur(s.cash), overdraftEnd: eur(s.overdraft), overdraftLimit: eur(overdraftLimit), unauthorised,
    dividendPaid: eur(dividendPaid),
    sharePrice: s.sharePrice, marketValue: eur(marketValue), investmentPerformance: eur(investmentPerformance),
    ipBreakdown: {
      navPerShare: Math.round(navPerShare * 10000) / 10000,
      sentiment: Math.round(sentiment * 1000) / 1000,
      marketValue: eur(marketValue),
      cumDividends: eur(s.cumDividends),
      cumRepurchases: eur(s.cumRepurchases),
      cumIssues: eur(s.cumIssues),
    },
    stars: [...s.stars] as Vec3, webStars: mid.webStars, failedVisitsPct: mid.failedVisitsPct,
    carbonTonnes: Math.round(carbonTonnes * 10) / 10,
    warnings: w,
    effectiveDecisions,
    details,
  };
  return { state: s, report };
}
