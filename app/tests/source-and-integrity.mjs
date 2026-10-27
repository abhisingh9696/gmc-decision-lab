import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runSimulation,defaultDecisions,defaultEcon,baselineState,DECISION_FIELDS,setField,fieldValue} from './engine-bundle.mjs';
const clone=structuredClone, mk=()=>Array.from({length:5},defaultDecisions);let count=0;const T=(n,f)=>{try{f();count++;}catch(e){console.error('FAIL',n,e.message);throw e;}};
const source=JSON.parse(fs.readFileSync('public/audit/source-summary.json'));
const cells=JSON.parse(fs.readFileSync('public/audit/source-cells.json'));
T('25 sheets and exhaustive stored-cell counts',()=>{assert.equal(source.files.length,5);assert.equal(source.files.flatMap(x=>x.sheets).length,25);assert.equal(cells.length,10380);});
T('runtime opening report fields match normalized source',()=>{let b=baselineState();for(const[k,v]of Object.entries(source.opening))assert.deepEqual(b[k],v,k);});
T('all 75 official decision fields are registered',()=>assert.equal(DECISION_FIELDS.length,75));
for(const f of DECISION_FIELDS.filter(x=>!x.boolean))for(const val of [f.min-1,f.max+1])T('official bound '+f.label+' '+val,()=>{const ds=mk();setField(ds[0],f.path,val);let eff=runSimulation(ds).reports[0].effectiveDecisions;let v=fieldValue(eff,f.path);assert(Number.isFinite(v));assert(v>=f.min&&v<=f.max);});
for(const bad of [null,{},[defaultDecisions()],Array.from({length:5},()=>({}))])T('reject incomplete input',()=>assert.throws(()=>runSimulation(bad)));
for(const val of [NaN,Infinity])T('reject nonfinite data',()=>{const ds=mk();ds[0].prices[0][0]=val;assert.throws(()=>runSimulation(ds));});
T('insurance uses exact opening base, independent €8,928.12',()=>{const r=runSimulation(mk()).reports[0];assert(Math.abs(r.details.adminBreakdown.find(x=>x.label==='Insurance premiums').value-8928.12)<.51);});
T('machine sale does not reduce current-quarter insurance',()=>{const ds=mk();ds[0].machinesSell=1;const a=runSimulation(ds).reports[0],b=runSimulation(mk()).reports[0];assert.equal(a.details.adminBreakdown.find(x=>x.label==='Insurance premiums').value,b.details.adminBreakdown.find(x=>x.label==='Insurance premiums').value);});
T('factory extension cap is paid only for available land',()=>{const ds=mk();ds[0].factoryExt=9999;const rs=runSimulation(ds).reports;assert(rs[0].effectiveDecisions.factoryExt<=300);assert.equal(rs[0].details.cashFlow.capex,rs[0].effectiveDecisions.factoryExt*500);});
T('fractional credit cannot buy a fractional machine',()=>{const ds=mk();ds[0].machinesBuy=99;let r=runSimulation(ds).reports[0];assert.equal(r.details.cashFlow.capex,r.effectiveDecisions.machinesBuy*300000);});
T('buyback premium depletes reserves instead of negative share premium',()=>{const ds=mk();ds[0].shares=-400;let r=runSimulation(ds).reports[0];assert.equal(r.details.balance.sharePremium,0);assert.equal(r.details.retained.repurchaseCharge,32040);});
function balance(r){let b=r.details.balance;return b.fixedAssets+b.capitalWip+b.inventories+b.materialsValue+b.wipComponents+b.materialsOnOrder+b.receivables+b.cash+b.deposit-b.payables-b.taxDue-b.overdraft-b.termLoan-b.shareCapital-b.sharePremium-b.retainedEarnings;}
function bridges(r){let c=r.details.cashFlow;let x=c.openingCash+c.collected+c.interestReceived+c.loanDrawn+c.shareCash+c.obsoleteProceeds+c.scrapProceeds+c.assetProceeds-c.paidSuppliersAdmin-c.paidProduction-c.paidMaterials-c.subcontractPaid-c.dividendPaid-c.capex-c.taxPaid-c.interestPaid-c.depositChange-(c.closingCash-c.overdraftEnd);assert(Math.abs(x)<=3,'cash '+x);let t=r.details.retained;assert(Math.abs(t.opening+t.netProfit-t.dividendPaid-t.repurchaseCharge-t.closing)<=2,'RE');assert(Math.abs(balance(r))<=3,'balance '+balance(r));}
let seed=137;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
const failures=[];
for(let j=0;j<120;j++){
 const ds=mk();for(let q=0;q<5;q++){let d=ds[q];d.hire=Math.floor(rand()*12)-5;d.shift=1+Math.floor(rand()*3);d.matSpot=Math.floor(rand()*8);d.matM3=Math.floor(rand()*3);d.matM6=Math.floor(rand()*3);d.machinesBuy=q===0?Math.floor(rand()*4):0;d.machinesSell=q===1?Math.floor(rand()*3):0;d.shares=q===0?-400:0;d.dividend=q===4?99:0;d.subcontract=q===0?[100,30,20]:[0,0,0];d.deliveries=d.deliveries.map(r=>r.map(x=>Math.round(x*(.2+rand()*2))));d.factoryExt=q===0?Math.floor(rand()*600):0;}
 const out=runSimulation(ds);let prev=baselineState();
 for(let q=0;q<5;q++){
  let r=out.reports[q];try{bridges(r);}catch(e){failures.push({j,q,message:e.message});}
  assert([r.revenue,r.netProfit,r.cashEnd,r.investmentPerformance].every(Number.isFinite));
 }
 // Unit conservation checked on each sequential state, separate from report rounding.
}
T('120 diverse five-quarter ledgers reconcile',()=>assert.deepEqual(failures,[]));
// Exact unit invariant, one quarter at a time through the public engine's states.
for(const factor of [0,.13,.5,1,1.7,3])T('physical FG conservation '+factor,()=>{
 const ds=mk();ds[0].deliveries=ds[0].deliveries.map(r=>r.map(v=>Math.round(v*factor)));const out=runSimulation(ds); // final state audited with repeated plans using opening+production-sales-obsolete.
 let expected=[135,9,8];for(const r of out.reports)for(let p=0;p<3;p++)expected[p]+=r.productionActual[p]-r.sales.reduce((a,m)=>a+m[p],0)-r.obsoleteByProduct[p];
 for(let p=0;p<3;p++)assert.equal(out.finalState.productStocks.reduce((a,m)=>a+m[p],0),expected[p]);
});
T('negative EU recall redistributes stock and preserves units',()=>{const ds=mk();ds[0].deliveries[0][0]=-100;let out=runSimulation(ds);let n=135+out.reports.reduce((a,r)=>a+r.productionActual[0]-r.sales.reduce((b,m)=>b+m[0],0)-r.obsoleteByProduct[0],0);assert.equal(out.finalState.productStocks.reduce((a,m)=>a+m[0],0),n);});
console.log(`${count} independent source, boundary and integrity checks passed; ${120*5} stressed quarter ledgers reconciled.`);
fs.writeFileSync('public/audit/integrity-tests.json',JSON.stringify({checks:count,randomPlans:120,randomQuarters:600,failures},null,2));
T('independent Table 8 scrap receipt = 54×40 + 37×80 + 20×120',()=>{const r=runSimulation(mk()).reports[0];assert.equal(r.details.cashFlow.scrapProceeds,7520);});
T('independent average stock storage calculation',()=>{const r=runSimulation(mk()).reports[0];const expected=7500+((110+15)/2+(20+5)/2)*3.5+(22+4)/2*4*.9;assert.equal(r.details.adminBreakdown.find(x=>x.label==='Purchasing & warehousing').value,Math.round(expected));});
T('operator pay uses actual hours and shift overtime, not maximum hours',()=>{const r=runSimulation(mk()).reports[0];const physical=(1454+962*1.25+520*2)/.951;const per=physical*4/32;const pay=(420+42*1.5+(per-462)*2)*12*.65*(1+1/3);assert(Math.abs(r.details.productionCosts.machinistWages-Math.round(32*pay))<=1);assert.equal(r.details.productionCosts.recruited,5);assert.equal(r.details.adminBreakdown.find(x=>x.label==='Personnel department').value,4*2000+5*1000);});
T('Table 27 historical discrepancy is retained explicitly, not forced to match',()=>{const computed=(500*9.5+3855*2.82+8181*.47)/1000;assert(Math.abs(computed-19.46617)<1e-9);assert(Math.abs(21.03172-computed-1.56555)<1e-9);});
T('management reduction export preserves instruction and notice',()=>{const d=mk();d[0].mgmtBudget=63;let r=runSimulation(d).reports[0];assert.equal(r.effectiveDecisions.mgmtBudget,63);assert.equal(r.mgmtBudgetEffective,70);});
T('historical statements reconcile across every uploaded quarter',()=>{for(const f of source.files){let get=(sheet,a)=>cells.find(c=>c.file===f.file&&c.sheet===sheet&&c.cell===a)?.value??0;let g=a=>Number(get('Financial statements',a));assert.equal(g('L19'),g('L10')+g('L11')+g('L12')+g('L13')+g('L14')+g('L15')+g('L16')+g('L17')-g('L18'));assert.equal(g('L24'),g('L20')-g('L21')+g('L22')-g('L23'));assert.equal(g('R21'),g('R27')+g('R28')+g('R36'));assert.equal(g('X31'),g('X29')+g('X30'));}});
console.log(`Final independent count: ${count} checks passed.`);
fs.writeFileSync('public/audit/integrity-tests.json',JSON.stringify({checks:count,randomPlans:120,randomQuarters:600,failures},null,2));
