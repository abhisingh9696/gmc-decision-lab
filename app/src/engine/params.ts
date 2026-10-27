import { SOURCE } from './source-data';
// Parameters from the GMC Manual (Tables 1–27) and calibration constants
// derived from the team's 5-quarter company history (2015Q1–2016Q1).

export const P = {
  // Table 5 — manufacturing
  machTimeMin: [60, 75, 120] as const,       // per unit
  minAssemblyMin: [100, 150, 300] as const,
  materialContent: [1, 2, 3] as const,       // material units per product unit

  // Table 7 — machine hours per quarter per machine by shift level
  shiftMachHours: { 1: 576, 2: 1068, 3: 1602 } as Record<number, number>,
  unskilledPerMachine: { 1: 4, 2: 8, 3: 12 } as Record<number, number>,

  // Table 16/17 — worker hours & pay
  // Assembly is single-shift with AUTOMATIC overtime (more.htm):
  // 420 basic + up to 84 Saturday + up to 72 Sunday hours per worker per quarter.
  assemblyBasicHours: 420,
  assemblySaturdayHours: 84,
  assemblySundayHours: 72,
  assemblyAttendance: 0.97,                // 3% absence allowance
  saturdayPremium: 1.5,                    // Saturday overtime paid at 1.5×
  sundayPremium: 2.0,                      // Sunday overtime paid at 2×
  unskilledWageRatio: 0.65,                  // of skilled rate
  shiftPremium: { 1: 0, 2: 1 / 3, 3: 2 / 3 } as Record<number, number>,
  minWageCents: 900,

  // Table 18 — plant
  machineCost: 300000,
  machineDepreciation: 0.025,                // per quarter
  decommissionCharge: 60000,

  // Table 6 — maintenance
  maintContractRate: 85,                     // €/hour
  maintBreakdownRate: 175,

  // Table 10 — production costs
  supervisionPerShift: 12500,
  overheadPerMachine: 3500,
  machineRunningPerHour: 8,
  planningPerUnit: 1,
  inspectionPerUnit: 1,

  // Table 8/9 — scrap & guarantee
  scrapValue: [40, 80, 120] as const,
  guaranteeFee: [60, 150, 250] as const,

  // Table 11/12 — distribution
  containerCap: [500, 250, 125] as const,
  transportPerDay: 650,
  europeJourneyKm: SOURCE.context.europeJourneyKm, // whole reported journey, including return
  kmPerDay: 400,
  naftaContainerCrossing: 8000,
  naftaPortKm: 250,
  netAgentKm: 150,

  // Table 13 — purchasing & warehousing
  purchasingAdmin: 7500,
  unplannedPremium: 0.10,                    // spot +10%
  premiumMaterialsPremium: 0.50,             // spot +50%
  extStorageMaterial: 2.50,
  storageProductEU: 3.50,
  storageProductNaftaUSD: 4,

  // Table 3/4 — channels
  agentMinSupport: 5,                        // €'000
  agentSetup: 7500,
  agentTermination: 5000,
  ispPerPort: 1000,
  internetServicePct: 0.03,                  // of internet sales value

  // Table 15 — personnel
  recruitCost: 2000,
  dismissCost: 5000,
  trainCost: 8500,
  consultantPerDay: 1000,

// Table 20 — financial
  taxRate: 0.25,
  overdraftSpread: 0.04,
  unauthorisedSpread: 0.10,
  termLoanRate: 10,                          // % p.a. on term loans
  factoryFixedPerSqm: 20,                    // per quarter
  creditControlPerUnit: 1,
  creditCardPerUnit: 1,
  salesOfficePctOrders: 0.01,

  // Table 2 — information
  infoMarketCost: 5000,
  infoCompetitorsCost: 7500,

  // Table 22 — insurance: plan -> [primaryRisk%, premium%] of (non-current assets + inventories)
  insurance: {
    0: { risk: 1.0, premium: 0 },
    1: { risk: 0.001, premium: 0.006 },
    2: { risk: 0.002, premium: 0.0035 },
    3: { risk: 0.003, premium: 0.002 },
    4: { risk: 0.004, premium: 0.001 },
  } as Record<number, { risk: number; premium: number }>,

  // Table 23 — customer credit (days)
  creditDays: [60, 90, 0] as const,

  // Table 26 — space
  landUseMax: 0.80,
  factoryUseMax: 0.75,
  sqmPerMachine: 25,
  sqmPerWorker: 10,
  sqmPer1000Materials: 5,
  wipSqm: [0.25, 0.5, 1.0] as const,

  // material prices ($ per '000 units) from 2016Q1 report
  matPriceSpotUSD: SOURCE.context.matPriceSpotUSD,
  matPrice3mUSD: SOURCE.context.matPrice3mUSD,
  matPrice6mUSD: SOURCE.context.matPrice6mUSD,
  // Table 21 — materials are valued at 90% of the LOWEST quoted price
  // (spot / 3-month / 6-month), converted to euros.
  matValuationDiscount: 0.9,
  // Table 21 — finished-goods standard cost build-up per product:
  // material content (at valuation) + machining hours × rate + assembly hours × rate.
  // Used to allocate opening stock value per product and to apportion the
  // production pool across products. Rates are model standards (€/hour).
  fgValMachineRate: 25,
  fgValAssemblyRate: 12.6,
  // subcontracted components: ordered this quarter, delivered next quarter as
  // machined components (WIP) that still need assembly. Cost per manual
  // (m2.htm): driven by the CURRENT material spot price, the premium-materials
  // share and the exchange rate, plus the subcontractor's machining margin.
  // Assembly cost is NOT included (we do it).
  // CALIBRATED to the official 2016 Q1 management report (HstY16Q1.Xls, Group
  // information sheet): "Component cost (€ per unit) — from (no premium
  // materials) 124 / 204 / 314, to (100% premium materials) 157 / 269 / 411",
  // quoted at spot $71,919/'000 and €0.9/$ → spotEURref 64.7271. The engine
  // derives a per-product contractor factor and a premium adder fraction from
  // these six endpoints, so every endpoint reproduces EXACTLY at reference
  // conditions, with linear interpolation in the premium-materials % and
  // sensible scaling under material-price / FX moves.
  subcontractQuoteRef: {
    spotEUR: 64.7271,                 // € per material unit at the quote
    min: SOURCE.context.quoteMin,    // €/unit at 0% premium materials
    max: SOURCE.context.quoteMax,    // €/unit at 100% premium materials
  },
  buildingCostPerSqm: SOURCE.context.buildingCostPerSqm,

  // Table 25 — effective website capacity (visits/hour) by number of ports.
  // Intermediate port counts are linearly interpolated between these points.
  portCapacity: [[1, 2], [2, 7], [5, 31], [10, 81], [20, 190], [50, 537]] as const,

  // ---- Calibration constants (heuristic demand model) ----
  // Base demand per [market][product] at reference conditions, seasonality = 1.0
  // Calibrated so the model reproduces actual 2016 Q1 orders (seasonality Q1 = 0.85).
  baseDemand: SOURCE.context.referenceOrders.map(row=>[row[0]/.85,row[1]/.85,row[2]/.85] as const) as Mat3x3Const,
  seasonalityByQ: [0.85, 0.95, 1.06, 1.38] as const, // Q1 low, Q4 peak
  priceElasticity: [-2.1, -1.8, -1.3] as const,
  // reference conditions (2016 Q1 decisions) for normalization
  refAdvProd: SOURCE.sourceDecisions.advProd,      // €'000
  refAdvCorp: [10, 5, 10] as const,
  refAgents: { n: 3, support: 10, comm: 7 },
  refDist: { n: 1, support: 8, comm: 6 },
  refNetDist: { support: 9, comm: 5 },
  refStars: [2, 3, 2] as const,
  rejectBaseRate: 0.029, // ~3% of production rejected (from history)
  fxRef: 0.9,
};

type Mat3x3Const = readonly (readonly [number, number, number])[];
