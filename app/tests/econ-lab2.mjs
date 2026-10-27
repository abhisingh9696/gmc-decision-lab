// Economics lab — part 2: capacity economics + strategy tournament (base + downside).
import { pathToFileURL } from 'node:url';
import { appendFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

if (!existsSync('tests/.econ-engine.mjs')) {
  execSync('npx esbuild src/engine/q3.ts --bundle --format=esm --outfile=tests/.econ-engine.mjs', { stdio: 'pipe' });
}
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon, QUARTERS } = E;
const mk = () => Array.from({ length: 4 }, () => defaultDecisions());
const clone = d => JSON.parse(JSON.stringify(d));
const eur = n => '€' + Math.round(n).toLocaleString('en-IE');

// ---------- Q4 CAPACITY MATH ----------
console.log('=== CAPACITY ECONOMICS ===');
{
  const b = runSimulation(mk());
  for (let i = 0; i < 4; i++) {
    const r = b.reports[i];
    const ordTotal = r.orders.flat().reduce((a, c) => a + c, 0);
    const soldTotal = r.sales.flat().reduce((a, c) => a + c, 0);
    console.log(`${QUARTERS[i]}: orders ${ordTotal} | sold ${soldTotal} | mach ${r.machHoursNeeded}h/${r.machHoursAvail}h (${(r.machHoursNeeded / Math.max(1, r.machHoursAvail) * 100).toFixed(0)}%) | scaled=${r.productionScaled} | assemb ${r.assemblyHoursNeeded}h/${r.assemblyHoursAvail}h`);
  }
  console.log('Q4 alert titles:', b.reports[1].warnings.map(w => w.title).join(' | '));
  console.log('Q4 backlog end:', JSON.stringify(b.reports[1].backlogEnd), 'lost NET:', JSON.stringify(b.reports[1].lostInternetDemand));
}

// ---------- STRATEGY TOURNAMENT ----------
console.log('\n=== STRATEGY TOURNAMENT (4 quarters, base + downside: growth×0.85, rivals×0.95) ===');
const down = es => es.map(e => ({ ...e, growth: e.growth * 0.85, compPrices: e.compPrices.map(r => r.map(v => Math.round(v * 0.95))) }));

const strategies = {};
strategies['S1 Baseline (Q2 prices rolled)'] = ds => {};

strategies['S2 Peak-load pricing (Q4 +18% P3/P2, +10% P1)'] = ds => {
  // capacity-constrained Q4: raise price where elasticity lowest; slight Q3 bump on P3
  ds[1].prices = ds[1].prices.map((row, m) => row.map((v, p) => Math.min(999, Math.round(v * (p === 2 ? 1.18 : p === 1 ? 1.18 : 1.10)))));
  ds[0].prices = ds[0].prices.map((row, m) => row.map((v, p) => p === 2 ? Math.min(999, Math.round(v * 1.08)) : v));
};

strategies['S3 Capacity expansion (2 machines + 12 machinists in Q3)'] = ds => {
  ds[0].machinesBuy = 2; ds[0].hire = 12; ds[0].maintenance = 25; ds[0].termLoan = 600;
  ds[1].shift = 2;
};

strategies['S4 Futures ladder (3m 8k + 6m 12k, spot only for gap)'] = ds => {
  // Q3 needs ~6.1k materials: opening 1,332 → buy 5k spot; Q4 needs ~8k: futures now
  ds[0].matSpot = 5; ds[0].matM3 = 8; ds[0].matM6 = 12;
};

strategies['S5 IP endgame (issue Q3 +10%, dividends Q4→Q2)'] = ds => {
  ds[0].shares = 400;                    // +10% issue at SP>1 (annual cap)
  ds[1].dividend = 40;                   // % of... actually % payout of reserves? engine: % — use modest
  ds[2].dividend = 40; ds[3].dividend = 40;
};

