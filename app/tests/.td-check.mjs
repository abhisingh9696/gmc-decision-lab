
import { pathToFileURL } from 'node:url';
const E = await import(pathToFileURL('tests/.econ-engine.mjs').href);
const { runSimulation, defaultDecisions, defaultEcon, SEASON_IDX } = E;
const base = () => { const d = defaultDecisions(); Object.assign(d, { matM3: 1, matM6: 0, rd: [15,15,25], hire: 0, train: 0, trainingDays: 5, mgmtBudget: 70, maintenance: 20, shift: 2, wage: 1200, ports: 5, webDev: 15, takeImprovement: [false,false,false], dividend: 0, shares: 0, termLoan: 0, machinesBuy: 0, machinesSell: 0, factoryExt: 0, insurance: 1 }); return d; };
const run1 = d => { const ds = Array.from({length:4}, defaultDecisions); ds[0] = structuredClone(d); return runSimulation(ds, SEASON_IDX.map(i => defaultEcon(i))).reports[0]; };
const STOCK = [[198,132,112],[50,39,33],[0,0,0]];
// S4 spot3/m31 with termDeposit +1150 and -1150
for (const td of [1150, -1150]) {
  const d = base(); d.prices = [[335,490,700],[345,490,725],[395,590,850]]; d.matSpot = 3; d.termDeposit = td;
  d.deliveries = [[1147,715,432],[184,157,86],[289,196,114]].map((row,m)=>row.map((v,p)=>Math.max(0, v - STOCK[m][p])));
  const r = run1(d);
  console.log(`S4 td=${td}: cashEnd ${Math.round(r.cashEnd)} deposit ${r.details.balance.deposit} cashFlow.depositChange ${r.details.cashFlow.depositChange} net ${Math.round(r.netProfit)}`);
}
// S8 spot4/m31 td=+1150
for (const td of [1150, -1150]) {
  const d = base(); d.prices = [[325,490,700],[335,490,725],[415,620,880]]; d.matSpot = 4; d.termDeposit = td;
  d.deliveries = [[1000,625,325],[150,150,75],[250,150,100]].map((row,m)=>row.map((v,p)=>Math.max(0, Math.round(v * (m===0?100:m===1?55:100)/100))));
  const r = run1(d);
  console.log(`S8 td=${td}: cashEnd ${Math.round(r.cashEnd)} deposit ${r.details.balance.deposit} depositChange ${r.details.cashFlow.depositChange} net ${Math.round(r.netProfit)} backlog ${r.backlogEnd.flat().reduce((a,b)=>a+b,0)} unfilled ${r.orders.map((row,m)=>row.reduce((a,v,p)=>a+Math.max(0,v-r.sales[m][p]),0)).flat().reduce((a,b)=>a+b,0)}`);
}
