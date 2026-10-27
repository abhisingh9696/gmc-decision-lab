import { Fragment } from 'react';
import type { Decisions, Mat3x3 } from '../engine/types';
import { P } from '../engine/params';
import { NumField, CheckField, Section, MK, PD, EffBadge } from './fields';

type SetD = (fn: (d: Decisions) => Decisions) => void;

// Table 11/12 — container fill efficiency per market: how much of the last
// container in each market is actually used (part-loads still cost full price).
function ContainerFill({ deliveries }: { deliveries: Mat3x3 }) {
  const caps = P.containerCap;
  return (
    <div className="flex gap-2 mt-1.5">
      {MK.map((mk, m) => {
        const cells = [0, 1, 2].map(p => Math.max(0, deliveries[m][p]) / caps[p]);
        const loads = Math.ceil(cells[0] + cells[1] + cells[2]);
        const total = cells[0] + cells[1] + cells[2];
        const fill = loads > 0 ? total / loads : 1;
        const pct = Math.round(fill * 100);
        const tone = loads === 0 ? 'text-[var(--dim)]' : pct >= 90 ? 'text-[var(--mint)]' : pct >= 70 ? 'text-[var(--amber)]' : 'text-[var(--red)]';
        return (
          <span key={mk} className={`mono text-[9px] ${tone}`}
            title={`${mk}: ${loads} container(s), ${pct}% average fill — part-filled containers still cost the full trip`}>
            {mk} {loads} ctr · {loads === 0 ? '—' : `${pct}% fill`}
          </span>
        );
      })}
    </div>
  );
}

function Grid33({ values, onChange, rowLabels, colLabels, step = 1, name }: {
  values: Mat3x3; onChange: (m: Mat3x3) => void; rowLabels: string[]; colLabels: string[]; step?: number; name: string;
}) {
  return (
    <div className="grid grid-cols-[52px_1fr_1fr_1fr] gap-1 items-center">
      <span />{colLabels.map(c => <span key={c} className="lbl text-center">{c}</span>)}
      {rowLabels.map((rl, m) => (
        <Fragment key={rl}>
          <span key={rl + m} className="lbl">{rl}</span>
          {colLabels.map((c, p) => (
            <NumField key={c + p} value={values[m][p]} step={step} name={`${name} ${rl} ${c}`}
              onChange={v => onChange(values.map((row, mm) => mm === m ? row.map((x, pp) => pp === p ? v : x) : row) as Mat3x3)} />
          ))}
        </Fragment>
      ))}
    </div>
  );
}

function Vec3Fields({ values, onChange, labels, step = 1, suffix, name }: {
  values: [number, number, number]; onChange: (v: [number, number, number]) => void; labels: string[]; step?: number; suffix?: string; name?: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {labels.map((l, i) => (
        <NumField key={l} label={l} value={values[i]} step={step} suffix={suffix} name={name ? `${name} ${l}` : l}
          onChange={v => onChange(values.map((x, j) => j === i ? v : x) as [number, number, number])} />
      ))}
    </div>
  );
}

