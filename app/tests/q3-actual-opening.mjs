import fs from 'node:fs';import assert from 'node:assert/strict';import {baselineState,forecastFromState,defaultDecisions} from '../dist-audit-engine.mjs';
const a=JSON.parse(fs.readFileSync(new URL('./official-q2.json',import.meta.url)));
const b=baselineState();Object.assign(b,a.resources,a.openingBalances);delete b.materialsTotalValue;delete b.totalCash;
b.quarterLabel='2016 Q3';b.seasonIndex=2;b.cash=a.openingBalances.totalCash-b.termDepositAmt;b.productStocks=structuredClone(a.stocks);b.backlog=[[0,0,0],[0,0,0],[0,0,0]];
b.materialsValue=a.openingBalances.materialsTotalValue*b.materialsStock/(b.materialsStock+1000*b.matPipeline3);b.matPipeline3Val=a.openingBalances.materialsTotalValue-b.materialsValue;b.matPipeline6Val=0;
b.stars=[2,2,1];b.rdProgress=[0,0,0];b.improvementsAvailable=[false,false,false];b.sharePrice=.9833;b.mgmtBudgetEffective=70;b.mgmtBudgetPending=63;b.priorWage=1200;b.webImage=30;
const productQty=[0,1,2].map(p=>a.stocks.reduce((n,r)=>n+r[p],0));const standards=[143.1069,232.9738,373.0007];const den=productQty.reduce((n,q,p)=>n+q*standards[p],0);b.productFGValue=productQty.map((q,p)=>b.finishedGoodsValue*q*standards[p]/den);
const assets=50000+b.buildingValue+b.machineValue+b.finishedGoodsValue+b.materialsValue+b.matPipeline3Val+b.cash+b.termDepositAmt+b.receivables;
assert(Math.abs(assets-b.payables-b.taxDue-b.termLoanAmt-b.shareCapital-b.sharePremium-b.retainedEarnings)<1e-6);

const assumptions={exchangeRate:.89,baseRate:1,seasonality:1.06,growth:1,compPrices:a.peerMedianPrices}; const result=forecastFromState(b,[defaultDecisions()],[assumptions]);assert.equal(result.reports[0].quarterLabel,'2016 Q3');assert.equal(b.cash,1051507);console.log('PASS: Q2 opening ledger reconciles; bank1051507; forecast begins2016Q3. Experimental latent state and inventory allocations; not a recommendation.');
