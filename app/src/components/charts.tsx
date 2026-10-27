import { Fragment } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend, ReferenceLine,
} from 'recharts';
import type { QuarterReport } from '../engine/types';
import { MK, PD } from './fields';

const tipStyle = {
  contentStyle: { background: '#0c1220', border: '1px solid #1a2540', borderRadius: 6, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
  labelStyle: { color: '#8a97ad' },
};

export function ProfitChart({ reports }: { reports: QuarterReport[] }) {
  const data = reports.map(r => ({ q: r.quarterLabel, Revenue: r.revenue, 'Op. profit': r.operatingProfit, 'Net profit': r.netProfit }));
  return (
    <div className="panel p-3 h-56">
      <div className="lbl mb-2">Revenue & profit by quarter</div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid stroke="#1a2540" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="q" tick={{ fill: '#8a97ad', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a2540' }} tickLine={false} />
          <YAxis tick={{ fill: '#5b6a82', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} width={38} />
          <Tooltip {...tipStyle} formatter={(v: number) => `€${v.toLocaleString()}`} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
          <ReferenceLine y={0} stroke="#1a2540" />
          <Bar dataKey="Revenue" fill="#22d3ee" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Op. profit" fill="#34d399" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Net profit" fill="#fbbf24" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CashChart({ reports }: { reports: QuarterReport[] }) {
  const data = reports.map(r => ({
    q: r.quarterLabel,
    Cash: r.overdraftEnd > 0 ? -r.overdraftEnd : r.cashEnd,
    'Inv. performance': r.investmentPerformance,
  }));
  return (
    <div className="panel p-3 h-56">
      <div className="lbl mb-2">Cash & investment performance trajectory</div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid stroke="#1a2540" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="q" tick={{ fill: '#8a97ad', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1a2540' }} tickLine={false} />
          <YAxis yAxisId="l" tick={{ fill: '#5b6a82', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} width={38} />
          <YAxis yAxisId="r" orientation="right" tick={{ fill: '#5b6a82', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} width={38} />
          <Tooltip {...tipStyle} formatter={(v: number) => `€${v.toLocaleString()}`} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
          <ReferenceLine yAxisId="l" y={0} stroke="#f8717155" />
          <Line yAxisId="l" type="monotone" dataKey="Cash" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#34d399' }} />
          <Line yAxisId="r" type="monotone" dataKey="Inv. performance" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#22d3ee' }} strokeDasharray="6 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersTable({ r }: { r: QuarterReport }) {
  return (
    <div className="panel p-3 overflow-x-auto">
      <div className="lbl mb-2">Demand vs sales — {r.quarterLabel}</div>
      <table className="w-full mono text-[11px]">
        <thead>
          <tr className="text-[var(--dim)] text-left">
            <th className="py-1 pr-2 font-normal">MKT</th>
            {PD.map(p => <th key={p} className="py-1 pr-2 font-normal text-center" colSpan={3}>{p} — ord/sold/bl</th>)}
          </tr>
        </thead>
        <tbody>
          {MK.map((m, mi) => (
            <tr key={m} className="border-t border-[var(--line)]">
              <td className="py-1.5 pr-2 text-[var(--cyan)]">{m}</td>
              {PD.map((_, p) => {
                const o = r.orders[mi][p], s = r.sales[mi][p];
                const bl = mi < 2 ? r.backlogEnd[mi][p] : r.lostInternetDemand[p];
                const short = o - s > 0;
                return (
                  <Fragment key={p}>
                    <td className="py-1.5 text-right pr-1 text-[var(--muted)]">{o}</td>
                    <td className={`py-1.5 text-right pr-1 ${short ? 'text-[var(--amber)]' : 'text-[var(--mint)]'}`}>{s}</td>
                    <td className={`py-1.5 text-right pr-2 ${bl > 0 ? 'text-[var(--red)]' : 'text-[var(--dim)]'}`}>{bl}</td>
                  </Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-[var(--dim)] mt-2">ord = orders · sold = delivered sales · bl = backlog carried (EU/NAFTA) or lost demand (NET)</p>
    </div>
  );
}

export function ProjectionTable({ reports }: { reports: QuarterReport[] }) {
  const rows: [string, (r: QuarterReport) => string, string?][] = [
    ['Revenue', r => `€${(r.revenue / 1000).toFixed(0)}k`],
    ['Operating profit', r => `€${(r.operatingProfit / 1000).toFixed(0)}k`],
    ['Net profit', r => `€${(r.netProfit / 1000).toFixed(0)}k`],
    ['Cash / (overdraft)', r => r.overdraftEnd > 0 ? `(€${(r.overdraftEnd / 1000).toFixed(0)}k)` : `€${(r.cashEnd / 1000).toFixed(0)}k`],
    ['Dividend paid', r => `€${(r.dividendPaid / 1000).toFixed(1)}k`],
    ['Share price', r => `€${r.sharePrice.toFixed(3)}`],
    ['Market value', r => `€${(r.marketValue / 1e6).toFixed(2)}M`],
    ['INVESTMENT PERFORMANCE', r => `€${(r.investmentPerformance / 1e6).toFixed(3)}M`, 'text-[var(--cyan)] font-bold'],
    ['Units ordered', r => r.orders.flat().reduce((a, b) => a + b, 0).toLocaleString()],
    ['Units sold', r => r.sales.flat().reduce((a, b) => a + b, 0).toLocaleString()],
    ['Machining util.', r => `${Math.min(999, (r.machHoursNeeded / Math.max(1, r.machHoursAvail)) * 100).toFixed(0)}%`],
    ['Assembly util.', r => `${Math.min(999, (r.assemblyHoursNeeded / Math.max(1, r.assemblyHoursAvail)) * 100).toFixed(0)}%`],
    ['Alerts', r => String(r.warnings.length)],
  ];
  return (
    <div className="panel p-3 overflow-x-auto">
      <div className="lbl mb-2">Four-quarter projection — full roll-forward</div>
      <table className="w-full mono text-[11px] min-w-[640px]">
        <thead>
          <tr className="text-[var(--dim)] text-left border-b border-[var(--line)]">
            <th className="py-1.5 pr-3 font-normal">METRIC</th>
            {reports.map(r => <th key={r.quarterLabel} className="py-1.5 pr-3 font-normal text-right">{r.quarterLabel}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, fn, cls]) => (
            <tr key={label} className="border-t border-[var(--line)]">
              <td className="py-1.5 pr-3 text-[var(--muted)]">{label}</td>
              {reports.map(r => (
                <td key={r.quarterLabel} className={`py-1.5 pr-3 text-right ${cls ?? 'text-[var(--text)]'}`}>{fn(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
