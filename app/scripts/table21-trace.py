"""Independent Table 21 history trace; no forecast engine imports."""
import xlrd,pathlib,json
root=pathlib.Path(__file__).resolve().parents[1]/'public/audit';names=['HstY15Q1.Xls','HstY15Q2(1).Xls','HstY15Q3(1).Xls','HstY15Q4(1).Xls','HstY16Q1(3).Xls'];out=[]
for mode in ['multiplicative shift premium','additive wage-rate shift premium']:
 stock=[0]*3;val=[0]*3
 for name in names:
  w=xlrd.open_workbook(str(root/name));f=w.sheet_by_name('Financial statements');r=w.sheet_by_name('Resources and products');d=w.sheet_by_name('Your decisions');cols=[20,22,24]
  end=[sum(r.cell_value(rr,c)for rr in [30,31,32])for c in cols];made=[r.cell_value(6,c)-r.cell_value(7,c)for c in cols]
  rawunits=r.cell_value(34,6)+sum(r.cell_value(rr,6)for rr in [36,37,38]);mu=f.cell_value(16,17)/rawunits if rawunits else 0
  wage=d.cell_value(24,15);shift=int(d.cell_value(19,22));prem=[0,1/3,2/3][shift-1]
  mw=wage*(.65*(1+prem) if mode.startswith('multiplicative') else .65+prem)
  new=[1.1*([1,2,3][p]*mu*(1+d.cell_value(31,5+p*2)/100*.5)+mw*4*[1,1.25,2][p]+wage*d.cell_value(30,5+p*2)/60)for p in range(3)]
  launch=[bool(d.cell_value(28,5+p*2))for p in range(3)]
  for p in range(3):
   if launch[p]:stock[p]=0;val[p]=0
   avg=(val[p]+made[p]*new[p])/(stock[p]+made[p])if stock[p]+made[p] else 0
   val[p]=end[p]*avg
  expected=sum(val);actual=f.cell_value(14,17)
  out.append(dict(method=mode,file=name,units=end,unitStandard=new,rawUnit=mu,expectedFG=expected,actualFG=actual,difference=expected-actual,relativeDifference=(expected/actual-1)if actual else None));stock=end
(root/'re-audit-v2/table21-history-trace.json').write_text(json.dumps(out,indent=2))
for r in out:print(r['method'],r['file'],round(r['expectedFG'],2),r['actualFG'],round(r['difference'],2))
