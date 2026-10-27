import { useEffect, useRef, useState } from 'react';
import { sanitizeDecisions } from '../engine';
import type { Decisions, Warning } from '../engine/types';
import { MK, PD } from './fields';

// Renders the active quarter's decisions in the OFFICIAL portal field order
// (dtable.htm) so the team can transcribe them top-to-bottom without mistakes.
// Values are the EFFECTIVE entries — the same sanitize pass the engine runs
// (wage floor, shift range, loan >= 0, …), so the export can never disagree
// with the forecast. This tool never talks to the portal — export is text only.
export function portalLines(d: Decisions): string[] {
  const L: string[] = [];
  const push = (label: string, v: string | number) => L.push(`${label} = ${v}`);
  MK.forEach((m, i) => push(`Corporate advertising ${m} (€'000)`, d.advCorp[i]));
  MK.forEach((m, mi) => PD.forEach((p, pi) => push(`Product advertising ${m} ${p} (€'000)`, d.advProd[mi][pi])));
  MK.forEach((m, mi) => PD.forEach((p, pi) => push(`Price ${m} ${p} (€)`, d.prices[mi][pi])));
  MK.forEach((m, mi) => PD.forEach((p, pi) => push(`Deliver to ${m} ${p} (units)`, d.deliveries[mi][pi])));
  PD.forEach((p, i) => push(`Implement improvement ${p} (1=yes)`, d.takeImprovement[i] ? 1 : 0));
  PD.forEach((p, i) => push(`Product development ${p} (€'000)`, d.rd[i]));
  PD.forEach((p, i) => push(`Assembly time ${p} (min)`, d.assemblyTimes[i]));
  PD.forEach((p, i) => push(`Premium materials ${p} (%)`, d.premium[i]));
  PD.forEach((p, i) => push(`Subcontracting ${p} (units)`, d.subcontract[i]));
  push('EU agents wanted', d.agentsEU.want);
  push('Nafta distributors wanted', d.distNafta.want);
  push('EU agent support (€' + "'000)", d.agentsEU.support);
  push('Nafta distributor support (€' + "'000)", d.distNafta.support);
  push('Internet distributor support (€' + "'000)", d.distNet.support);
  push('EU agent commission (%)', d.agentsEU.commission);
  push('Nafta distributor commission (%)', d.distNafta.commission);
  push('Internet commission (%)', d.distNet.commission);
  push('Materials spot (' + "'000)", d.matSpot);
  push('Materials 3-month (' + "'000)", d.matM3);
  push('Materials 6-month (' + "'000)", d.matM6);
  push('Plant maintenance (hrs/machine)', d.maintenance);
  push('Shift level', d.shift);
  push('Website ports', d.ports);
  push('Website development (€' + "'000)", d.webDev);
  push('Assembly workers recruit(+)/dismiss(−)', d.hire);
  push('Assembly workers to train', d.train);
  push('Assembly wage rate (cents/hr)', d.wage);
  push('Management budget (€' + "'000)", d.mgmtBudget);
  push('Staff training consultant (days)', d.trainingDays);
  push('Share issue(+)/repurchase(−) (€' + "'000)", d.shares);
  push('Dividend (%)', d.dividend);
  push('Additional term loan (€' + "'000)", d.termLoan);
  push('Term deposit change (+/− €' + "'000)", d.termDeposit);
  push('Machines to buy', d.machinesBuy);
  push('Machines to sell', d.machinesSell);
  push('Factory build (sq m)', d.factoryExt);
  push('Insurance plan (0–4)', d.insurance);
  push('Information: market shares (1=yes)', d.infoMarket ? 1 : 0);
  push('Information: competitors (1=yes)', d.infoCompetitors ? 1 : 0);
  return L;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function PortalExport({ d, priorWage, quarter, onClose, effective, engineAdjustments }: {
  d: Decisions; priorWage: number; quarter: string; onClose: () => void;
  effective?: Decisions; engineAdjustments?: Warning[];
}) {
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  // Effective values = what the engine ACTUALLY ran this quarter. Preferred
  // source: the quarter report's effectiveDecisions, which include every
  // financial restriction (annual share cap, below-par block, dividend cap,
  // borrowing-power cap, deposit cap, capex refusals, mgmt-budget notice).
  // Fallback (no report yet): the shared input-sanitize pass only.
  const sv = sanitizeDecisions(d, priorWage);
  const eff = effective ?? sv.d;
  const adjustments = engineAdjustments ?? sv.warnings;
  const lines = portalLines(eff);
  const text = `GMC portal entries — ${quarter} (Kissing Assets, Group 13, Company 2)\n` + lines.join('\n');

  // Focus trap: move focus into the dialog on open, cycle Tab within it,
  // close on Escape, and restore focus to the opener on unmount.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter(el => !el.hasAttribute('disabled'));
    (focusables()[0] ?? panel).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0]; const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={`Portal export ${quarter}`} tabIndex={-1}
        className="panel max-w-lg w-full max-h-[80vh] flex flex-col outline-none" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--line)]">
          <span className="mono text-[11px] font-semibold tracking-[.18em] uppercase text-[var(--cyan)]">
            Portal export — {quarter} · {lines.length} fields
          </span>
          <button onClick={onClose} aria-label="Close export panel"
            className="mono text-[11px] text-[var(--dim)] hover:text-[var(--text)]">✕</button>
        </div>
        {adjustments.length > 0 && (
          <div className="px-3 py-2 border-b border-[var(--amber)] bg-[rgba(251,191,36,.07)]">
            <div className="mono text-[9px] tracking-[.18em] text-[var(--amber)] mb-1">ADJUSTED TO EFFECTIVE ENTRIES</div>
            {adjustments.map((a, i) => (
              <p key={i} className="text-[10px] text-[var(--amber)] leading-snug">• {a.title}: {a.detail}</p>
            ))}
          </div>
        )}
        <pre className="mono text-[10px] text-[var(--muted)] leading-relaxed overflow-y-auto p-3 flex-1 whitespace-pre-wrap" tabIndex={0}>{text}</pre>
        <div className="px-3 py-2 border-t border-[var(--line)] flex items-center gap-3">
          <button
            onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="mono text-[10px] px-3 py-1.5 rounded border border-[var(--cyan)] text-[var(--cyan)] hover:bg-[rgba(34,211,238,.1)]">
            {copied ? 'COPIED ✓' : 'COPY TO CLIPBOARD'}
          </button>
          <span className="text-[9px] text-[var(--dim)] leading-snug">
            Transcribe into the official decision form yourself — this tool never submits anything. Dividend: portal takes % (= cents/share at €1 nominal). Esc closes.
          </span>
        </div>
      </div>
    </div>
  );
}
