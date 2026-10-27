// A/B part 2: W5/S-A with and without withCase wrapper + compPrices identity check.
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
if (!existsSync('tests/.ab-shim.mjs')) execSync('npx esbuild src/engine/q3-test-shim.ts --bundle --format=esm --outfile=tests/.ab-shim.mjs', { stdio: 'pipe' });
const S = await import(pathToFileURL('tests/.ab-shim.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon, P } = S;
const mk = () => Array.from({ length: 4 }, () => defaultDecisions());
const SEAS = [2, 3, 0, 1];
const PRISTINE_BASE = JSON.parse(JSON.stringify(P.baseDemand));
const FIN = ds => { ds[1].shares = 400; ds[1].dividend = 40; ds[2].dividend = 40; ds[3].dividend = 90; };
const MAINT = ds => { for (const d of ds) d.maintenance = 25; };
const DELIV = (ds, f = [1.07, 1.07, 1.03, 1.05]) => { for (let i = 0; i < 4; i++) ds[i].deliveries = ds[i].deliveries.map(r => r.map(v => Math.round(v * f[i]))); };

const buildW5 = () => { const ds = mk(); for (const qi of [0, 1, 2, 3]) ds[qi].prices = [[360, 530, 730], [370, 530, 755], [430, 640, 900]]; DELIV(ds); MAINT(ds); FIN(ds); return ds; };

const show = (tag, sim) => {
  const np = sim.reports.reduce((a, r) => a + r.netProfit, 0);
  const rev = sim.reports.reduce((a, r) => a + r.revenue, 0);
  console.log(`${tag}: rev ${Math.round(rev)} | net ${Math.round(np)} | IP ${Math.round(sim.reports[3].investmentPerformance)} | Q3rev ${Math.round(sim.reports[0].revenue)} | Q4rev ${Math.round(sim.reports[1].revenue)}`);
};

// 1) plain
show('plain           ', runSimulation(buildW5(), SEAS.map(q => defaultEcon(q))));
// 2) withCase-style P mutation (elasticity + baseDemand replaced)
P.priceElasticity = [2.1, 1.8, 1.3];
P.baseDemand = PRISTINE_BASE.map(row => row.map(v => v * 1));
P.baseDemand[2] = P.baseDemand[2].map(v => v * 1);
show('withCase-style  ', runSimulation(buildW5(), SEAS.map(q => defaultEcon(q))));
P.priceElasticity = [2.1, 1.8, 1.3]; P.baseDemand = JSON.parse(JSON.stringify(PRISTINE_BASE));
// 3) econ passed as new objects each quarter (lab6 econ())
show('econ() fresh    ', runSimulation(buildW5(), SEAS.map(q => { const e = defaultEcon(q); return e; })));
// 4) does compPrices default === OUR Q2 official prices? print
console.log('P.priceElasticity now:', P.priceElasticity, ' baseDemand[0]:', P.baseDemand[0].slice(0, 3));
console.log('P keys:', Object.keys(P).join(','));
