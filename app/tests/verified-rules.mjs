import assert from 'node:assert/strict';
import {runSimulation,defaultDecisions} from '../dist-audit-engine.mjs';
const mk=()=>Array.from({length:5},defaultDecisions);
const row=(r,label)=>r.details.adminBreakdown.find(x=>x.label===label)?.value;
let r=runSimulation(mk()).reports[0];
assert(row(r,'Carbon offsets')>0);
// Displayed carbon is rounded to 0.1t; exact expense must lie within €2.
assert(Math.abs(row(r,'Carbon offsets')-r.carbonTonnes*40)<=2);
const ds=mk();ds[0].machinesBuy=1;
const rr=runSimulation(ds).reports;
const b=rr[0].details.balance;
const base=b.fixedAssets+b.capitalWip+b.inventories+b.materialsValue+b.wipComponents+b.materialsOnOrder;
assert(Math.abs(row(rr[1],'Insurance premiums')-base*.006)<=2);
for(const q of [...rr,...runSimulation(mk()).reports]){
const b=q.details.balance;
const gap=b.fixedAssets+b.capitalWip+b.inventories+b.materialsValue+b.wipComponents+b.materialsOnOrder+b.receivables+b.cash+b.deposit-b.payables-b.taxDue-b.overdraft-b.termLoan-b.shareCapital-b.sharePremium-b.retainedEarnings;
assert(Math.abs(gap)<=3,`balance gap ${gap}`);
}
console.log('Carbon expense, capital insurance and ten quarter balances passed.');
