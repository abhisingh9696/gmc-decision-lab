import type { QuarterReport } from '../engine/types';
import { fmtEUR } from './fields';

function Row({ label, value, bold, tone, indent }: {
  label: string; value: number; bold?: boolean; tone?: string; indent?: boolean;
}) {
  return (
    <div className={`flex justify-between py-[3px] ${bold ? 'border-t border-[var(--line)] mt-1 pt-1.5' : ''}`}>
      <span className={`text-[11px] ${indent ? 'pl-3' : ''} ${bold ? 'text-[var(--text)] font-semibold' : 'text-[var(--muted)]'}`}>{label}</span>
      <span className={`mono text-[11px] ${tone ?? (bold ? 'text-[var(--text)] font-semibold' : 'text-[var(--text)]')}`}>{fmtEUR(value)}</span>
    </div>
  );
}

function Block({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="panel" open={defaultOpen}>
      <summary className="px-3 py-2 mono text-[11px] font-semibold tracking-[.18em] uppercase text-[var(--cyan)] hover:bg-[var(--panel2)] rounded-md transition-colors">
        {title}
      </summary>
      <div className="px-3 pb-3 pt-1">{children}</div>
    </details>
  );
}

const money = (n: number) => n; // clarity alias

export function StatementsView({ r }: { r: QuarterReport }) {
  const { income, adminBreakdown, cashFlow, workingCapital, retained, balance } = r.details;
  const balAssets = balance.fixedAssets + balance.capitalWip + balance.inventories + balance.materialsValue + balance.wipComponents + balance.materialsOnOrder + balance.receivables + balance.cash + balance.deposit;
  const balLiabEq = balance.payables + balance.taxDue + balance.overdraft + balance.termLoan + balance.shareCapital + balance.sharePremium + balance.retainedEarnings;
  const balGap = balAssets - balLiabEq;

  return (
    <div className="space-y-2">
      <Block title={`Income statement — ${r.quarterLabel}`} defaultOpen>
        <Row label="Sales revenue" value={money(income.revenue)} />
        <Row label="Cost of sales" value={money(-income.cogs)} />
        <Row label="Gross profit" value={money(income.grossProfit)} bold />
        <Row label="Administrative expenses" value={money(-income.adminExpenses)} />
        <Row label="Depreciation" value={money(-income.depreciation)} />
        <Row label="Operating profit" value={money(income.operatingProfit)} bold
          tone={income.operatingProfit >= 0 ? 'text-[var(--mint)]' : 'text-[var(--red)]'} />
        <Row label="Interest received" value={money(income.interestReceived)} indent />
        <Row label="Interest paid" value={money(-income.interestPaid)} indent />
        <Row label="Profit before tax" value={money(income.pbt)} bold />
        <Row label="Tax assessed (annual, at Q4)" value={money(-income.taxAssessed)} />
        <Row label="Net profit" value={money(income.netProfit)} bold
          tone={income.netProfit >= 0 ? 'text-[var(--mint)]' : 'text-[var(--red)]'} />
      </Block>

      <Block title="Production payroll & costs">
        <p className="text-xs text-[var(--muted)] mb-2">{r.details.productionCosts.machinists} machinists · {r.details.productionCosts.recruited} recruited · {r.details.productionCosts.dismissed} dismissed. Physical machine hours: {r.details.productionCosts.physicalMachineHours.toFixed(1)}. Hours per productive machinist: {r.details.productionCosts.machinistHoursPerPerson.toFixed(1)}.</p>
        <Row label="Machinist payroll (360h minimum + overtime)" value={r.details.productionCosts.machinistWages}/>
        <Row label="Assembly time wages" value={r.details.productionCosts.assemblyTimeWages}/>
        <Row label="Skilled/unskilled parity payment" value={r.details.productionCosts.parityPayment}/>
        <Row label="Total assembly payroll" value={r.details.productionCosts.assemblyWages} bold/>
        <Row label="Physical machine running cost" value={r.details.productionCosts.runningCosts}/>
        <Row label="Gross-unit inspection" value={r.details.productionCosts.inspection}/>
        <Row label="Hired transport (in cost of sales)" value={r.details.productionCosts.transport}/>
        <p className="text-[10px] text-[var(--amber)] mt-2">Parity assumes equal worked weeks in a full quarter. Random absence, operator departures and breakdown pay are not forecast. Review actual management-report payroll after Q2.</p>
      </Block>
      <Block title="Admin expense breakdown">
        {adminBreakdown.map(x => <Row key={x.label} label={x.label} value={money(x.value)} />)}
        <Row label="Total administrative expenses" value={money(income.adminExpenses)} bold />
      </Block>

      <Block title="Cash-flow statement">
        <Row label="Opening cash" value={money(cashFlow.openingCash)} bold />
        <Row label="Trading receipts (collected)" value={money(cashFlow.collected)} indent />
        <Row label="Interest received" value={money(cashFlow.interestReceived)} indent />
        <Row label="Term loan drawn" value={money(cashFlow.loanDrawn)} indent />
        <Row label="Share issue / (repurchase)" value={money(cashFlow.shareCash)} indent />
        <Row label="Obsolete stock liquidation" value={money(cashFlow.obsoleteProceeds)} indent />
        <Row label="Rejected products sold as scrap" value={cashFlow.scrapProceeds} indent />
        <Row label="Asset sale proceeds (gross)" value={money(cashFlow.assetProceeds)} indent />
        <Row label="Suppliers & admin paid (incl. decommissioning)" value={money(-cashFlow.paidSuppliersAdmin)} indent />
        <Row label="Production payroll & running costs" value={money(-cashFlow.paidProduction)} indent />
        <Row label="Materials paid" value={money(-cashFlow.paidMaterials)} indent />
        <Row label="Subcontract components paid (50% + prior 50%)" value={money(-cashFlow.subcontractPaid)} indent />
        <Row label="Dividend paid" value={money(-cashFlow.dividendPaid)} indent />
        <Row label="Capex (machines + extension)" value={money(-cashFlow.capex)} indent />
        <Row label="Tax paid (prior Q4 assessment, in Q2)" value={money(-cashFlow.taxPaid)} indent />
        <Row label="Interest paid (loans + overdraft)" value={money(-cashFlow.interestPaid)} indent />
        <Row label="Term deposit placed / (withdrawn)" value={money(-cashFlow.depositChange)} indent />
        <Row label="Closing cash" value={money(cashFlow.closingCash)} bold
          tone={cashFlow.closingCash > 0 ? 'text-[var(--mint)]' : 'text-[var(--red)]'} />
        {cashFlow.overdraftEnd > 0 && <Row label="Overdraft at end" value={money(-cashFlow.overdraftEnd)} tone="text-[var(--red)]" />}
      </Block>

      <Block title="Retained-earnings bridge">
        <Row label="Opening retained earnings" value={money(retained.opening)} />
        <Row label="+ Net profit this quarter" value={money(retained.netProfit)} />
        <Row label="− Dividend paid" value={money(-retained.dividendPaid)} />
        <Row label="− Buyback premium charged to reserves" value={-retained.repurchaseCharge} />
        <Row label="Closing retained earnings" value={money(retained.closing)} bold
          tone={retained.closing >= 0 ? 'text-[var(--mint)]' : 'text-[var(--red)]'} />
        <p className="text-[10px] text-[var(--dim)] mt-1.5 leading-snug">
          Dividends are legally capped by the OPENING balance — profit is not distributable until the quarter after it is earned.
        </p>
      </Block>

      <Block title="Working capital & inventory">
        <Row label="Receivables opening → closing" value={money(workingCapital.receivablesOpen)} />
        <Row label="Receivables closing" value={money(workingCapital.receivablesEnd)} indent />
        <Row label="Payables opening" value={money(workingCapital.payablesOpen)} />
        <Row label="Payables closing" value={money(workingCapital.payablesEnd)} indent />
        <Row label="Finished-goods inventory (value)" value={money(workingCapital.closingInvValue)} />
        <div className="flex justify-between py-[3px]">
          <span className="text-[11px] text-[var(--muted)]">Materials stock</span>
          <span className="mono text-[11px] text-[var(--text)]">{workingCapital.materialsStock.toLocaleString()} units</span>
        </div>
        <Row label="Materials value (Table 21 basis)" value={money(balance.materialsValue)} indent />
        <p className="text-[10px] text-[var(--dim)] mt-1.5 leading-snug">
          Materials are valued at 90% of the lowest quoted spot/3m/6m price (manual Table 21); finished goods use a 110% standard-content interpretation with weighted carry-forward. The historical trace is close but not exact; source product-level opening values remain estimated. Materials on order use the same 90% lowest-quote basis.
        </p>
      </Block>

      <Block title="Balance sheet">
        <Row label="Fixed assets (land, buildings, machines)" value={money(balance.fixedAssets)} />
        <Row label="Capital work in progress (paid, arriving)" value={money(balance.capitalWip)} />
        <Row label="Finished-goods inventories" value={money(balance.inventories)} />
        <Row label="Materials inventory (value)" value={money(balance.materialsValue)} />
        <Row label="Component WIP (subcontracted, at cost)" value={money(balance.wipComponents)} />
        <Row label="Materials & components on order" value={money(balance.materialsOnOrder)} />
        <Row label="Trade receivables" value={money(balance.receivables)} />
        <Row label="Cash" value={money(balance.cash)} />
        <Row label="Term deposit" value={money(balance.deposit)} />
        <Row label="Total assets" value={money(balAssets)} bold />
        <Row label="Trade payables" value={money(-balance.payables)} />
        <Row label="Tax due (payable next Q2)" value={money(-balance.taxDue)} />
        <Row label="Bank overdraft" value={money(-balance.overdraft)} />
        <Row label="Term loan" value={money(-balance.termLoan)} />
        <Row label="Share capital" value={money(-balance.shareCapital)} />
        <Row label="Share premium" value={money(-balance.sharePremium)} />
        <Row label="Retained earnings" value={money(-balance.retainedEarnings)} />
        <Row label="Balance check (assets − liab. − equity)" value={money(balGap)}
          tone={Math.abs(balGap) <= 2 ? 'text-[var(--mint)]' : 'text-[var(--red)]'} />
        <p className="text-[10px] text-[var(--dim)] mt-1.5 leading-snug">
          Fully articulated model: every income, cash and inventory movement is double-counted consistently, so the check ties to €0 (±€2 whole-euro rounding tolerance). The official report remains authoritative for actual values.
        </p>
      </Block>
    </div>
  );
}
