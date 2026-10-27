import assert from 'node:assert/strict';
import {baselineState,defaultDecisions,defaultEcon,forecastFromState} from '../dist-audit-engine.mjs';
const run=(state,d)=>forecastFromState(state,[d],[defaultEcon(1)]);
const d=defaultDecisions();d.machinesSell=4;
const o=run(baselineState(),d), r=o.reports[0];
assert.equal(r.machHoursAvail,0);assert.deepEqual(r.productionActual,[0,0,0]);
assert.equal(o.finalState.machines,0);assert(Number.isFinite(r.netProfit));
// Mixed vintage fixture: oldest €100k, three newer €300k each.
const s=baselineState();s.machineValue=1000000;s.machineCohorts=[{count:1,value:100000},{count:3,value:900000}];
const one=defaultDecisions();one.machinesSell=1;
const x=run(s,one);assert.equal(x.reports[0].details.cashFlow.assetProceeds,100000);
assert.equal(x.finalState.machineValue,877500);
// Forecast must not mutate caller-owned cohort state.
assert.equal(s.machineCohorts[0].value,100000);
console.log('PASS: sold-all has zero machining/production; oldest-first proceeds100000; remaining depreciation22500; input preserved.');
