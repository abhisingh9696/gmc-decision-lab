import { useMemo, useState } from 'react';
import { sanitizeDecisions } from './engine';
import {runSimulation,defaultDecisions,defaultEcon,QUARTERS,SEASON_IDX} from './engine/q3';
import {useNavigate} from 'react-router';
import type { Decisions, EconAssumptions, Mat3x3 } from './engine/types';

import { P } from './engine/params';
import { DecisionPanel } from './components/DecisionPanel';
import { EconPanel } from './components/EconPanel';
import { KpiStrip, WarningsRail, CapacityRail } from './components/rails';
import { ProfitChart, CashChart, OrdersTable, ProjectionTable, type ChartActual } from './components/charts';
import { ScenarioBar, CompareView, loadScenarios, saveScenario, deleteScenario, validScenario, type Scenario } from './components/scenarios';
import { HistoryView } from './components/HistoryView';
import { StatementsView } from './components/StatementsView';
import { AuditView } from './components/AuditView';
import {Q3Strategies} from './components/Q3Strategies';
import { PortalExport } from './components/PortalExport';
import { HISTORY } from './engine/history';

// Official actual anchors for the trajectory charts: the five history quarters
// (from the supplied XLS files) plus the locked official 2016 Q2 report values.
const ACTUALS: ChartActual[] = [
  ...HISTORY.map(h => ({ q: h.q, revenue: h.revenue, opProfit: h.opProfit, netProfit: h.netProfit, cash: h.cash, ip: h.invPerf })),
  { q: '2016 Q2', revenue: 860997, opProfit: 59614, netProfit: 62489, cash: 2201507, ip: 3933200 },
];