export function DecisionPanel({ d, setD, eff }: { d: Decisions; setD: SetD; eff?: Decisions }) {
  const set = <K extends keyof Decisions>(k: K, v: Decisions[K]) => setD(x => ({ ...x, [k]: v }));
  return (
    <div>
      <Section title="Advertising €'000" hint="corp + P1-P3" defaultOpen>
        <div className="lbl mb-1">Corporate image</div>
        <Vec3Fields name="Corporate advertising €'000" labels={MK} values={d.advCorp} onChange={v => set('advCorp', v)} />
        <div className="lbl mt-2 mb-1">Product advertising</div>
        <Grid33 name="Product advertising €'000" values={d.advProd} onChange={v => set('advProd', v)} rowLabels={MK} colLabels={PD} />
      </Section>

      <Section title="Prices €" defaultOpen>
        <Grid33 name="Price €" values={d.prices} onChange={v => set('prices', v)} rowLabels={MK} colLabels={PD} step={5} />
      </Section>

      <Section title="Make & ship units" defaultOpen>
        <Grid33 name="Make & ship units" values={d.deliveries} onChange={v => set('deliveries', v)} rowLabels={MK} colLabels={PD} step={25} />
        <ContainerFill deliveries={d.deliveries} />
        <p className="text-[10px] text-[var(--dim)] mt-1">Negative EU/NET value recalls stock.</p>
      </Section>

      <Section title="Quality & R&D">
        <div className="lbl mb-1">R&D €'000 per product</div>
        <Vec3Fields name="R&D €'000" labels={PD} values={d.rd} onChange={v => set('rd', v)} />
        <div className="lbl mt-2 mb-1">Assembly minutes</div>
        <Vec3Fields name="Assembly minutes" labels={PD} values={d.assemblyTimes} onChange={v => set('assemblyTimes', v)} step={5} />
        <div className="lbl mt-2 mb-1">Premium materials %</div>
        <Vec3Fields name="Premium materials %" labels={PD} values={d.premium} onChange={v => set('premium', v)} step={5} suffix="%" />
        <div className="lbl mt-2 mb-1">Take up major improvements</div>
        <div className="flex gap-4">
          {PD.map((l, i) => (
            <CheckField key={l} label={l} value={d.takeImprovement[i]}
              onChange={v => set('takeImprovement', d.takeImprovement.map((x, j) => j === i ? v : x) as [boolean, boolean, boolean])} />
          ))}
        </div>
        <p className="text-[10px] text-[var(--dim)] leading-snug mt-1">
          Timing: the star rating rises THIS quarter, but the order lift only applies from NEXT quarter (orders are already fixed by then). All opening finished stock of that product is liquidated as obsolete at valuation — take up improvements when stock is low, not before a big sales push.
        </p>
        <div className="lbl mt-2 mb-1">Subcontract components (units)</div>
        <Vec3Fields name="Subcontract components" labels={PD} values={d.subcontract} onChange={v => set('subcontract', v)} step={50} />
        <p className="text-[10px] text-[var(--dim)] leading-snug -mt-0.5">
          Machined components only — they arrive NEXT quarter as WIP and still need assembly labour. Consumed before your own machining; unused stay in WIP at cost. Paid 50% now / 50% next quarter (FX-locked, Table 24).
        </p>
      </Section>

      <Section title="Agents & distributors">
        <div className="grid grid-cols-3 gap-1 mb-2">
          <NumField label="EU agents wanted" name="EU agents wanted" value={d.agentsEU.want} min={0} onChange={v => set('agentsEU', { ...d.agentsEU, want: v })} />
          <NumField label="Support €'000" name="EU agent support €'000" value={d.agentsEU.support} onChange={v => set('agentsEU', { ...d.agentsEU, support: v })} />
          <NumField label="Comm %" name="EU agent commission %" value={d.agentsEU.commission} step={0.5} onChange={v => set('agentsEU', { ...d.agentsEU, commission: v })} />
        </div>
        <div className="grid grid-cols-3 gap-1 mb-2">
          <NumField label="Nafta dist wanted" name="Nafta distributors wanted" value={d.distNafta.want} min={0} onChange={v => set('distNafta', { ...d.distNafta, want: v })} />
          <NumField label="Support €'000" name="Nafta distributor support €'000" value={d.distNafta.support} onChange={v => set('distNafta', { ...d.distNafta, support: v })} />
          <NumField label="Comm %" name="Nafta distributor commission %" value={d.distNafta.commission} step={0.5} onChange={v => set('distNafta', { ...d.distNafta, commission: v })} />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <NumField label="Net dist support €'000" value={d.distNet.support} onChange={v => set('distNet', { ...d.distNet, support: v })} />
          <NumField label="Net comm %" value={d.distNet.commission} step={0.5} onChange={v => set('distNet', { ...d.distNet, commission: v })} />
        </div>
      </Section>

      <Section title="Operations">
        <div className="grid grid-cols-3 gap-1 mb-2">
          <NumField label="Materials spot '000" value={d.matSpot} min={0} onChange={v => set('matSpot', v)} />
          <NumField label="3-mth '000" value={d.matM3} min={0} onChange={v => set('matM3', v)} />
          <NumField label="6-mth '000" value={d.matM6} min={0} onChange={v => set('matM6', v)} />
        </div>
        <div className="grid grid-cols-3 gap-1 mb-2">
          <NumField label="Maint hrs/machine" value={d.maintenance} min={0} onChange={v => set('maintenance', v)} />
          <NumField label="Shift level 1-3" value={d.shift} min={1} max={3} onChange={v => set('shift', Math.round(v) as 1 | 2 | 3)}
            badge={<EffBadge eff={eff?.shift} req={d.shift} />} />
          <NumField label="Website ports" value={d.ports} min={0} onChange={v => set('ports', v)} />
        </div>
        <NumField label="Website dev €'000" value={d.webDev} min={0} onChange={v => set('webDev', v)} />
      </Section>

      <Section title="Personnel">
        <div className="grid grid-cols-2 gap-1 mb-2">
          <NumField label="Hire +/fire −" value={d.hire} onChange={v => set('hire', v)} />
          <NumField label="Train workers" value={d.train} min={0} max={9} onChange={v => set('train', v)}
            badge={<EffBadge eff={eff?.train} req={d.train} />} />
        </div>
        <div className="grid grid-cols-2 gap-1 mb-2">
          <NumField label="Wage cents/hr" value={d.wage} step={10} onChange={v => set('wage', v)}
            badge={<EffBadge eff={eff?.wage} req={d.wage} suffix="¢" />} />
          <NumField label="Training days" value={d.trainingDays} min={0} max={90} onChange={v => set('trainingDays', v)}
            badge={<EffBadge eff={eff?.trainingDays} req={d.trainingDays} />} />
        </div>
        <NumField label="Management budget €'000" value={d.mgmtBudget} min={0} onChange={v => set('mgmtBudget', v)}
          badge={<EffBadge eff={eff?.mgmtBudget} req={d.mgmtBudget} suffix="k" />} />
        <p className="text-[10px] text-[var(--dim)] leading-snug -mt-1">
          Cuts need 1 quarter's notice, max −10%/quarter (more.htm); rises apply immediately.
        </p>
      </Section>

      <Section title="Finance">
        <div className="grid grid-cols-2 gap-1 mb-2">
          <NumField label="Shares +/− '000" value={d.shares} onChange={v => set('shares', v)}
            badge={<EffBadge eff={eff?.shares} req={d.shares} suffix="k" />} />
          <NumField label="Dividend cents/share" value={d.dividend} min={0} step={0.5} onChange={v => set('dividend', v)}
            badge={<EffBadge eff={eff?.dividend} req={d.dividend} suffix="¢" />} />
        </div>
        <p className="text-[10px] text-[var(--dim)] leading-snug -mt-0.5 mb-2">
          Portal scale: 4,000,000 shares @ €1 nominal (shown there as 40,000 × €100 blocks). Dividend cents/share = % of nominal capital (5¢ = 5% = €200k). Share trades: max 10% of YEAR-START capital per year, cumulative across quarters (400 €'000 total for 2016).
        </p>
        <div className="grid grid-cols-2 gap-1 mb-2">
          <NumField label="Term loan €'000" value={d.termLoan} min={0} onChange={v => set('termLoan', v)}
            badge={<EffBadge eff={eff?.termLoan} req={d.termLoan} suffix="k" />} />
          <NumField label="Deposit +/− €'000" value={d.termDeposit} onChange={v => set('termDeposit', v)}
            badge={<EffBadge eff={eff?.termDeposit} req={d.termDeposit} suffix="k" />} />
        </div>
        <div className="grid grid-cols-3 gap-1 mb-2">
          <NumField label="Machines buy" value={d.machinesBuy} min={0} onChange={v => set('machinesBuy', v)}
            badge={<EffBadge eff={eff?.machinesBuy} req={d.machinesBuy} />} />
          <NumField label="Machines sell" value={d.machinesSell} min={0} onChange={v => set('machinesSell', v)} />
          <NumField label="Factory ext m²" value={d.factoryExt} min={0} step={50} onChange={v => set('factoryExt', v)}
            badge={<EffBadge eff={eff?.factoryExt} req={d.factoryExt} suffix="m²" />} />
        </div>
        <NumField label="Insurance plan 0-4" value={d.insurance} min={0}
          onChange={v => set('insurance', Math.min(4, Math.max(0, Math.round(v))) as 0 | 1 | 2 | 3 | 4)} />
      </Section>

      <Section title="Information">
        <div className="flex gap-6">
          <CheckField label="Market shares (€5k)" value={d.infoMarket} onChange={v => set('infoMarket', v)} />
          <CheckField label="Competitor activity (€7.5k)" value={d.infoCompetitors} onChange={v => set('infoCompetitors', v)} />
        </div>
      </Section>
    </div>
  );
}
