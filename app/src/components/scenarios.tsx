import type { Decisions, EconAssumptions, Mat3x3 } from '../engine/types';
import { validDecisions, validEcon } from '../engine';
import {runSimulation} from '../engine/q3';
import { fmtEUR } from './fields';

export interface Scenario {
  name: string;
  decisionsPerQ: Decisions[];
  econPerQ: EconAssumptions[];
  buildId?: string;   // app build the scenario was saved under (reproducibility)
  savedAt?: string;   // ISO timestamp
}

export function validScenario(x: unknown): x is Scenario {
  if (!x || typeof x !== 'object') return false;
  const s = x as Scenario;
  return typeof s.name === 'string' && s.name.length <= 160
    && Array.isArray(s.decisionsPerQ) && s.decisionsPerQ.length === 4 && s.decisionsPerQ.every(validDecisions)
    && Array.isArray(s.econPerQ) && s.econPerQ.length === 4 && s.econPerQ.every(validEcon);
}

const KEY = 'kissing-assets-gmc-q3-actual-rebased-v1';

export function loadScenarios(): (Scenario | null)[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [null, null, null];
    const arr = JSON.parse(raw);
    return [0, 1, 2].map(i => validScenario(arr?.[i]) ? arr[i] : null);
  } catch { return [null, null, null]; }
}

export function saveScenario(slot: number, sc: Scenario) {
  const all = loadScenarios();
  all[slot] = sc;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteScenario(slot: number) {
  const all = loadScenarios();
  all[slot] = null;
  localStorage.setItem(KEY, JSON.stringify(all));
}

/** One-line audit summary of a saved scenario: per-quarter hiring and
 *  requested dividends — the two inputs most often confused across reports. */
function scenarioSummary(s: Scenario): string {
  const hires = s.decisionsPerQ.map(d => (d.hire > 0 ? `+${d.hire}` : `${d.hire}`)).join('/');
  const divs = s.decisionsPerQ.map(d => d.dividend).join('/');
  return `hire ${hires} · div ${divs}¢`;
}

export function ScenarioBar({ scenarios, onLoad, onSave, onDelete, onCompare, comparing, onExport, onImport }: {
  scenarios: (Scenario | null)[];
  onLoad: (s: Scenario) => void;
  onSave: (slot: number) => void;
  onDelete: (slot: number) => void;
  onCompare: () => void;
  comparing: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex items-center gap-1 panel px-2 py-1">
          {scenarios[i] ? (
            <>
              <span className="flex flex-col">
                <button className="mono text-[10px] text-[var(--cyan)] hover:underline text-left" aria-label={`Load scenario ${scenarios[i]!.name} from slot ${i + 1}`}
                  onClick={() => onLoad(scenarios[i]!)}>
                  {scenarios[i]!.name}
                </button>
                <span className="mono text-[8px] text-[var(--dim)] leading-tight"
                  title={`Saved ${scenarios[i]!.savedAt ?? 'unknown date'} · build ${scenarios[i]!.buildId ?? 'unknown'} · per-quarter hires and requested dividends`}>
                  {scenarioSummary(scenarios[i]!)} · {scenarios[i]!.buildId ?? 'no build'}
                </span>
              </span>
              <button className="mono text-[10px] text-[var(--dim)] hover:text-[var(--amber)]" title="Overwrite with current"
                aria-label={`Overwrite scenario slot ${i + 1} with current decisions`}
                onClick={() => onSave(i)}>⟳</button>
              <button className="mono text-[10px] text-[var(--dim)] hover:text-[var(--red)]" title="Delete"
                aria-label={`Delete scenario slot ${i + 1}`}
                onClick={() => onDelete(i)}>×</button>
            </>
          ) : (
            <button className="mono text-[10px] text-[var(--dim)] hover:text-[var(--cyan)]" onClick={() => onSave(i)}>
              + SAVE SLOT {i + 1}
            </button>
          )}
        </div>
      ))}
      <button
        className={`mono text-[10px] px-2 py-1 rounded border transition-colors ${comparing ? 'border-[var(--cyan)] text-[var(--cyan)]' : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--cyan)] hover:text-[var(--cyan)]'}`}
        onClick={onCompare}>
        {comparing ? 'EXIT COMPARE' : 'COMPARE SCENARIOS'}
      </button>
      <button className="mono text-[10px] px-2 py-1 rounded border border-[var(--line)] text-[var(--muted)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors"
        title="Download all scenario slots as a JSON snapshot (all 75 decisions × 5 quarters + assumptions + build id) for exact reproduction"
        onClick={onExport}>
        EXPORT JSON
      </button>
      <label className="mono text-[10px] px-2 py-1 rounded border border-[var(--line)] text-[var(--muted)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors cursor-pointer"
        title="Load a previously exported scenario JSON snapshot">
        IMPORT JSON
        <input type="file" accept="application/json,.json" className="hidden" aria-label="Import scenario JSON snapshot"
          onChange={e => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ''; }} />
      </label>
    </div>
  );
}

