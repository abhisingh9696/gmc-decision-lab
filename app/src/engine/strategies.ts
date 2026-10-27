import type { ModelOptions } from './model-options';
import { runSimulation, defaultDecisions, defaultEcon, baselineState, SEASON_IDX } from './baseline-entry';
import type { Decisions, EconAssumptions, QuarterReport, Mat3x3 } from './types';
import { SAVED_PLANS } from './saved-plans';
export type Plan={name:string;decisions:Decisions[];note:string};
export const freshPlan=()=>Array.from({length:5},defaultDecisions);
export const freshEcon=()=>SEASON_IDX.map(defaultEcon);
export function presets():Plan[]{
 const all:Plan[]=[{name:'Baseline',decisions:freshPlan(),note:'Repeated Q1-based defaults, with P2 launch off and market information on.'}];
 for(const[name,dec]of Object.entries(SAVED_PLANS))all.push({name,decisions:structuredClone(dec) as Decisions[],note:'Exact prior saved plan; requested prices may now be capped by the official €999 limit.'});
 const c=freshPlan();c.forEach((d,i)=>{d.prices=d.prices.map(r=>r.map(v=>Math.round(v*1.05)))as Mat3x3;d.hire=i===0?-2:4;d.maintenance=15;d.rd=[15,10,10];d.mgmtBudget=i===0?63:57;d.dividend=i===0?0:2;});all.push({name:'C8 report: later hire +4',decisions:c,note:'Report recipe: dismiss 2 in Q2; hire 4 in each later quarter.'});
 for(const f of [1.35,1.45]){const ds=freshPlan();ds.forEach((d,i)=>{d.prices=d.prices.map(r=>r.map(v=>Math.round(v*f)))as Mat3x3;d.takeImprovement[0]=i===0;d.dividend=i===4?99:0;});all.push({name:f===1.35?'A35 report: hire +4':'A45 report: hire +4',decisions:ds,note:'Original requests, including €999 price-limit and reserve-cap adjustments. Not an exact legal portal recipe.'});}
 return all;
}
export const SHOCKS=['Base','Competitors −5%','Competitors −10%','Competitors +5%','Demand −10%','EUR/USD 0.80','EUR/USD 1.00','Combined downside'] as const;
export function shockEcon(kind:string,econ=freshEcon()):EconAssumptions[]{return econ.map(e=>{
 const c=kind==='Competitors −5%'?.95:kind==='Competitors −10%'||kind==='Combined downside'?.9:kind==='Competitors +5%'?1.05:1;
 return {...e,compPrices:e.compPrices.map(r=>r.map(v=>Math.min(999,Math.max(1,Math.round(v*c)))))as Mat3x3,growth:e.growth*(kind==='Demand −10%'||kind==='Combined downside'?.9:1),exchangeRate:kind==='EUR/USD 0.80'?.8:kind==='EUR/USD 1.00'||kind==='Combined downside'?1:e.exchangeRate};
});}
export function financialMetrics(r:QuarterReport,opening=baselineState()){
 const b=r.details.balance,c=r.details.cashFlow;
 const ocf=c.collected+c.obsoleteProceeds+c.scrapProceeds-c.paidSuppliersAdmin-c.paidProduction-c.paidMaterials-c.subcontractPaid-c.taxPaid;
 const liabilities=b.payables+b.taxDue+b.overdraft;
 const creditSales=r.sales[0].reduce((a,n,p)=>a+n*r.effectiveDecisions.prices[0][p],0)+r.sales[1].reduce((a,n,p)=>a+n*r.effectiveDecisions.prices[1][p],0);
 const current=b.inventories+b.materialsValue+b.wipComponents+b.materialsOnOrder+b.receivables+b.cash+b.deposit;
 const equity=b.shareCapital+b.sharePremium+b.retainedEarnings;
 const avgEquity=(opening.shareCapital+opening.sharePremium+opening.retainedEarnings+equity)/2;
 return {grossMargin:r.revenue?r.grossProfit/r.revenue:null,netMargin:r.revenue?r.netProfit/r.revenue:null,roe:avgEquity>0?r.netProfit/avgEquity:null,currentRatio:liabilities>0?current/liabilities:null,dso:creditSales?90*(opening.receivables+b.receivables)/2/creditSales:null,dio:r.cogs>0?90*(opening.finishedGoodsValue+b.inventories)/2/r.cogs:null,dpo:r.cogs>0?90*(opening.payables+b.payables)/2/r.cogs:null,ocf,fcf:ocf-c.capex,cashConversion:r.netProfit>0?ocf/r.netProfit:null};
}
export function outcome(plan:Plan,kind='Base',econ=freshEcon(),model:ModelOptions={}){
 const sim=runSimulation(plan.decisions,shockEcon(kind,econ),model);const last=sim.reports[4];
 const minCash=Math.min(...sim.reports.map(r=>r.cashEnd-r.overdraftEnd));
 const minOpeningCash=Math.min(...sim.reports.map(r=>{const c=r.details.cashFlow;return c.openingCash+c.loanDrawn+c.shareCash-c.dividendPaid-c.depositChange;}));
 const b=last.ipBreakdown;const equity=last.details.balance.shareCapital+last.details.balance.sharePremium+last.details.balance.retainedEarnings;
 return {plan,kind,sim,ip:last.investmentPerformance,minCash,minOpeningCash,minPolicyCash:Math.min(minCash,minOpeningCash),bank:last.cashEnd-last.overdraftEnd,inventory:last.details.balance.inventories,profit:sim.reports.reduce((a,r)=>a+r.netProfit,0),navReturn:equity+b.cumDividends+b.cumRepurchases-b.cumIssues,critical:sim.reports.flatMap(r=>r.warnings).filter(w=>w.severity==='critical').length,scaled:sim.reports.some(r=>r.productionScaled)};
}
// Bounded, reproducible search. No claim of a global or official-engine optimum.
export function candidatePlans(econ=freshEcon()):Plan[]{
 const out:Plan[]=[];
 for(const markup of [0,.05,.10,.15,.20,.25,.30,.35,.40,.45])for(const buffer of [.9,1,1.1])for(const costs of [false,true])for(const payout of [0,2,15]){
  const ds=freshPlan();ds.forEach((d,i)=>{d.prices=d.prices.map(r=>r.map(v=>Math.min(999,Math.round(v*(1+markup)))))as Mat3x3;d.hire=0;d.takeImprovement[0]=i===0;d.matSpot=3;d.matM3=1;d.maintenance=20;if(costs){d.rd=[15,10,10];d.mgmtBudget=i===0?63:57;}d.dividend=payout===2&&i>0?2:payout===15&&i===4?15:0;});
  // Re-plan sequentially: prior forecast stocks/backlogs are used once, never
  // subtracted from every later quarter as though they were still opening stock.
  for(let q=0;q<5;q++){
   const sim=runSimulation(ds,econ);const prev=q===0?baselineState():sim.states[q-1];const r=sim.reports[q];
   ds[q].deliveries=r.orders.map((row,m)=>row.map((v,p)=>Math.max(0,Math.ceil((v+(m<2?prev.backlog[m][p]:0))*buffer-(ds[q].takeImprovement[p]?0:prev.productStocks[m][p])))))as Mat3x3;
   // Material purchase policy: spot covers forecast gross needs less opening
   // stock and scheduled arrivals. Futures are retained as a small hedge.
   const planned=runSimulation(ds,econ).reports[q];
   ds[q].matSpot=Math.min(99,Math.max(0,Math.ceil((planned.materialsNeeded-prev.materialsStock-prev.matPipeline3*1000)/1000)));
  }
  out.push({name:`P${Math.round(markup*100)} · supply ${Math.round(buffer*100)}% · ${costs?'cost discipline':'standard costs'} · div ${payout}`,decisions:ds,note:'Prices capped at €999; no hiring; demand-matched quarterly deliveries; material arrivals counted; final payout is a model assumption.'});
 }
 return out;
}

