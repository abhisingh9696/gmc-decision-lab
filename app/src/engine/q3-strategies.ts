import {defaultDecisions,runSimulation,defaultEcon,SEASON_IDX} from './q3';
import type {Decisions,Mat3x3,EconAssumptions} from './types';
export interface Q3Strategy{id:string;name:string;description:string;decisions:Decisions;}
function make(id:string,name:string,description:string,prices:Mat3x3,deliveries:Mat3x3,spot:number,extra:Partial<Decisions>={}):Q3Strategy{
 const d=defaultDecisions();Object.assign(d,{prices,deliveries,matSpot:spot,matM3:1,matM6:0,rd:[15,15,25],hire:0,train:0,trainingDays:5,mgmtBudget:70,maintenance:20,shift:2,wage:1200,ports:5,webDev:15,takeImprovement:[false,false,false],dividend:0,shares:0,termLoan:0,termDeposit:0,machinesBuy:0,machinesSell:0,factoryExt:0,insurance:1,...extra});
 return{id,name,description,decisions:d};
}
export const Q3_STRATEGIES:Q3Strategy[]=[
 make('1','Strategy 1 · Balanced quality recovery','Moderate prices; longer assembly times to support quality (125/180/345); quantities and R&D from the economic reappraisal. This table uses the app demand model, not the separate 144-case study.',[[360,530,730],[370,530,755],[430,640,900]],[[605,435,230],[45,65,15],[275,185,145]],3,{assemblyTimes:[125,180,345]}),
 make('2','Strategy 2 · Aggressive revenue recovery','Match typical rival prices; commit more production; increased working-capital and demand risk.',[[325,490,700],[335,490,725],[375,590,850]],[[800,500,300],[150,130,65],[350,220,140]],4),
 make('3','Strategy 3 · Cautious cash recovery','Lower production commitments with measured price reductions. This is a strategy name, not a guarantee of safer cash.',[[350,520,700],[350,510,725],[415,620,880]],[[600,350,180],[90,80,35],[280,180,110]],3),
 make('4','Strategy 4 · Recovery with fulfilment','Small P1 premium; higher deliveries to reduce missed orders. Reconstructed demand-matched quantities (orders minus warehouse stock) — the earlier shortlist build showed a different cash plan.',[[335,490,700],[345,490,725],[395,590,850]],[[949,583,320],[134,118,86],[289,196,114]],3),
 make('5','Strategy 5 · Quality-led selective premium','Experimental quality variant: assembly 125/180/345 and 10% premium materials per product. Quality benefits remain assumed.',[[350,510,710],[360,510,735],[415,620,870]],[[605,435,230],[45,65,15],[275,185,145]],3,{assemblyTimes:[125,180,345],premium:[10,10,10]}),
 make('8','Strategy 8 · Traditional-channel recovery','Competitive EU/NAFTA prices; higher Internet prices and restrained online replenishment. Cyber losses are not modeled here. Reconstructed (approx) from the earlier shortlist.',[[325,490,700],[335,490,725],[415,620,880]],[[1000,625,325],[68,68,34],[275,165,110]],2),
 make('9','Strategy 9 · Peak Harvest','Economics-lab primary: P1/P2 at rival level, P3 +8% premium where elasticity is lowest; capacity-max deliveries; maintenance 25. Q4 follow-through (apply next quarter): prices +15/25/28%, share issue +400k once SP>€1, dividends 40/40/90 — see STRATEGY-LAB.md.',[[325,490,756],[335,490,783],[375,590,918]],[[1070,669,348],[161,161,80],[268,161,107]],4,{maintenance:25})
];
export function strategyReport(strategy:Q3Strategy,econ:EconAssumptions,stress=false){
 const ds=Array.from({length:4},defaultDecisions);ds[0]=structuredClone(strategy.decisions);
 const es=SEASON_IDX.map(i=>defaultEcon(i));es[0]=structuredClone(econ);
 if(stress){es[0].growth*=.85;es[0].compPrices=es[0].compPrices.map(r=>r.map(v=>v*.95)) as Mat3x3;}
 return runSimulation(ds,es).reports[0];
}
