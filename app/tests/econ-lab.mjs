// Economics lab — part 1: empirical demand probes + unit economics + Lerner pricing.
// Everything runs through the verified engine (dist bundle of src/engine/q3.ts).
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

if (!existsSync('tests/.econ-engine.mjs')) {
  execSync('npx esbuild src/engine/q3.ts --bundle --format=esm --outfile=tests/.econ-engine.mjs', { stdio: 'pipe' });
}
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon, QUARTERS } = E;

const mk = () => Array.from({ length: 4 }, () => defaultDecisions());
const clone = d => JSON.parse(JSON.stringify(d));
const e0 = defaultEcon(2); // Q3 econ — inspect structure
console.log('ECON KEYS:', Object.keys(e0).join(','));
console.log('compPrices Q3:', JSON.stringify(e0.compPrices), 'growth', e0.growth, 'seasonality', e0.seasonality, 'fx', e0.exchangeRate);

const base = runSimulation(mk());
const q = i => base.reports[i];
const sum = { rev: 0, np: 0 };
for (const r of base.reports) { sum.rev += r.revenue; sum.np += r.netProfit; }
console.log('\nBASELINE (default decisions, 4 qtrs): total revenue €' + sum.rev.toLocaleString('en-IE', { maximumFractionDigits: 0 }) + ' net €' + sum.np.toLocaleString('en-IE', { maximumFractionDigits: 0 }));
console.log('Q3 baseline orders matrix:', JSON.stringify(q(0).orders));
console.log('Q3 baseline sales matrix:', JSON.stringify(q(0).sales));
console.log('Q3 prices default:', JSON.stringify(mk()[0].prices));

// ---------- 1) PRICE ELASTICITY PROBES (Q3 only) ----------
console.log('\n=== EMPIRICAL PRICE ELASTICITY (Q3, one lever at a time) ===');
const MK = ['EU', 'NAFTA', 'NET'];
for (let m = 0; m < 3; m++) for (let p = 0; p < 3; p++) {
  const row = [];
  for (const f of [0.9, 1.1]) {
    const ds = mk(); ds[0].prices[m][p] = Math.round(ds[0].prices[m][p] * f);
    const r = runSimulation(ds).reports[0];
    row.push({ f, orders: r.orders[m][p] });
  }
  const o0 = base.reports[0].orders[m][p];
  const eps = Math.log(row[1].orders / row[0].orders) / Math.log(row[1].f / row[0].f);
  console.log(`${MK[m]} P${p + 1}: base orders ${o0} | -10%: ${row[0].orders} | +10%: ${row[1].orders} | empirical ε ≈ ${eps.toFixed(2)}`);
}

// ---------- 2) ADVERTISING RESPONSE (sqrt diminishing returns) ----------
console.log('\n=== ADVERTISING RESPONSE (Q3 EU P1, ref €5k; corporate EU ref €10k) ===');
{
  const m = 0, p = 0;
  for (const mult of [0.5, 1, 2, 4, 8]) {
    const ds = mk(); ds[0].advProd[m][p] = 5 * mult;
    const o = runSimulation(ds).reports[0].orders[m][p];
    const o0 = base.reports[0].orders[m][p];
    console.log(`prod ads €${(5 * mult).toFixed(0)}k: orders ${o} (${((o / o0 - 1) * 100).toFixed(1)}% vs base) | marginal vs previous step`);
  }
  for (const mult of [0.5, 1, 2, 4]) {
    const ds = mk(); ds[0].advCorp[m] = 10 * mult;
    const o = runSimulation(ds).reports[0].orders[m][p];
    const o0 = base.reports[0].orders[m][p];
    console.log(`corp ads EU €${(10 * mult).toFixed(0)}k: EU P1 orders ${o} (${((o / o0 - 1) * 100).toFixed(1)}%)`);
  }
}

// ---------- 3) CHANNEL LEVERS ----------
console.log('\n=== CHANNEL LEVERS (Q3) ===');
{
  const o0 = base.reports[0].orders;
  let ds = mk(); ds[0].agentsEU.commission = 9;
  let r = runSimulation(ds).reports[0];
  console.log(`EU commission 7→9%: EU P1 ${o0[0][0]}→${r.orders[0][0]} (${((r.orders[0][0] / o0[0][0] - 1) * 100).toFixed(1)}%), extra commission cost on sales`);
  ds = mk(); ds[0].agentsEU.support = 15;
  r = runSimulation(ds).reports[0];
  console.log(`EU support 10→15k: EU P1 ${o0[0][0]}→${r.orders[0][0]} (${((r.orders[0][0] / o0[0][0] - 1) * 100).toFixed(1)}%)`);
  ds = mk(); ds[0].agentsEU.want = 4;
  r = runSimulation(ds).reports[0];
  console.log(`EU agents 3→4 (arrive Q4): Q4 EU P1 ${base.reports[1].orders[0][0]}→${r.reports[1].orders[0][0]}`);
  ds = mk(); ds[0].ports = 10;
  r = runSimulation(ds).reports[0];
  console.log(`ports 5→10: NET P1 ${o0[2][0]}→${r.orders[2][0]} (failed visits baseline ${base.reports[0].failedVisitsPct.toFixed(2)}% → ${r.failedVisitsPct.toFixed(2)}%)`);
}