/** Independent model uncertainties; same decisions, no hindsight replanning. */
export const MODEL_CASES: {name:string;model:ModelOptions}[]=[
 {name:'Manual-standard default',model:{}},
 {name:'Legacy inventory cost pool',model:{inventoryValuation:'cost-pool'}},
 {name:'Price elasticity 25% stronger',model:{demandElasticityScale:1.25}},
 {name:'No dividend sentiment bonus',model:{dividendSentimentWeight:0}},
 {name:'Half-quarter parity exposure',model:{parityWeeksFactor:.5}},
];
export function modelSensitivity(plan:Plan,econ=freshEcon()) {
 return MODEL_CASES.map(c=>{const runs=SHOCKS.map(k=>outcome(plan,k,econ,c.model));return {name:c.name,ip:runs[0].ip,worstIP:Math.min(...runs.map(x=>x.ip)),minCash:Math.min(...runs.map(x=>x.minPolicyCash)),critical:runs.some(x=>x.critical>0||x.scaled)};});
}
/** Local variants broaden the grid around the best feasible candidates. */
export function localVariants(seeds:Plan[]):Plan[]{const out:Plan[]=[];
 const add=(seed:Plan,label:string,fn:(d:Decisions,i:number)=>void)=>{const ds=structuredClone(seed.decisions);ds.forEach(fn);out.push({name:seed.name+' / '+label,decisions:ds,note:'Local variant of '+seed.name+'. Exact decisions are exported; no hidden quarter-by-quarter retuning under stress.'});};
 for(const seed of seeds){
  for(const hire of [-2,2,4])add(seed,'Q2 hire '+hire,(d,i)=>{d.hire=i===0?hire:0;});
  for(const hours of [15,24])add(seed,'maintenance '+hours,d=>{d.maintenance=hours;});
  for(const shift of [1,3])add(seed,'shift '+shift,d=>{d.shift=shift as 1|3;});
  add(seed,'no P1 launch',d=>{d.takeImprovement=[false,false,false];});
  add(seed,'deposit 500 Q2',(d,i)=>{d.termDeposit=i===0?500:0;});
  add(seed,'buyback 400 Q2',(d,i)=>{d.shares=i===0?-400:0;});
  add(seed,'loan 500 Q2',(d,i)=>{d.termLoan=i===0?500:0;});
  add(seed,'no futures',d=>{d.matSpot+=d.matM3;d.matM3=0;});
  add(seed,'standard R&D',d=>{d.rd=[25,15,15];});
  for(const product of [0,2])for(const factor of [.95,1.05])add(seed,'P'+(product+1)+' price ×'+factor,d=>{d.prices=d.prices.map(r=>r.map((v,p)=>p===product?Math.min(999,Math.round(v*factor)):v))as Mat3x3;});
 }
 return out;
}
export function screenPlan(plan:Plan,econ=freshEcon()) {
 const base=outcome(plan,'Base',econ);
 const stress=SHOCKS.slice(1).map(k=>{const x=outcome(plan,k,econ);return {kind:k,ip:x.ip,minCash:x.minCash,minPolicyCash:x.minPolicyCash,critical:x.critical,scaled:x.scaled};});
 return {plan,base,stress,worstCash:Math.min(base.minPolicyCash,...stress.map(s=>s.minPolicyCash)),worstIP:Math.min(base.ip,...stress.map(s=>s.ip)),sensitivities:[] as ReturnType<typeof modelSensitivity>};
}
export async function searchStrategyGrid(econ=freshEcon(),cashFloor=250000,progress?:(text:string)=>void) {
 const tested:ReturnType<typeof screenPlan>[]=[];
 const pause=()=>new Promise<void>(r=>setTimeout(r,0));
 const feasible=(x:ReturnType<typeof screenPlan>)=>x.base.critical===0&&!x.base.scaled&&x.stress.every(s=>s.critical===0&&!s.scaled);
 const evaluate=async(plans:Plan[])=>{for(let i=0;i<plans.length;i++){tested.push(screenPlan(plans[i],econ));if(i%20===0){progress?.(`${tested.length} plans checked across 8 economic cases`);await pause();}}};
 await evaluate(candidatePlans(econ));
 const seeds=tested.filter(x=>feasible(x)&&x.worstCash>=cashFloor).sort((a,b)=>b.base.ip-a.base.ip).slice(0,8).map(x=>x.plan);
 await evaluate(localVariants(seeds));
 const legal=tested.filter(feasible);
 const cashSafe=legal.filter(x=>x.worstCash>=cashFloor).sort((a,b)=>b.base.ip-a.base.ip);
 const robust:typeof cashSafe=[];
 for(let i=0;i<cashSafe.length;i++){
  const x=cashSafe[i];x.sensitivities=modelSensitivity(x.plan,econ);
  if(x.sensitivities.every(s=>!s.critical&&s.minCash>=cashFloor))robust.push(x);
  if(i%10===0){progress?.(`Model uncertainty: ${i+1} / ${cashSafe.length} cash-safe plans`);await pause();}
 }
 return {tested,legal,cashSafe,robust,preferred:robust[0]??cashSafe[0],economicBest:cashSafe[0],highestProxy:tested.slice().sort((a,b)=>b.base.ip-a.base.ip)[0],candidateCount:tested.length};
}
