/** Unofficial model assumptions, separate from the 75 official decisions. */
export interface ModelOptions {
  inventoryValuation?: 'manual-standard' | 'cost-pool';
  demandElasticityScale?: number;
  dividendSentimentWeight?: number;
  parityWeeksFactor?: number;
}
export type ResolvedModel = Required<ModelOptions>;
export function resolveModel(x:ModelOptions={}):ResolvedModel {
 const r:ResolvedModel={inventoryValuation:'manual-standard',demandElasticityScale:1,dividendSentimentWeight:2,parityWeeksFactor:1,...x};
 if(!['manual-standard','cost-pool'].includes(r.inventoryValuation)
   ||!Number.isFinite(r.demandElasticityScale)||r.demandElasticityScale<.25||r.demandElasticityScale>3
   ||!Number.isFinite(r.dividendSentimentWeight)||r.dividendSentimentWeight<0||r.dividendSentimentWeight>4
   ||!Number.isFinite(r.parityWeeksFactor)||r.parityWeeksFactor<0||r.parityWeeksFactor>1)throw Error('Invalid model assumptions');
 return r;
}