// ---------- 4) UNIT ECONOMICS (analytical from manual + engine calibration) ----------
console.log('\n=== UNIT VARIABLE COST & CONTRIBUTION (defaults: prices, wage 12, spot materials 84.547) ===');
const matUSD = 84.547; // € per unit of material
const matPer = [1, 2, 3];
const machMin = [60, 75, 120];
const asMinDefault = [115, 165, 325];
const unskilled = 0.65 * 12; // 7.8 €/h
const commRate = [0.07, 0.06, 0.05];
const guarantee = [1.9, 4.7, 7.8]; // engine-calibrated ≈8,129/3,284 scaled by manual ratio 60:150:250
const transport = [
  [4550 / 500, 4550 / 250, 4550 / 125],       // EU: 7 days × €650
  [9300 / 500, 9300 / 250, 9300 / 125],       // NAFTA: 2 days + Atlantic €8,000
  [650 / 500, 650 / 250, 650 / 125],          // NET: 1 day
];
const prices = mk()[0].prices;
for (let m = 0; m < 3; m++) for (let p = 0; p < 3; p++) {
  const P0 = prices[m][p];
  const C = matPer[p] * matUSD + machMin[p] / 60 * (8 + unskilled * 1.1) + asMinDefault[p] / 60 * 12
    + guarantee[p] + transport[m][p] + 1 + 3.5 + commRate[m] * P0;
  const contrib = P0 - C;
  const machH = machMin[p] / 60;
  console.log(`${MK[m]} P${p + 1}: price €${P0} | VC €${C.toFixed(0)} | contribution €${contrib.toFixed(0)} (${(contrib / P0 * 100).toFixed(0)}%) | €${(contrib / machH).toFixed(0)}/machine-h | ε=${[-2.1, -1.8, -1.3][p]}`);
}

// ---------- 5) LERNER OPTIMAL PRICE per [m][p] (unconstrained) ----------
console.log('\n=== LERNER OPTIMAL PRICES (max contribution profit per market-product, capacity-free) ===');
for (let m = 0; m < 3; m++) for (let p = 0; p < 3; p++) {
  const eps = [-2.1, -1.8, -1.3][p];
  const P0 = prices[m][p];
  const C0 = matPer[p] * matUSD + machMin[p] / 60 * (8 + unskilled * 1.1) + asMinDefault[p] / 60 * 12
    + guarantee[p] + transport[m][p] + 1 + 3.5;
  // π(P) = (P(1-c) - C0) * K * P^ε ; K = Q0/P0^ε ; optimum: P* = C0*ε/((ε+1)*(1-c))
  const c = commRate[m];
  let Pstar = C0 * eps / ((eps + 1) * (1 - c));
  Pstar = Math.max(1, Math.min(999, Math.round(Pstar)));
  const rel = Pstar / e0.compPrices[m][p];
  console.log(`${MK[m]} P${p + 1}: current €${P0} → Lerner €${Pstar} (relPrice ${rel.toFixed(2)}${rel < 0.72 ? ' ⚠ suspicion cliff' : ''})`);
}

// ---------- 6) Q4 CAPACITY vs PEAK DEMAND ----------
console.log('\n=== Q4 PEAK-LOAD CHECK (seasonality 1.38) ===');
{
  const r1 = base.reports[1];
  const machHoursAvail = r1.machHoursAvail, machNeeded = r1.machHoursNeeded;
  console.log(`Q4 at default prices: machining needed ${machNeeded}h vs available ${machHoursAvail}h (${(machNeeded / machHoursAvail * 100).toFixed(0)}%) — productionScaled=${r1.productionScaled}, planned ${r1.productionPlanned.reduce((a, b) => a + b, 0)} vs orders ${(r1.orders[0].concat(r1.orders[1], r1.orders[2])).reduce((a, b) => a + b, 0)}`);
  console.log(`Q4 alerts: ${r1.warnings.map(w => w.title).join(' | ') || 'none'}`);
  console.log(`Q4 unfulfilled demand: backlogEnd ${JSON.stringify(r1.backlogEnd)} lostNET ${JSON.stringify(r1.lostInternetDemand)}`);
}
appendFileSync('.gitignore', '\n.econ-engine.mjs\n');
console.log('\nDONE part 1');
