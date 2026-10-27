import {useMemo,useState} from 'react';
import {forecastFromState,defaultDecisions} from './engine';
import type {CompanyState,Decisions,Mat3x3} from './engine/types';
import opening from './engine/q3-opening.json';
import {P} from './engine/params';
import {DecisionPanel} from './components/DecisionPanel';
import {StatementsView} from './components/StatementsView';
export default function Q3Lab(){
 const [d,setD]=useState<Decisions>(()=>({...defaultDecisions(),hire:0,takeImprovement:[false,false,false],mgmtBudget:70}));
 const [shock,setShock]=useState(1);
 const result=useMemo(()=>{
  const old=[P.matPriceSpotUSD,P.matPrice3mUSD,P.matPrice6mUSD];
  try{[P.matPriceSpotUSD,P.matPrice3mUSD,P.matPrice6mUSD]=[84547,77070,74778];
   return forecastFromState(opening as CompanyState,[d],[{exchangeRate:.89,baseRate:1,seasonality:1.06,growth:shock,compPrices:[[325,490,700],[335,490,725],[375,590,850]] as Mat3x3}]).reports[0];
  }finally{[P.matPriceSpotUSD,P.matPrice3mUSD,P.matPrice6mUSD]=old;}
 },[d,shock]);
 const exportCase=()=>{const blob=new Blob([JSON.stringify({schema:'gmc-q3-experimental-v1',openingSource:'W132162.xls',opening,decisions:d,effectiveDecisions:result.effectiveDecisions,demandMultiplier:shock,report:result},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='gmc-q3-test.json';a.click();URL.revokeObjectURL(url);};
 return <main className="max-w-7xl mx-auto p-6 space-y-5"><h1 className="text-2xl">Kissing Assets — 2016 Q3 testing</h1>
 <p>Official Q2 closing bank €1,051,507 · Deposit €1,150,000 · Equity €4,018,573 · 19 assembly workers · 4 machines.</p>
 <div role="note" className="panel p-4 text-amber-300">Experimental forecast, not an official prediction. Payroll, accident insurance, collections and demand remain under audit. Product-level opening inventory allocations and latent image states are estimates. No validated winning strategy or investment-performance target is available.</div>
 <label>Demand multiplier <input aria-label="Q3 demand multiplier" type="number" min="0.1" max="2" step="0.05" value={shock} onChange={e=>{const n=Number(e.target.value);if(Number.isFinite(n)&&n>=.1&&n<=2)setShock(n);}}/></label>
 <button className="btn ml-4" onClick={exportCase}>Export complete Q3 test</button>
 <p>Illustrative starting decisions: edit all 75 fields below. This page forecasts Q3 only; it does not submit to GMC.</p>
 <div className="grid md:grid-cols-2 gap-6"><DecisionPanel d={d} setD={setD} eff={result.effectiveDecisions}/><div className="space-y-4"><h2>Q3 forecast</h2><p>Revenue €{result.revenue.toLocaleString()} · Profit €{result.netProfit.toLocaleString()} · Bank €{result.cashEnd.toLocaleString()}</p>{result.warnings.map((w,i)=><p key={i}>{w.title}: {w.detail}</p>)}<StatementsView r={result}/></div></div>
 </main>;
}
