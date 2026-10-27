import assert from 'node:assert/strict';
import {Q3_STRATEGIES,strategyReport} from './q3-strategy-bundle.mjs';
const e={exchangeRate:.89,baseRate:1,seasonality:1.06,growth:1.01,compPrices:[[325,490,700],[335,490,725],[375,590,850]]};
assert.equal(Q3_STRATEGIES.length,3);
for(const s of Q3_STRATEGIES){
 const before=JSON.stringify(s.decisions),r=strategyReport(s,e),down=strategyReport(s,e,true);
 assert.equal(JSON.stringify(s.decisions),before);
 assert.equal(r.quarterLabel,'2016 Q3');assert(!r.productionScaled);assert.equal(r.materialsShortfall,0);
 assert.equal(r.dividendPaid,0);assert.equal(r.effectiveDecisions.wage,1200);
 assert(!r.warnings.some(w=>w.severity==='critical'));
 assert([r.revenue,r.netProfit,r.cashEnd,down.netProfit,down.cashEnd].every(Number.isFinite));
 assert(down.revenue<=r.revenue);
 const b=r.details.balance;const gap=b.fixedAssets+b.capitalWip+b.inventories+b.materialsValue+b.wipComponents+b.materialsOnOrder+b.receivables+b.cash+b.deposit-b.payables-b.taxDue-b.overdraft-b.termLoan-b.shareCapital-b.sharePremium-b.retainedEarnings;assert(Math.abs(gap)<=3);
}
console.log('PASS: three Q3 presets, fixed opening period, no mutation, no capacity/emergency/critical adjustment, finite downside and reconciled ledgers. Not a predictive-accuracy test.');