/** Adverse external assumptions for stress testing (applied to all 5 quarters). */
function stressEcon(econ: EconAssumptions[], kind: 'war' | 'rec' | 'fx'): EconAssumptions[] {
  return econ.map(e => {
    if (kind === 'war') return { ...e, compPrices: e.compPrices.map(r => r.map(x => Math.round(x * 0.9))) as Mat3x3 };
    if (kind === 'rec') return { ...e, seasonality: e.seasonality * 0.9 };
    return { ...e, exchangeRate: Math.round(e.exchangeRate * 1.1 * 10000) / 10000 };
  });
}

const STRESS_LABEL = { war: 'competitor prices −10%', rec: 'demand index −10%', fx: 'EUR/USD +10% (materials costlier)'  } as const;

export function CompareView({ scenarios }: { scenarios: (Scenario | null)[] }) {
  const filled = scenarios.filter((s): s is Scenario => !!s);
  if (filled.length < 2) {
    return (
      <div className="panel p-6 text-center text-[var(--muted)] text-sm">
        Save at least two scenarios (slots above) to compare their five-quarter outcomes side by side.
      </div>
    );
  }
  const runs = filled.map(s => {
    const base = runSimulation(s.decisionsPerQ, s.econPerQ);
    const stresses = (['war', 'rec', 'fx'] as const).map(k => {
      const r = runSimulation(s.decisionsPerQ, stressEcon(s.econPerQ, k));
      const last = r.reports[3];
      // worst net bank position across the five quarters (cash minus overdraft)
      const minCash = Math.min(...r.reports.map(q => q.cashEnd - q.overdraftEnd));
      return { kind: k, ip: last.investmentPerformance, minCash };
    });
    return { s, base, stresses };
  });
  const best = Math.max(...runs.map(x => x.base.reports[3].investmentPerformance));
  const ipTitle = (x: (typeof runs)[number]) => {
    const b = x.base.reports[3].ipBreakdown;
    return `Investment performance decomposition: market value ${fmtEUR(b.marketValue)} + cumulative dividends ${fmtEUR(b.cumDividends)} + buybacks ${fmtEUR(b.cumRepurchases)} − share issues ${fmtEUR(b.cumIssues)} · NAV/share €${b.navPerShare.toFixed(4)} × sentiment ${b.sentiment.toFixed(3)}`;
  };
  return (
    <div className="panel p-3 overflow-x-auto">
      <div className="lbl mb-2">Scenario comparison — final results after 2017 Q2 (per-quarter figures labelled 2017 Q2)</div>
      <table className="w-full mono text-[11px] min-w-[900px]">
        <thead>
          <tr className="text-[var(--dim)] text-left border-b border-[var(--line)]">
            <th className="py-1.5 pr-3 font-normal">SCENARIO</th>
            <th className="py-1.5 pr-3 font-normal text-right">REVENUE<br />2017 Q2</th>
            <th className="py-1.5 pr-3 font-normal text-right">NET PROFIT<br />2017 Q2</th>
            <th className="py-1.5 pr-3 font-normal text-right">BANK CASH<br />END</th>
            <th className="py-1.5 pr-3 font-normal text-right">DEPOSIT<br />END</th>
            <th className="py-1.5 pr-3 font-normal text-right" title="Worst net bank position (cash − overdraft) across all five quarters — your cash-safety floor">MIN BANK CASH<br />5 QTRS</th>
            <th className="py-1.5 pr-3 font-normal text-right" title="Dividends actually executed by the engine (after opening-reserve caps and blocks), not requested">DIVIDENDS<br />EXECUTED</th>
            <th className="py-1.5 pr-3 font-normal text-right">SHARE<br />PRICE</th>
            <th className="py-1.5 pr-3 font-normal text-right">INV. PERF.<br />(BASE)</th>
            <th className="py-1.5 font-normal text-right" title="Modelled investment performance under adverse assumptions: competitor prices −10% / demand index −10% / euro −10%">STRESS INV. PERF.<br />WAR · REC · FX</th>
          </tr>
        </thead>
        <tbody>
          {runs.map(x => {
            const last = x.base.reports[3];
            const isBest = last.investmentPerformance === best;
            const minCash = Math.min(...x.base.reports.map(q => q.cashEnd - q.overdraftEnd));
            return (
              <tr key={x.s.name} className="border-t border-[var(--line)]">
                <td className="py-2 pr-3 text-[var(--cyan)]">
                  {x.s.name}{isBest && <span className="ml-2 text-[var(--mint)]">◆ BEST</span>}
                  <div className="text-[8px] text-[var(--dim)]">{scenarioSummary(x.s)}</div>
                </td>
                <td className="py-2 pr-3 text-right">{fmtEUR(last.revenue)}</td>
                <td className={`py-2 pr-3 text-right ${last.netProfit < 0 ? 'text-[var(--red)]' : ''}`}>{fmtEUR(last.netProfit)}</td>
                <td className="py-2 pr-3 text-right">{last.overdraftEnd > 0 ? <span className="text-[var(--red)]">−{fmtEUR(last.overdraftEnd)}</span> : fmtEUR(last.cashEnd)}</td>
                <td className="py-2 pr-3 text-right">{fmtEUR(last.details.balance.deposit)}</td>
                <td className={`py-2 pr-3 text-right ${minCash < 0 ? 'text-[var(--red)]' : ''}`} title={minCash < 0 ? 'Goes overdrawn at some point in the five quarters' : 'Never overdrawn in the base case'}>
                  {minCash < 0 ? `−${fmtEUR(-minCash)}` : fmtEUR(minCash)}
                </td>
                <td className="py-2 pr-3 text-right">{fmtEUR(x.base.finalState.cumDividends)}</td>
                <td className="py-2 pr-3 text-right">€{last.sharePrice.toFixed(3)}</td>
                <td className={`py-2 pr-3 text-right ${isBest ? 'text-[var(--mint)] font-bold' : 'text-[var(--cyan)]'}`} title={ipTitle(x)}>
                  {fmtEUR(last.investmentPerformance)}
                </td>
                <td className="py-2 text-right">
                  {x.stresses.map(st => (
                    <div key={st.kind} className={`text-[9px] leading-snug ${st.minCash < 0 ? 'text-[var(--red)]' : 'text-[var(--dim)]'}`}
                      title={`${STRESS_LABEL[st.kind]}: investment performance ${fmtEUR(st.ip)}${st.minCash < 0 ? ` — OVERDRAWN (worst cash −${fmtEUR(-st.minCash)})` : ' — stays cash-positive'}`}>
                      {st.kind} {fmtEUR(st.ip)}{st.minCash < 0 && <span className="text-[var(--red)]"> OD</span>}
                    </div>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[10px] text-[var(--dim)] mt-2">Scenario data is stored only in this browser (localStorage) — use EXPORT JSON for a shareable, build-stamped snapshot. Clearing browser data erases local slots.</p>
      <p className="text-[10px] text-[var(--amber)] mt-1">◆ BEST = highest MODELLED investment performance in the BASE case only — check the stress column and MIN BANK CASH before acting on it (a base-case winner can go overdrawn in a price war). Share price and investment performance are model-based proxies (formula: NAV/share × sentiment factor from ROE, dividend yield and liquidity; hover the value for the full decomposition). The official valuation formula is not disclosed — do not treat these scores as exact outcomes.</p>
    </div>
  );
}