export default function App() {
  const navigate=useNavigate();
  const [decisionsPerQ, setDecisionsPerQ] = useState<Decisions[]>(
    () => Array.from({ length: 4 }, () => defaultDecisions()));
  const [econPerQ, setEconPerQ] = useState<EconAssumptions[]>(
    () => SEASON_IDX.map(i => defaultEcon(i)));
  const [strategyLabel,setStrategyLabel]=useState('Custom / default Q3 inputs');
  const [activeQ, setActiveQ] = useState(0);
  const [scenarios, setScenarios] = useState<(Scenario | null)[]>(() => loadScenarios());
  const [comparing, setComparing] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const sim = useMemo(() => runSimulation(decisionsPerQ, econPerQ), [decisionsPerQ, econPerQ]);
  const r = sim.reports[activeQ];

  // wage floor for the active quarter = chain of effective wages up to it
  // (the engine never lets wages fall, so the floor accumulates)
  const priorWageActive = useMemo(() => {
    let pw = 1200; // baseline prior wage (2016 Q1 effective rate)
    for (let i = 0; i < activeQ; i++) pw = sanitizeDecisions(decisionsPerQ[i], pw).d.wage;
    return pw;
  }, [decisionsPerQ, activeQ]);

  const setD = (fn: (d: Decisions) => Decisions) => {
    if(activeQ===0)setStrategyLabel('Custom Q3 inputs');
    setDecisionsPerQ(prev => prev.map((d, i) => (i === activeQ ? fn(d) : d)));
  };
  const setEcon = (e: EconAssumptions) =>
    setEconPerQ(prev => prev.map((x, i) => (i === activeQ ? e : x)));

  // Smart seasonal propagate: copies this quarter forward but scales deliveries
  // and spot materials by the seasonality ratio, and does NOT repeat one-shot
  // moves (machines, extension, hires, loans) in every later quarter.
  const copyForward = () =>
    setDecisionsPerQ(prev => {
      const src = prev[activeQ];
      const srcSeason = P.seasonalityByQ[SEASON_IDX[activeQ]];
      return prev.map((d, i) => {
        if (i <= activeQ) return d;
        const ratio = P.seasonalityByQ[SEASON_IDX[i]] / srcSeason;
        const scaleM = (m: Mat3x3) => m.map(row => row.map(v => Math.max(0, Math.round(v * ratio / 25) * 25))) as Mat3x3;
        return { ...src,
          deliveries: scaleM(src.deliveries),
          matSpot: Math.round(src.matSpot * ratio),
          machinesBuy: 0, machinesSell: 0, factoryExt: 0,
          hire: 0, train: 0, termLoan: 0, shares: 0, termDeposit: 0,
        };
      });
    });

  const handleSave = (slot: number) => {
    const name = scenarios[slot]?.name ?? `STRATEGY ${slot + 1}`;
    saveScenario(slot, { name, decisionsPerQ, econPerQ, buildId: __BUILD_ID__, savedAt: new Date().toISOString() });
    setScenarios(loadScenarios());
  };
  const handleLoad = (s: Scenario) => {
    setDecisionsPerQ(s.decisionsPerQ.map(d => ({ ...d })));
    setEconPerQ(s.econPerQ.map(e => ({ ...e })));
    setComparing(false);setShowAudit(false);setShowHistory(false);setActiveQ(0);
  };
  const handleDelete = (slot: number) => { deleteScenario(slot); setScenarios(loadScenarios()); };

  // Reproducibility: full-fidelity JSON snapshot (all 75 decisions × 4 quarters,
  // external assumptions, app build) so any result can be re-run exactly.
  const handleExportScenarios = () => {
    const payload = {
      app: 'gmc-decision-lab',
      buildId: __BUILD_ID__,
      exportedAt: new Date().toISOString(),
      slots: loadScenarios(),
      current: {name:'Current inputs',decisionsPerQ,econPerQ,buildId:__BUILD_ID__},
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmc-scenarios-${__BUILD_ID__}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImportScenarios = (file: File) => {
    if(file.size>2_000_000){alert("Scenario file exceeds the 2 MB limit.");return;}
    file.text().then(txt => {
      try {
        const parsed = JSON.parse(txt);
        const slots = Array.isArray(parsed) ? parsed : parsed.slots;
        if ((parsed.current != null && !validScenario(parsed.current)) || !Array.isArray(slots) || slots.length > 3 || slots.some(sc => sc != null && !validScenario(sc))) throw new Error('Invalid four-quarter scenario structure');
        [0, 1, 2].forEach(i => {
          const sc = slots[i];
          if (sc && validScenario(sc)) saveScenario(i, sc);
          else deleteScenario(i);
        });
        setScenarios(loadScenarios());
        if(parsed.current)handleLoad(parsed.current);
      } catch {
        alert('Could not import: not a valid GMC Decision Lab scenario JSON file.');
      }
    });
  };

  return (
    <div className="min-h-dvh">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(5,8,16,.92)] backdrop-blur">
        <div className="px-4 py-2 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--mint)] pulse-dot" />
            <h1 className="mono text-sm font-bold tracking-[.22em] text-[var(--text)]">GMC DECISION LAB</h1>
          </div>
          <div className="mono text-[10px] text-[var(--dim)] tracking-wider">
            KISSING ASSETS · GROUP 13 · COMPANY 2 · STUDENT CHAMPIONSHIP 2026
          </div>
          <button className="audit-button" onClick={()=>navigate('/')}>Q2 OFFICIAL ACTUAL · LOCKED</button><div className="flex-1" />
          <ScenarioBar scenarios={scenarios} onSave={handleSave} onLoad={handleLoad}
            onDelete={handleDelete} onCompare={() => {setShowAudit(false); setComparing(c => !c);}} comparing={comparing}
            onExport={handleExportScenarios} onImport={handleImportScenarios} />
        </div>
        <div className="px-4 pb-2 flex items-center gap-1 flex-wrap">
          {QUARTERS.map((q, i) => {
            const wr = sim.reports[i].warnings;
            const dot = wr.some(x => x.severity === 'critical') ? 'bg-[var(--red)]' : wr.length ? 'bg-[var(--amber)]' : 'bg-[var(--mint)]';
            return (
              <button key={q} onClick={() => { setActiveQ(i); setComparing(false); setShowHistory(false); setShowAudit(false); }}
                className={`qtab mono text-[11px] px-3 py-1.5 rounded border flex items-center gap-2 ${i === activeQ && !comparing ? 'border-[var(--cyan)] text-[var(--cyan)] bg-[rgba(34,211,238,.08)]' : 'border-[var(--line)] text-[var(--muted)]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {q}{i === 1 && <span className="text-[9px] text-[var(--amber)]">PEAK</span>}
              </button>
            );
          })}
          <button onClick={() => { setShowHistory(true); setComparing(false); setShowAudit(false); }}
            className={`qtab mono text-[11px] px-3 py-1.5 rounded border ${showHistory && !comparing ? 'border-[var(--amber)] text-[var(--amber)] bg-[rgba(251,191,36,.08)]' : 'border-[var(--line)] text-[var(--muted)]'}`}>
            ▸ HISTORY (5 QTRS ACTUAL)
          </button>
          <button className="audit-button" onClick={()=>{setShowAudit(v=>!v);setComparing(false);setShowHistory(false);}}>SOURCE & AUDIT</button>
          <button onClick={copyForward}
            className="mono text-[10px] px-2 py-1.5 text-[var(--dim)] hover:text-[var(--cyan)] transition-colors"
            title="Copy this quarter forward with season-adjusted volumes (deliveries & materials scale to each quarter's demand index; one-shot moves like machines, hires and loans are not repeated)">
            PROPAGATE {QUARTERS[activeQ]} → LATER (seasonal)
          </button>
          <button onClick={() => setShowExport(true)}
            className="mono text-[10px] px-2 py-1.5 text-[var(--dim)] hover:text-[var(--cyan)] transition-colors"
            title="Show this quarter's decisions in official portal field order for manual transcription">
            PORTAL EXPORT
          </button>
        </div>
        <div className="px-4 py-1 bg-[rgba(251,191,36,.06)] border-t border-[var(--line)]">
          <p className="mono text-[9px] tracking-wider text-[var(--amber)]">
            Q3 FORECAST — opening bank €1,051,507 · deposit €1,150,000 · equity €4,018,573 from official Q2. Demand, payroll and collections remain estimates. Future material quotes held constant. No official submissions.
          </p>
        </div>
      </header>

      {!showAudit && !comparing && !showHistory && <><Q3Strategies econ={econPerQ[0]} onApply={(d,name)=>{setDecisionsPerQ(prev=>prev.map((v,i)=>i===0?d:v));setStrategyLabel(name);setActiveQ(0);}}/><p className="px-4 text-xs text-[var(--cyan)]">Q3 inputs: {strategyLabel}</p></>}
      {showAudit ? <AuditView current={decisionsPerQ} econ={econPerQ} onApply={d=>{if(d.length!==4){alert("Historical five-quarter strategies cannot be applied to Q3. Enter a new four-quarter plan.");return;}setDecisionsPerQ(d);setShowAudit(false);setComparing(false);setShowHistory(false);setActiveQ(0);}} /> : comparing ? (
        <main className="p-4 max-w-[1200px] mx-auto">
          <CompareView scenarios={scenarios} />
        </main>
      ) : showHistory ? (
        <main className="p-4 max-w-[900px] mx-auto">
          <HistoryView />
        </main>
      ) : (
        <main className="grid grid-cols-1 xl:grid-cols-[320px_1fr_330px] gap-3 p-3 max-w-[1800px] mx-auto">
          {/* left: decisions */}
          <aside className="min-w-0">
            <div className="lbl px-1 mb-2 flex justify-between">
              <span>Decision inputs — {QUARTERS[activeQ]}</span><span>75 fields</span>
            </div>
            <DecisionPanel d={decisionsPerQ[activeQ]} setD={setD} eff={sim.reports[activeQ]?.effectiveDecisions} />
            <EconPanel econ={econPerQ[activeQ]} onChange={setEcon} />
          </aside>

          {/* center: impact dashboard */}
          <section className="min-w-0 space-y-3">
            <KpiStrip r={r} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <ProfitChart reports={sim.reports} actuals={ACTUALS} />
              <CashChart reports={sim.reports} actuals={ACTUALS} />
            </div>
            <OrdersTable r={r} />
            <ProjectionTable reports={sim.reports} />
            <div>
              <div className="lbl px-1 mb-2">Financial statements — {QUARTERS[activeQ]} (open the calculation bridges)</div>
              <StatementsView r={r} />
            </div>
          </section>

          {/* right: alerts + capacity */}
          <aside className="min-w-0 space-y-3">
            <WarningsRail reports={sim.reports} activeQ={activeQ} />
            <CapacityRail r={r} />
            <div className="panel p-3">
              <div className="lbl mb-1.5">How to use</div>
              <ol className="text-[11px] text-[var(--muted)] space-y-1 list-decimal list-inside leading-snug">
                <li>Pick a quarter tab, edit decisions left.</li>
                <li>Impact updates live: KPIs, alerts, charts.</li>
                <li>Fix every red alert before submitting for real.</li>
                <li>Plan Q4 capacity one quarter early — machines, workers and space arrive NEXT quarter.</li>
                <li>Save up to 3 strategies, compare them, then enter the winner on the official site.</li>
              </ol>
              <p className="text-[10px] text-[var(--dim)] mt-2 leading-snug border-t border-[var(--line)] pt-2">
                Share price / investment performance are model proxies: NAV per share × sentiment (ROE, dividend yield, liquidity). The official formula is undisclosed. Tax: assessed at Q4, paid next Q2. Dividends capped by opening reserves.
              </p>
            </div>
          </aside>
        </main>
      )}

      {showExport && <PortalExport d={decisionsPerQ[activeQ]} priorWage={priorWageActive} quarter={QUARTERS[activeQ]} onClose={() => setShowExport(false)}
        effective={sim.reports[activeQ]?.effectiveDecisions}
        engineAdjustments={sim.reports[activeQ]?.warnings.filter(warn => warn.adjustment)} />}

      <footer className="border-t border-[var(--line)] px-4 py-2 mt-2">
        <p className="mono text-[9px] text-[var(--dim)] tracking-wider text-center">
          GMC DECISION LAB · BUILD {__BUILD_ID__} · UNOFFICIAL TRAINING TOOL · NOT AFFILIATED WITH SDG / EDIT 515 · SCENARIOS STORED LOCALLY IN YOUR BROWSER ONLY
        </p>
      </footer>
    </div>
  );
}
