import type { QuarterReport } from '../engine/types';
import { fmt, fmtEUR } from './fields';

function Kpi({ label, value, sub, tone = 'text-[var(--text)]' }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="panel px-3 py-2.5 min-w-0">
      <div className="lbl mb-1">{label}</div>
      <div className={`mono text-[13px] 2xl:text-[15px] font-semibold leading-tight break-all ${tone}`}>{value}</div>
      {sub && <div className="text-[10px] text-[var(--dim)] mt-1 leading-snug">{sub}</div>}
    </div>
  );
}

export function KpiStrip({ r }: { r: QuarterReport }) {
  const profitTone = r.operatingProfit >= 0 ? 'text-[var(--mint)]' : 'text-[var(--red)]';
  const cashTone = r.unauthorised ? 'text-[var(--red)]' : r.overdraftEnd > 0 ? 'text-[var(--amber)]' : 'text-[var(--mint)]';
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6 gap-2">
      <Kpi label="Revenue" value={fmtEUR(r.revenue)} sub={`${fmt(r.orders.flat().reduce((a, b) => a + b, 0))} units ordered`} />
      <Kpi label="Operating profit" value={fmtEUR(r.operatingProfit)} tone={profitTone} sub={`net ${fmtEUR(r.netProfit)}`} />
      <Kpi label="Bank cash end" value={r.overdraftEnd > 0 ? fmtEUR(-r.overdraftEnd) : fmtEUR(r.cashEnd)} tone={cashTone}
        sub={(r.overdraftEnd > 0 ? (r.unauthorised ? 'UNAUTHORISED OD' : 'authorised OD') : 'positive') + ` · deposit ${fmtEUR(r.details.balance.deposit)}`} />
      <Kpi label="Share price (model)" value={`€${r.sharePrice.toFixed(4)}`}
        sub={`NAV €${r.ipBreakdown.navPerShare.toFixed(4)} × sentiment ${r.ipBreakdown.sentiment.toFixed(3)} · mkt value ${fmtEUR(r.marketValue)}`} />
      <Kpi label="Investment perf. (model)" value={fmtEUR(r.investmentPerformance)} tone="text-[var(--cyan)]"
        sub={`mkt ${fmtEUR(r.ipBreakdown.marketValue)} + div ${fmtEUR(r.ipBreakdown.cumDividends)} + buybacks ${fmtEUR(r.ipBreakdown.cumRepurchases)} − issues ${fmtEUR(r.ipBreakdown.cumIssues)}`} />
      <Kpi label="Dividend paid" value={fmtEUR(r.dividendPaid)} sub={`stars ${r.stars.map(s => s.toFixed(1)).join(' · ')}`} />
    </div>
  );
}

const SEV = {
  critical: { cls: 'alert-critical', dot: 'bg-[var(--red)]', tag: 'CRITICAL', tc: 'text-[var(--red)]' },
  warn: { cls: 'alert-warn', dot: 'bg-[var(--amber)]', tag: 'WARNING', tc: 'text-[var(--amber)]' },
  info: { cls: 'alert-info', dot: 'bg-[var(--cyan)]', tag: 'INFO', tc: 'text-[var(--cyan)]' },
};

