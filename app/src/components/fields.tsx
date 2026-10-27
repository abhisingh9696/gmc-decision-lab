import type { ReactNode } from 'react';

export function fmt(n: number, dec = 0): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: dec, minimumFractionDigits: dec });
}
export function fmtEUR(n: number, dec = 0): string {
  const sign = n < 0 ? '−' : '';
  return `${sign}€${fmt(Math.abs(n), dec)}`;
}

export function NumField({ label, value, onChange, step = 1, min, max, suffix, title, name, badge }: {
  label?: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; suffix?: string; title?: string; name?: string; badge?: React.ReactNode;
}) {
  const clamped = min != null && value < min ? min : max != null && value > max ? max : null;
  return (
    <label className="block" title={title}>
      {label && <span className="lbl block mb-0.5">{label}</span>}
      <span className="relative block">
        <input
          type="number" className={`field ${clamped != null ? 'border-[var(--amber)]' : ''}`} value={Number.isFinite(value) ? value : 0} step={step} min={min} max={max}
          aria-label={name ?? label ?? 'numeric decision input'}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--dim)] mono">{suffix}</span>}
      </span>
      {clamped != null && (
        <span className="block text-[9px] mono text-[var(--amber)] mt-0.5 leading-snug">
          requested {value} → official form would enter {clamped}
        </span>
      )}
      {badge}
    </label>
  );
}

/** Shows the value the engine ACTUALLY executes when a financial/sanitize rule
 *  overrode the requested input (dividend block, annual share cap, borrowing
 *  cap, deposit cap, wage floor, mgmt-budget notice, capex refusal…). */
export function EffBadge({ eff, req, suffix }: { eff: number | undefined; req: number; suffix?: string }) {
  if (eff == null || eff === req) return null;
  return (
    <span className="block text-[9px] mono text-[var(--amber)] mt-0.5 leading-snug"
      title="The engine adjusted this value (see Impact alerts). Portal export prints the executed value.">
      → engine executes {eff}{suffix ?? ''}
    </span>
  );
}

export function CheckField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button" onClick={() => onChange(!value)}
      role="switch" aria-checked={value} aria-label={label}
      className="flex items-center gap-2 text-left group"
    >
      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${value ? 'border-[var(--cyan)] shadow-[0_0_6px_rgba(34,211,238,.6)]' : 'border-[var(--line)] group-hover:border-[var(--muted)]'}`}>
        {value && <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />}
      </span>
      <span className="lbl group-hover:text-[var(--text)] transition-colors">{label}</span>
    </button>
  );
}

export function Section({ title, hint, children, defaultOpen = false }: {
  title: string; hint?: string; children: ReactNode; defaultOpen?: boolean;
}) {
  return (
    <details className="panel mb-2" open={defaultOpen}>
      <summary className="flex items-center justify-between px-3 py-2 hover:bg-[var(--panel2)] rounded-md transition-colors">
        <span className="mono text-[11px] font-semibold tracking-[.18em] uppercase text-[var(--cyan)]">{title}</span>
        <span className="text-[var(--dim)] text-xs">{hint}</span>
      </summary>
      <div className="px-3 pb-3 pt-1">{children}</div>
    </details>
  );
}

export const MK = ['EU', 'NAFTA', 'NET'];
export const PD = ['P1', 'P2', 'P3'];
