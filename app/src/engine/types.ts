// GMC Decision Lab — type definitions
// Markets: 0 = EU, 1 = Nafta, 2 = Internet. Products: 0,1,2 = P1,P2,P3.

export type Vec3 = [number, number, number];
export type Mat3x3 = [Vec3, Vec3, Vec3]; // [market][product]

export interface AgentBlock {
  want: number;       // number wanted for next quarter
  support: number;    // €'000 per agent/distributor
  commission: number; // %
}

export interface Decisions {
  // Products
  advCorp: Vec3;            // corporate image advertising €'000 per market
  advProd: Mat3x3;          // product advertising €'000 [market][product]
  prices: Mat3x3;           // € [market][product]
  deliveries: Mat3x3;       // units to make & ship [market][product]
  takeImprovement: [boolean, boolean, boolean];
  rd: Vec3;                 // €'000 per product
  assemblyTimes: Vec3;      // minutes per product
  premium: Vec3;            // % premium materials per product
  subcontract: Vec3;        // components to order (units)
  // Resources
  agentsEU: AgentBlock;
  distNafta: AgentBlock;
  distNet: { support: number; commission: number };
  // Operations
  matSpot: number; // '000 units
  matM3: number;
  matM6: number;
  maintenance: number; // hours per machine
  shift: 1 | 2 | 3;
  ports: number;
  webDev: number; // €'000
  // Personnel
  hire: number;        // +hire / -fire assembly workers
  train: number;       // assembly workers to train
  wage: number;        // cents/hour
  mgmtBudget: number;  // €'000
  trainingDays: number;
  // Finance
  shares: number;      // '000 shares issue+/repurchase-
  dividend: number;    // cents per share
  termLoan: number;    // €'000
  termDeposit: number; // €'000 change +/-
  machinesBuy: number;
  machinesSell: number;
  factoryExt: number;  // sq m
  insurance: 0 | 1 | 2 | 3 | 4;
  // Information
  infoMarket: boolean;
  infoCompetitors: boolean;
}

export interface EconAssumptions {
  exchangeRate: number; // € per $ (applies next quarter)
  baseRate: number;     // % p.a. EU base rate
  seasonality: number;  // demand index for the quarter
  growth: number;       // underlying market growth factor for the quarter
  compPrices: Mat3x3;   // competitor average prices [market][product]
}

export interface CompanyState {
  /** Oldest first. Legacy states without cohorts use a disclosed equal-value allocation. */
  machineCohorts?: { count: number; value: number }[];
  quarterLabel: string;   // e.g. "2016 Q2"
  seasonIndex: number;    // 0..3 => Q1..Q4
  // physical
  machines: number;
  machineEfficiency: number; // %
  machineValue: number;      // € book value of machinery
  assemblyWorkers: number;
  machinists: number;
  factoryArea: number;       // sq m built
  landUnused: number;        // sq m
  // pipelines (arrive NEXT quarter)
  machinesPipeline: number;
  workersPipeline: number;
  traineesPipeline: number;
  factoryExtPipeline: number;
  agentsPipeline: number;    // EU agents appointed, active next quarter
  portsPipeline: number | null;
  subcontractPipeline: Vec3;    // component units arriving next quarter
  subcontractPipelineVal: Vec3; // € order value per product (FX-locked at order)
  subcontractPayable: number;   // € second 50% instalment due next quarter (Table 24)
  matPipeline3: number;      // '000 units arriving next quarter
  matPipeline6: number;      // '000 units arriving in 2 quarters
  // stocks
  materialsStock: number;    // units ('000? no — units of material, single units)
  componentWipUnits: Vec3;   // subcontracted components in stock, awaiting assembly
  componentWipValue: Vec3;   // € book value of component WIP (at purchase cost)
  productStocks: Mat3x3;     // finished units [market][product]
  backlog: Mat3x3;           // unfulfilled orders carried [market][product] (net always 0)
  // channel
  agentsEU: number;
  distNafta: number;
  distNet: number;
  ports: number;
  // finance
  cash: number;
  termDepositAmt: number;
  receivables: number;
  payables: number;
  taxDue: number;
  termLoanAmt: number;
  shareCapital: number;      // € (1€/share)
  shareCapYearStart: number; // issued capital at the START of the year — basis for the ±10% annual dealing cap
  sharesIssuedThisYear: number;    // € nominal issued so far this calendar year
  sharesRepurchasedThisYear: number; // € nominal repurchased so far this calendar year
  retainedEarnings: number;
  sharePrice: number;        // € per share
  machineryBoughtThisYear: number;
  // marketing memory
  corpImage: Vec3;           // cumulative corporate image index per market
  webImage: number;          // cumulative website quality index
  stars: Vec3;               // product star ratings
  rdProgress: Vec3;          // cumulative R&D progress per product
  // scoreboard
  cumDividends: number;
  cumRepurchases: number;
  cumIssues: number;
  taxableCarryforward: number; // negative = loss carryforward
  improvementsAvailable: [boolean, boolean, boolean]; // product improvements ready to take up
  // exact accounting state (balance-sheet reconciliation)
  priorWage: number;        // last quarter's effective wage (cents/hr) — wages cannot be cut
  overdraftLimit: number; // last reported authorised limit
  borrowingPower: number;   // from last management report: 50% mkt value − loans − overdraft limit
  sharePremium: number;     // € share premium account
  finishedGoodsValue: number; // € book value of finished-goods inventory (sum of productFGValue)
  productFGValue: Vec3;     // € book value of finished stock PER PRODUCT (Table 21 roll-forward)
  materialsValue: number;   // € book value of materials inventory (Table 21 basis)
  matPipeline3Val: number;  // € value of 3-month futures arriving next quarter
  matPipeline6Val: number;  // € value of 6-month futures arriving in 2 quarters
  buildingValue: number;    // € book value of buildings
  capitalWip: number;       // € paid for machines/extensions not yet arrived
  overdraft: number;        // € overdraft balance (0 when cash positive)
  // management budget rule (more.htm): reductions need 1 quarter notice, max 10%/quarter
  mgmtBudgetEffective: number; // €'000 budget actually charged this quarter
  mgmtBudgetPending: number | null; // €'000 reduction announced, effective next quarter
}

