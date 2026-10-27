import { HISTORY_ACTUALS } from '../engine/history';
import { fmtEUR } from './fields';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Cell } from 'recharts';
import type { TooltipProps } from 'recharts';

const MK = ['EU', 'NAFTA', 'NET'];

function TrendTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="panel2 p-2 mono text-[10px]">
      <div className="text-[var(--cyan)] mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {fmtEUR(Number(p.value))}</div>
      ))}
    </div>
  );
}

export function HistoryView() {
  const chartData = HISTORY_ACTUALS.map(h => ({
    q: h.q, Revenue: h.revenue, 'Operating profit': h.opProfit, 'Net profit': h.netProfit, Cash: h.cash,
  }));
  const rows: { label: string; get: (h: typeof HISTORY_ACTUALS[0]) => string; cls?: (h: typeof HISTORY_ACTUALS[0]) => string }[] = [
    { label: 'Sales revenue', get: h => fmtEUR(h.revenue) },
    { label: 'Cost of sales', get: h => fmtEUR(h.cogs) },
    { label: 'Admin expenses', get: h => fmtEUR(h.admin) },
    { label: 'Operating profit', get: h => fmtEUR(h.opProfit), cls: h => h.opProfit >= 0 ? 'text-[var(--mint)]' : 'text-[var(--red)]' },
    { label: 'Net profit', get: h => fmtEUR(h.netProfit), cls: h => h.netProfit >= 0 ? 'text-[var(--mint)]' : 'text-[var(--red)]' },
    { label: 'Retained earnings', get: h => fmtEUR(h.retained), cls: h => h.retained >= 0 ? 'text-[var(--mint)]' : 'text-[var(--red)]' },
    { label: 'Cash (incl. deposit)', get: h => fmtEUR(h.cash) },
    { label: 'Bank cash (excl. deposit)', get: h => fmtEUR(h.cash - (h.deposit ?? 0)) },
    { label: 'Term deposit', get: h => h.deposit != null ? fmtEUR(h.deposit) : '—' },
    { label: 'Current assets', get: h => h.currentAssets != null ? fmtEUR(h.currentAssets) : '—' },
    { label: 'Net assets', get: h => h.netAssets != null ? fmtEUR(h.netAssets) : '—' },
    { label: 'Share price', get: h => '€' + h.sharePrice.toFixed(4) },
    { label: 'Investment performance', get: h => fmtEUR(h.invPerf), cls: () => 'text-[var(--cyan)]' },
    { label: 'Machines (next qtr)', get: h => String(h.machines) },
    { label: 'Machine efficiency', get: h => h.eff.toFixed(1) + '%', cls: h => h.eff < 96 ? 'text-[var(--amber)]' : '' },
    { label: 'Website visits', get: h => h.visits ? h.visits.toLocaleString() : '—' },
  ];

  return (
    <div className="space-y-3">
      <div className="panel p-3">
        <div className="lbl mb-1">Where this data comes from</div>
        <p className="text-[11px] text-[var(--muted)] leading-snug">
          These are your company's <span className="text-[var(--text)]">actual published results</span> from the 5 history
          sheets (HstY15Q1 → HstY16Q1) plus the <span className="text-[var(--text)]">official 2016 Q2 management report
          (W132162.xls)</span> as the locked final column. The Q3 simulator starts from that Q2 closing position; its
          inputs are seeded from the actual Q1 decisions with two explicit Q2 changes: P2 improvement is off
          (already consumed) and market-share information is on (€5k). Every figure is extracted directly from the
          supplied files. 2015 Q2 cash of €1,852,457 is the official cash-flow "Cash balance": €1.9M term deposit
          less a €47,543 bank overdraft. Current assets at 2016 Q2 are €2,916,654 (≈€2.9M).
        </p>
      </div>

      <div className="panel p-3">
        <div className="lbl mb-2">Actual financial trend — 2015 Q1 → 2016 Q2 (all official actuals)</div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" />
              <XAxis dataKey="q" tick={{ fill: 'var(--dim)', fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="var(--line)" />
              <YAxis tick={{ fill: 'var(--dim)', fontSize: 9, fontFamily: 'JetBrains Mono' }} stroke="var(--line)"
                tickFormatter={(v: number) => (v / 1e6).toFixed(1) + 'M'} width={38} />
              <Tooltip content={<TrendTooltip />} />
              <ReferenceLine y={0} stroke="var(--dim)" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Revenue" stroke="var(--cyan)" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="Operating profit" stroke="var(--mint)" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="Cash" stroke="var(--amber)" strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel p-3">
        <div className="lbl mb-2">Actual results per quarter (history sheets + official 2016 Q2 report)</div>
        <div className="overflow-x-auto">
          <table className="w-full mono text-[10.5px]">
            <thead>
              <tr className="text-[var(--dim)] text-left">
                <th className="py-1 pr-2 font-normal">METRIC</th>
                {HISTORY_ACTUALS.map(h => <th key={h.q} className="py-1 px-2 font-normal text-right">{h.q}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} className="border-t border-[var(--line)]">
                  <td className="py-1 pr-2 text-[var(--muted)]">{row.label}</td>
                  {HISTORY_ACTUALS.map(h => (
                    <td key={h.q} className={`py-1 px-2 text-right ${row.cls ? row.cls(h) : 'text-[var(--text)]'}`}>{row.get(h)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel p-3">
        <div className="lbl mb-2">Orders vs sold vs backlog (units, all products)</div>
        <div className="overflow-x-auto">
          <table className="w-full mono text-[10.5px]">
            <thead>
              <tr className="text-[var(--dim)] text-left">
                <th className="py-1 pr-2 font-normal">QTR</th>
                {MK.map(m => <th key={m} className="py-1 px-2 font-normal text-right" colSpan={1}>{m} ORD / SOLD / BL</th>)}
              </tr>
            </thead>
            <tbody>
              {HISTORY_ACTUALS.map(h => (
                <tr key={h.q} className="border-t border-[var(--line)]">
                  <td className="py-1 pr-2 text-[var(--muted)]">{h.q}</td>
                  {[0, 1, 2].map(i => (
                    <td key={i} className="py-1 px-2 text-right">
                      <span className="text-[var(--cyan)]">{h.orders[i]}</span>
                      <span className="text-[var(--dim)]"> / </span>
                      <span className="text-[var(--mint)]">{h.sold[i]}</span>
                      <span className="text-[var(--dim)]"> / </span>
                      <span className={h.backlog[i] > 0 ? 'text-[var(--amber)]' : 'text-[var(--dim)]'}>{h.backlog[i]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel p-3">
        <div className="lbl mb-2">Net profit by quarter</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" />
              <XAxis dataKey="q" tick={{ fill: 'var(--dim)', fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="var(--line)" />
              <YAxis tick={{ fill: 'var(--dim)', fontSize: 9, fontFamily: 'JetBrains Mono' }} stroke="var(--line)"
                tickFormatter={(v: number) => (v / 1e3).toFixed(0) + 'k'} width={34} />
              <Tooltip content={<TrendTooltip />} />
              <ReferenceLine y={0} stroke="var(--dim)" />
              <Bar dataKey="Net profit" radius={[2, 2, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d['Net profit'] >= 0 ? 'var(--mint)' : 'var(--red)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-[var(--dim)] mt-2 leading-snug">
          Story so far: startup losses in 2015 H1 while capacity was built (2 → 4 machines), profitable since 2015 Q3,
          cash-rich (≈€1.98M incl. €1.15M term deposit), but retained earnings still −€43,916 — so no dividend is legal yet.
          Machine efficiency is decaying 100% → 95.1% (maintenance matters), and investment performance has recovered
          from €3.65M to €4.32M. Your Q2 2016 plan starts from here.
          2015 Q2 cash of €1,852,457 is the official cash-flow "Cash balance" incl. the €1.9M term deposit, net of a €47,543 bank overdraft.
        </p>
      </div>
    </div>
  );
}
