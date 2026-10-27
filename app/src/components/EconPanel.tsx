import { Fragment, useState } from 'react';
import type { EconAssumptions, Mat3x3 } from '../engine/types';
import { NumField, Section, MK, PD } from './fields';

export function EconPanel({ econ, onChange }: { econ: EconAssumptions; onChange: (e: EconAssumptions) => void }) {
  const [adjustment,setAdjustment]=useState('');
  const safe=(key:'exchangeRate'|'baseRate'|'growth',value:number,min:number,max:number)=>{
    const effective=Math.min(max,Math.max(min,Number.isFinite(value)?value:min));
    setAdjustment(value!==effective?`${key}: requested ${value}; using ${effective}. Model numerical range ${min}–${max}.`:'');
    onChange({...econ,[key]:effective});
  };
  const setComp = (m: number, p: number, v: number) => {
    const effective=Math.min(999,Math.max(1,Number.isFinite(v)?v:1));
    setAdjustment(v!==effective?`Competitor price: requested ${v}; using ${effective}. Range €1–€999.`:'');
    const cp = econ.compPrices.map((row, mm) => mm === m ? row.map((x, pp) => pp === p ? effective : x) : row) as Mat3x3;
    onChange({ ...econ, compPrices: cp });
  };
  return (
    <Section title="Market assumptions" hint="competitors">
      <div className="grid grid-cols-3 gap-1 mb-2">
        <NumField label="€ per $ rate" value={econ.exchangeRate} step={0.01} min={0.01} max={10} onChange={v => safe('exchangeRate',v,.01,10)} />
        <NumField label="Base rate %" value={econ.baseRate} step={0.25} min={0} max={100} onChange={v => safe('baseRate',v,0,100)} />
        <NumField label="Growth ×" value={econ.growth} step={0.005} min={0.01} max={5} onChange={v => safe('growth',v,.01,5)} />
      </div>
      <div className="text-[10px] text-[var(--dim)] mb-1 mono">SEASONALITY ×{econ.seasonality.toFixed(2)} (auto)</div>
      <div className="lbl mb-1">Competitor avg prices €</div>
      <div className="grid grid-cols-[52px_1fr_1fr_1fr] gap-1 items-center">
        <span />{PD.map(c => <span key={c} className="lbl text-center">{c}</span>)}
        {MK.map((rl, m) => (
          <Fragment key={rl}>
            <span key={rl + m} className="lbl">{rl}</span>
            {PD.map((_, p) => (
              <NumField key={p} value={econ.compPrices[m][p]} step={5} name={`Competitor avg price ${rl} ${PD[p]}`} onChange={v => setComp(m, p, v)} />
            ))}
          </Fragment>
        ))}
      </div>
      {adjustment&&<p role="status" className="text-[10px] text-[var(--amber)] mt-2">{adjustment}</p>}
      <p className="text-[10px] text-[var(--dim)] mt-1.5">Edit these to test rival price moves. Positive numerical guards keep temporary empty/zero inputs from crashing the model; these are model ranges, not forecasts.</p>
    </Section>
  );
}
