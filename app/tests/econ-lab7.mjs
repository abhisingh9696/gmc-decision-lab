// Part 7: final forecast dumps for the three presented strategies.
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
if (!existsSync('tests/.econ-engine.mjs')) execSync('npx esbuild src/engine/q3-test-shim.ts --bundle --format=esm --outfile=tests/.econ-engine.mjs', { stdio: 'pipe' });
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon } = E;
const mk = () => Array.from({ length: 4 }, () => defaultDecisions());
const SEAS = [2, 3, 0, 1];
const down = es => es.map(e => ({ ...e, growth: e.growth * 0.85, compPrices: e.compPrices.map(r => r.map(v => Math.round(v * 0.95))) }));
const FIN = ds => { ds[1].shares = 400; ds[1].dividend = 40; ds[2].dividend = 40; ds[3].dividend = 90; };
const MAINT = ds => { for (const d of ds) d.maintenance = 25; };
const DELIV = (ds, f = [1.07, 1.07, 1.03, 1.05]) => { for (let i = 0; i < 4; i++) ds[i].deliveries = ds[i].deliveries.map(r => r.map(v => Math.round(v * f[i]))); };
const CYBER = P => { P.baseDemand = P.baseDemand.map((row, m) => m === 2 ? row.map(v => v * 0.7) : row); };

const S = {
  'S-A Premium Reset + Full Finance': ds => {
    for (const qi of [0, 1, 2, 3]) ds[qi].prices = [[360, 530, 730], [370, 530, 755], [430, 640, 900]];
    DELIV(ds); MAINT(ds); FIN(ds);
  },
  'S-B Peak Harvest + Finance': ds => {
    for (const qi of [0, 2, 3]) ds[qi].prices = [[325, 490, 756], [335, 490, 783], [375, 590, 918]];
    ds[1].prices = [[374, 613, 896], [385, 613, 928], [431, 738, 999]];
    DELIV(ds); MAINT(ds); FIN(ds);
  },
  'S-C Parity Volume (defensive)': ds => {
    for (const qi of [0, 1, 2, 3]) ds[qi].prices = [[325, 490, 700], [335, 490, 725], [375, 590, 850]];
    DELIV(ds); MAINT(ds); FIN(ds);
  },
};

for (const [name, fn] of Object.entries(S)) {
  console.log(`\n########## ${name} ##########`);
  for (const [tag, es] of [['BASE', SEAS.map(q => defaultEcon(q))], ['DOWNSIDE', down(SEAS.map(q => defaultEcon(q)))]]) {
    const ds = mk(); fn(ds);
    const sim = runSimulation(ds, es);
    console.log(`-- ${tag} --`);
    for (const r of sim.reports) {
      const cash = r.cashEnd - r.overdraftEnd + r.details.balance.deposit;
      const ord = r.orders.flat().reduce((a, b) => a + b, 0), sold = r.sales.flat().reduce((a, b) => a + b, 0);
      console.log(`${r.quarterLabel}: rev ${Math.round(r.revenue).toLocaleString()} | net ${Math.round(r.netProfit).toLocaleString()} | cash ${Math.round(cash).toLocaleString()} | SP ${r.sharePrice.toFixed(4)} | IP ${Math.round(r.investmentPerformance).toLocaleString()} | div ${Math.round(r.dividendPaid).toLocaleString()} | ord/sold ${ord}/${sold} | alerts ${r.warnings.filter(w => w.severity !== 'info').length}`);
    }
  }
  // cyber case
  const ds = mk(); fn(ds);
  const saved = JSON.parse(JSON.stringify(E.P.baseDemand));
  CYBER(E.P);
  const sim = runSimulation(ds, SEAS.map(q => defaultEcon(q)));
  E.P.baseDemand = saved;
  const last = sim.reports[3];
  console.log(`-- CYBER (NET −30% all qtrs) -- final IP ${Math.round(last.investmentPerformance).toLocaleString()} | net total ${Math.round(sim.reports.reduce((a, r) => a + r.netProfit, 0)).toLocaleString()}`);
}
