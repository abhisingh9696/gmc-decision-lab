import opening from './q3-opening.json';
import {forecastFromState,defaultDecisions as historicalDefaults,defaultEcon as historicalEcon} from './index';
import type {CompanyState,Decisions,EconAssumptions} from './types';
import {P} from './params';
export const QUARTERS=['2016 Q3','2016 Q4','2017 Q1','2017 Q2'];
export const SEASON_IDX=[2,3,0,1];
export function defaultDecisions(){return {...historicalDefaults(),hire:0,takeImprovement:[false,false,false] as [boolean,boolean,boolean],mgmtBudget:70};}
export function defaultEcon(i:number):EconAssumptions{return {...historicalEcon(i),exchangeRate:.89};}
export function runSimulation(ds:Decisions[],es?:Partial<EconAssumptions>[]){
 if(ds.length!==4)throw Error('Q3 forecasts require four remaining quarters.');
 const old=[P.matPriceSpotUSD,P.matPrice3mUSD,P.matPrice6mUSD];
 try{[P.matPriceSpotUSD,P.matPrice3mUSD,P.matPrice6mUSD]=[84547,77070,74778];
 return forecastFromState(opening as CompanyState,ds,SEASON_IDX.map((q,i)=>({...defaultEcon(q),...es?.[i]})));
 }finally{[P.matPriceSpotUSD,P.matPrice3mUSD,P.matPrice6mUSD]=old;}
}