export function WarningsRail({ reports, activeQ }: { reports: QuarterReport[]; activeQ: number }) {
  const r = reports[activeQ];
  const all = r.warnings;
  return (
    <div className="panel p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="mono text-[11px] font-semibold tracking-[.18em] uppercase text-[var(--cyan)]">Impact alerts</span>
        <span className={`w-2 h-2 rounded-full pulse-dot ${all.some(x => x.severity === 'critical') ? 'bg-[var(--red)]' : all.length ? 'bg-[var(--amber)]' : 'bg-[var(--mint)]'}`} />
      </div>
      {all.length === 0 && (
        <div className="text-[11px] text-[var(--muted)] border border-dashed border-[var(--line)] rounded p-3">
          No issues detected — this decision set looks feasible.
        </div>
      )}
      <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
        {all.map((x, i) => (
          <div key={i} className={`panel2 p-2.5 ${SEV[x.severity].cls}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${SEV[x.severity].dot}`} />
              <span className={`mono text-[9px] tracking-[.2em] ${SEV[x.severity].tc}`}>{SEV[x.severity].tag}</span>
              <span className="mono text-[11px] font-semibold">{x.title}</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-snug">{x.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Gauge({ label, used, avail, unit }: { label: string; used: number; avail: number; unit: string }) {
  const pct = avail > 0 ? Math.min(100, (used / avail) * 100) : 0;
  const over = used > avail;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="lbl">{label}</span>
        <span className={`mono text-[10px] ${over ? 'text-[var(--red)]' : 'text-[var(--muted)]'}`}>
          {fmt(used)} / {fmt(avail)} {unit}
        </span>
      </div>
      <div className="h-1.5 rounded bg-[#070b14] overflow-hidden">
        <div className={`h-full rounded transition-all duration-200 ${over ? 'bg-[var(--red)]' : pct > 85 ? 'bg-[var(--amber)]' : 'bg-[var(--mint)]'}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CapacityRail({ r }: { r: QuarterReport }) {
  const goodPlanned = r.productionPlanned.reduce((a, b) => a + b, 0);
  const gross = r.grossStarts.reduce((a, b) => a + b, 0);
  const rej = r.rejects.reduce((a, b) => a + b, 0);
  const goodOut = r.productionActual.reduce((a, b) => a + b, 0);
  const grossMade = goodOut + rej; // integer-consistent by construction
  return (
    <div className="panel p-3 space-y-3">
      <span className="mono text-[11px] font-semibold tracking-[.18em] uppercase text-[var(--cyan)]">Capacity check</span>
      <Gauge label="Machining" used={r.machHoursNeeded} avail={r.machHoursAvail} unit="hrs" />
      <Gauge label="Assembly" used={r.assemblyHoursNeeded} avail={r.assemblyHoursAvail} unit="hrs" />
      <Gauge label="Factory space" used={r.spaceNeeded} avail={r.spaceAvail} unit="m²" />
      <Gauge label="Overdraft (authorised limit)" used={r.overdraftEnd} avail={Math.max(1, r.overdraftLimit)} unit="€" />
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="lbl">Materials</span>
          <span className={`mono text-[10px] ${r.materialsShortfall > 0 ? 'text-[var(--red)]' : 'text-[var(--muted)]'}`}>
            need {fmt(r.materialsNeeded)} u{r.materialsShortfall > 0 ? ` · short ${fmt(r.materialsShortfall)}` : ' · covered'}
          </span>
        </div>
        <div className="h-1.5 rounded bg-[#070b14] overflow-hidden">
          <div className={`h-full rounded transition-all duration-200 ${r.materialsShortfall > 0 ? 'bg-[var(--red)]' : 'bg-[var(--mint)]'}`}
            style={{ width: r.materialsShortfall > 0 ? '100%' : '100%' }} />
        </div>
      </div>
      <div className="pt-1 border-t border-[var(--line)] text-[10px] mono text-[var(--muted)] space-y-1">
        <div className="lbl mb-0.5">Production schedule</div>
        <div>Plan <span className="text-[var(--text)]">{fmt(goodPlanned)}</span> good → <span className="text-[var(--text)]">{fmt(gross)}</span> gross scheduled ({(r.rejectRate[0] * 100).toFixed(1)}% reject allowance)</div>
        <div>Produced <span className="text-[var(--mint)]">{fmt(goodOut)}</span> good = <span className="text-[var(--text)]">{fmt(grossMade)}</span> gross − <span className="text-[var(--amber)]">{fmt(rej)}</span> rejects ✓</div>
        <div>Workforce: <span className="text-[var(--text)]">{r.assemblyWorkersOpen}</span> workers (post-arrival) × (420 basic + 84 Sat + 72 Sun) × 97% attendance = {fmt(r.assemblyHoursAvail)} h</div>
        <div>Overtime used: Sat <span className="text-[var(--text)]">{fmt(r.assemblyTiers.saturday)}</span> h @1.5× · Sun <span className="text-[var(--text)]">{fmt(r.assemblyTiers.sunday)}</span> h @2×</div>
        {r.componentWipEnd.some(u => u > 0) && <div>Component WIP left: <span className="text-[var(--text)]">{r.componentWipEnd.map((u, i) => u > 0 ? `P${i + 1}: ${fmt(u)}` : null).filter(Boolean).join(' · ')}</span> (assembled first next quarter)</div>}
        {r.obsoleteUnits > 0 && <div>Obsolete liquidated: <span className="text-[var(--amber)]">{fmt(r.obsoleteUnits)} units</span> ({r.obsoleteByProduct.map((u, i) => u > 0 ? `P${i + 1}: ${u}` : null).filter(Boolean).join(' · ')}) · proceeds {fmtEUR(r.obsoleteProceeds)}</div>}
      </div>
      <div className="pt-1 border-t border-[var(--line)] grid grid-cols-2 gap-2 text-[10px] mono text-[var(--muted)]">
        <div>CO₂e <span className="text-[var(--text)]">{r.carbonTonnes}t</span></div>
        <div>Failed visits <span className={r.failedVisitsPct > 5 ? 'text-[var(--amber)]' : 'text-[var(--text)]'}>{r.failedVisitsPct.toFixed(1)}%</span></div>
        <div>Web stars <span className="text-[var(--text)]">{r.webStars.toFixed(1)}</span></div>
        <div>Tax assessed <span className="text-[var(--text)]">{fmtEUR(r.tax)}</span>{r.tax === 0 && <span className="text-[var(--dim)]"> (Q4)</span>}</div>
      </div>
    </div>
  );
}
