import {defaultDecisions,runSimulation,defaultEcon,SEASON_IDX} from './q3';
import type {Decisions,Mat3x3,EconAssumptions} from './types';
export interface Q3Strategy{id:string;name:string;description:string;decisions:Decisions;}
function make(id:string,name:string,description:string,prices:Mat3x3,deliveries:Mat3x3,spot:number):Q3Strategy{
 const d=defaultDecisions();Object.assign(d,{prices,deliveries,matSpot:spot,matM3:1,matM6:0,rd:[15,15,25],hire:0,train:0,trainingDays:5,mgmtBudget:70,maintenance:20,shift:2,wage:1200,ports:5,webDev:15,takeImprovement:[false,false,false],dividend:0,shares:0,termLoan:0,termDeposit:0,machinesBuy:0,machinesSell:0,factoryExt:0,insurance:1});
 return{id,name,description,decisions:d};
}
export const Q3_STRATEGIES:Q3Strategy[]=[
 make('1','Strategy 1 · Market recovery','Small P1 premium; P2/P3 near peer prices. Uses opening stock and replenishes Internet.',[[335,490,700],[345,490,725],[395,590,850]],[[650,400,200],[100,100,40],[320,200,120]],3),
 make('2','Strategy 2 · Measured recovery','Higher prices and lower production commitments. Recovery may be slower; cash risk remains uncertain.',[[350,520,700],[350,510,725],[415,620,880]],[[600,350,180],[90,80,35],[280,180,110]],3),
 make('3','Strategy 3 · Peer-price reset','Peer-level prices and larger production schedule. Higher demand, capacity and working-capital exposure.',[[325,490,700],[335,490,725],[375,590,850]],[[800,500,300],[150,130,65],[350,220,140]],4)
];
export function strategyReport(strategy:Q3Strategy,econ:EconAssumptions,stress=false){
 const ds=Array.from({length:4},defaultDecisions);ds[0]=structuredClone(strategy.decisions);
 const es=SEASON_IDX.map(i=>defaultEcon(i));es[0]=structuredClone(econ);
 if(stress){es[0].growth*=.85;es[0].compPrices=es[0].compPrices.map(r=>r.map(v=>v*.95)) as Mat3x3;}
 return runSimulation(ds,es).reports[0];
}