strategies['S6 Quality moat (R&D 99×2, launch P1 Q4 & P3 Q2-17, premium 20% P2/P3)'] = ds => {
  ds[0].rd = [99, 40, 99]; ds[1].rd = [40, 0, 40];
  ds[1].takeImprovement = [true, false, false];
  ds[3].takeImprovement = [false, false, true];
  ds[0].premium = [0, 20, 20]; ds[1].premium = [0, 20, 20]; ds[2].premium = [0, 20, 20]; ds[3].premium = [0, 20, 20];
};

strategies['S7 Demand-max (ads 4×, support 15, commission 9, agents 4)'] = ds => {
  for (let qi = 0; qi < 4; qi++) {
    ds[qi].advProd = ds[qi].advProd.map(r => r.map(v => Math.min(99, v * 4)));
    ds[qi].advCorp = ds[qi].advCorp.map(v => Math.min(99, v * 2));
    ds[qi].agentsEU.support = 15; ds[qi].agentsEU.commission = 9; ds[qi].agentsEU.want = 4;
    ds[qi].distNafta.support = 12; ds[qi].distNet.support = 12;

  }
};

strategies['S8 COMBO (S2 prices + S4 futures + S5 IP + S3-lite expansion)'] = ds => {
  strategies['S2 Peak-load pricing (Q4 +18% P3/P2, +10% P1)'](ds);
  strategies['S4 Futures ladder (3m 8k + 6m 12k, spot only for gap)'](ds);
  strategies['S5 IP endgame (issue Q3 +10%, dividends Q4→Q2)'](ds);
  ds[0].machinesBuy = 1; ds[0].hire = 6; ds[0].maintenance = 25;
};

const run1 = (name, fn) => {
  const ds = mk(); fn(ds);
  const b = runSimulation(ds);
  const d = runSimulation(ds, down(Array.from({ length: 4 }, (_, i) => defaultEcon([2, 3, 0, 1][i]))));
  const agg = sim => {
    let rev = 0, np = 0, alerts = 0, minCash = Infinity, ipEnd = 0, scaled = 0;
    for (const r of sim.reports) {
      rev += r.revenue; np += r.netProfit; alerts += r.warnings.filter(w => w.severity !== 'info').length;
      const cash = r.cashEnd - r.overdraftEnd + r.details.balance.deposit;
      minCash = Math.min(minCash, cash);
      if (r.productionScaled) scaled++;
    }
    ipEnd = sim.reports[3].investmentPerformance;
    return { rev, np, alerts, minCash, ipEnd, scaled };
  };
  const B = agg(b), D = agg(d);
  const crit = b.reports.flatMap(r => r.warnings.filter(w => w.severity === 'critical' || /breach|refus|forced|unauthor/i.test(w.title + w.detail)).map(w => `${QUARTERS[b.reports.indexOf(r)]}: ${w.title}`));
  console.log(`\n${name}`);
  console.log(`  BASE : rev ${eur(B.rev)} | net ${eur(B.np)} | IP ${eur(B.ipEnd)} | minCash ${eur(B.minCash)} | alerts ${B.alerts} | scaledQs ${B.scaled}${crit.length ? '\n         ⚠ ' + crit.slice(0, 3).join(' · ') : ''}`);
  console.log(`  DOWN : net ${eur(D.np)} | IP ${eur(D.ipEnd)} | minCash ${eur(D.minCash)} | alerts ${D.alerts}`);
  return { B, D, ds };
};

const results = {};
for (const [name, fn] of Object.entries(strategies)) results[name] = run1(name, fn);

console.log('\n=== RANKING by base net profit ===');
Object.entries(results).sort((a, b) => b[1].B.np - a[1].B.np).forEach(([n, r], i) =>
  console.log(`${i + 1}. ${n}: net ${eur(r.B.np)} | IP ${eur(r.B.ipEnd)} | downside net ${eur(r.D.np)}`));
console.log('\nDONE part 2');
