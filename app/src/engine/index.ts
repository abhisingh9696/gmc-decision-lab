import { resolveModel, type ModelOptions } from './model-options';
// Engine entry: run all 5 quarters and return reports + final state.
import { baselineState, defaultDecisions, defaultEcon, QUARTERS, SEASON_IDX } from './baseline';
import { validDecisions, validEcon } from './decision-schema';
import { simulateQuarter, portCapacity, sanitizeDecisions } from './simulate';
import type { CompanyState, Decisions, EconAssumptions, QuarterReport } from './types';

export interface SimResult {
  reports: QuarterReport[];
  finalState: CompanyState;
  states: CompanyState[];
}

export function runSimulation(
  decisionsPerQuarter: Decisions[],
  econOverrides?: Partial<EconAssumptions>[],
  modelOptions: ModelOptions = {},
): SimResult {
  if (decisionsPerQuarter.length !== 5 || !decisionsPerQuarter.every(validDecisions)) throw new Error("Supply five complete decision quarters.");
  if (econOverrides && (econOverrides.length > 5 || econOverrides.some((e,i)=>!validEcon({...defaultEcon(SEASON_IDX[i]),...e})))) throw new Error("External assumptions must be finite and positive (base rate ≥ 0).");
  const model=resolveModel(modelOptions);
  let state = baselineState();
  const reports: QuarterReport[] = [];
  const states: CompanyState[] = [];
  for (let q = 0; q < 5; q++) {
    state.quarterLabel = QUARTERS[q];
    state.seasonIndex = SEASON_IDX[q];
    const econ: EconAssumptions = { ...defaultEcon(SEASON_IDX[q]), ...(econOverrides?.[q] ?? {}) };
    const out = simulateQuarter(state, decisionsPerQuarter[q], econ, model);
    state = out.state;
    reports.push(out.report);
    states.push(structuredClone(state));
  }
  return { reports, finalState: state, states };
}

export { baselineState, defaultDecisions, defaultEcon, QUARTERS, portCapacity, sanitizeDecisions };
export type { Decisions, EconAssumptions, QuarterReport, CompanyState };

export { DECISION_FIELDS, fieldValue, setField, validDecisions, validEcon } from "./decision-schema";

export { resolveModel } from "./model-options";
export type { ModelOptions } from "./model-options";

/** Explicit-state forecast. opening.quarterLabel is the FIRST forecast quarter.
 * Callers must provide reconciled actual state and all quarter assumptions.
 * No hidden reset to the historical baseline is performed.
 */
export function forecastFromState(opening: CompanyState, decisions: Decisions[],
  assumptions: EconAssumptions[], options: ModelOptions = {}): SimResult {
  if (!decisions.length || decisions.length !== assumptions.length ||
      !decisions.every(validDecisions) || !assumptions.every(validEcon))
    throw new Error('Supply complete decisions and explicit assumptions for each forecast quarter.');
  const match=/^(\d{4}) Q([1-4])$/.exec(opening.quarterLabel);
  if(!match) throw new Error('Opening state needs a valid first forecast quarter.');
  let year=Number(match[1]), quarter=Number(match[2]);
  let state=structuredClone(opening);
  const reports: QuarterReport[]=[], states: CompanyState[]=[];
  for(let i=0;i<decisions.length;i++) {
    state.quarterLabel=`${year} Q${quarter}`;state.seasonIndex=quarter-1;
    const out=simulateQuarter(state,decisions[i],assumptions[i],resolveModel(options));
    state=out.state;reports.push(out.report);states.push(structuredClone(state));
    quarter++;if(quarter===5){quarter=1;year++;}
  }
  return {reports,states,finalState:state};
}