export interface StatementDetails {
  inventoryEvidence: { method:string; standardUnit:Vec3; productValues:Vec3; materialsOnOrderValue:number };
  productionCosts: { machinists: number; recruited: number; dismissed: number; physicalMachineHours: number; machinistHoursPerPerson: number; machinistWages: number; assemblyTimeWages: number; parityPayment: number; assemblyWages: number; runningCosts: number; inspection: number; transport: number };
  income: {
    revenue: number; cogs: number; grossProfit: number; adminExpenses: number;
    depreciation: number; operatingProfit: number; interestReceived: number;
    interestPaid: number; pbt: number; taxAssessed: number; netProfit: number;
  };
  adminBreakdown: { label: string; value: number }[];
  cashFlow: {
    openingCash: number; collected: number; interestReceived: number; loanDrawn: number;
    shareCash: number; obsoleteProceeds: number; scrapProceeds: number; assetProceeds: number; paidSuppliersAdmin: number; paidProduction: number;
    paidMaterials: number; subcontractPaid: number; dividendPaid: number; capex: number; taxPaid: number;
    interestPaid: number; depositChange: number;
    closingCash: number; overdraftEnd: number;
  };
  workingCapital: {
    receivablesOpen: number; receivablesEnd: number;
    payablesOpen: number; payablesEnd: number;
    closingInvValue: number; materialsStock: number;
  };
  retained: { opening: number; netProfit: number; dividendPaid: number; repurchaseCharge: number; closing: number };
  balance: {
    fixedAssets: number; capitalWip: number; inventories: number; materialsValue: number;
    wipComponents: number;
    materialsOnOrder: number; receivables: number;
    cash: number; deposit: number; payables: number; taxDue: number; overdraft: number;
    termLoan: number; shareCapital: number; sharePremium: number; retainedEarnings: number;
  };
}

export interface Warning {
  severity: 'critical' | 'warn' | 'info';
  title: string;
  detail: string;
  adjustment?: boolean; // true when the engine CHANGED a decision value (vs. a pure alert)
}

export interface QuarterReport {
  quarterLabel: string;
  // demand
  orders: Mat3x3;
  sales: Mat3x3;
  backlogEnd: Mat3x3;
  lostInternetDemand: Vec3;
  // production
  productionPlanned: Vec3;
  productionActual: Vec3;
  productionScaled: boolean;
  rejects: Vec3;
  grossStarts: Vec3;         // scheduled gross units (good + rejects)
  rejectRate: Vec3;          // assumed reject fraction per product
  assemblyWorkersOpen: number; // opening assembly headcount
  obsoleteUnits: number;     // old-model units liquidated on improvement launch
  obsoleteByProduct: Vec3;   // liquidated units per product (valued per product, Table 21)
  obsoleteProceeds: number;  // € received for liquidated stock (sold at valuation)
  machHoursNeeded: number;
  machHoursAvail: number;
  assemblyHoursNeeded: number;
  assemblyHoursAvail: number;
  // automatic overtime tiers actually used (more.htm: 420 basic + 84 Sat + 72 Sun)
  assemblyTiers: { basic: number; saturday: number; sunday: number };
  mgmtBudgetEffective: number; // €'000 management budget actually charged
  materialsNeeded: number;
  materialsShortfall: number;
  componentWipEnd: Vec3;     // subcontracted components left in WIP (units)
  spaceNeeded: number;
  spaceAvail: number;
  // money (€)
  revenue: number;
  cogs: number;
  grossProfit: number;
  adminExpenses: number;
  operatingProfit: number;
  netInterest: number;
  pbt: number;
  tax: number;
  netProfit: number;
  cashEnd: number;
  overdraftEnd: number;
  overdraftLimit: number;   // authorised limit per Table 19 (opening balances)
  unauthorised: boolean;
  dividendPaid: number;
  // scores
  sharePrice: number;
  marketValue: number;
  investmentPerformance: number;
  // full valuation decomposition so the UI can show WHERE the proxy comes
  // from (NAV vs sentiment vs distributions) instead of one opaque number
  ipBreakdown: {
    navPerShare: number;      // € equity per share before sentiment
    sentiment: number;        // multiplier (ROE, dividend yield, liquidity), clamped 0.5–2.2
    marketValue: number;      // € sharePrice × shares
    cumDividends: number;     // € cumulative dividends paid so far
    cumRepurchases: number;   // € cumulative share buybacks so far
    cumIssues: number;        // € cumulative share issues so far
  };
  stars: Vec3;
  webStars: number;
  failedVisitsPct: number;
  carbonTonnes: number;
  warnings: Warning[];
  // the decisions the engine ACTUALLY executed this quarter: sanitized inputs
  // plus every financial restriction (annual share cap, below-par block,
  // dividend opening-reserve cap, borrowing-power loan cap, deposit cap,
  // credit-worthiness capex caps, mgmt-budget notice rule). Portal Export
  // prints these so the transcription can never disagree with the forecast.
  effectiveDecisions: Decisions;
  details: StatementDetails;
}
