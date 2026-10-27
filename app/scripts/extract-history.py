"""Read the five supplied XLS files without altering any stored cell value."""
import pathlib,json,xlrd,csv,hashlib,shutil
ROOT=pathlib.Path(__file__).resolve().parents[1]; UP=ROOT/'public/audit'; OUT=ROOT/'public/audit';OUT.mkdir(exist_ok=True,parents=True)
FILES=['HstY15Q1.Xls','HstY15Q2(1).Xls','HstY15Q3(1).Xls','HstY15Q4(1).Xls','HstY16Q1(3).Xls']
records=[];summaries=[];hist=[];maps=[];workbooks=[]
def read(w,s,a):
 import re
 m=re.fullmatch(r'([A-Z]+)(\d+)',a); col=0
 for x in m[1]:col=col*26+ord(x)-64
 return w.sheet_by_name(s).cell_value(int(m[2])-1,col-1)
def mapped(w,fn,s,a,target,transform=None):
 raw=read(w,s,a); val=transform(raw) if transform else raw
 maps.append(dict(file=fn,sheet=s,cell=a,target=target,raw=raw,value=val,conversion='none' if transform is None else 'explicit normalization'))
 return val
for i,fn in enumerate(FILES):
 w=xlrd.open_workbook(str(UP/fn));workbooks.append(w); year=2015 if i<4 else 2016;q=i+1 if i<4 else 1
 fs='Financial statements'; rp='Resources and products'; gi='Group information';yd='Your decisions';get=lambda s,a:read(w,s,a)
 h={'q':f'{year} Q{q}'}
 for k,a in dict(revenue='L8',cogs='L19',opProfit='L24',admin='F24',pbt='L27',tax='L28',netProfit='L29',retained='L35',cash='R19',dividends='L32').items(): h[k]=mapped(w,fn,fs,a,'history.'+k)
 h.update(sharePrice=mapped(w,fn,gi,'G35','history.sharePrice',lambda x:x/100),invPerf=mapped(w,fn,gi,'G39','history.invPerf'),machines=mapped(w,fn,rp,'G21','history.machines'),eff=mapped(w,fn,rp,'G27','history.eff',float),visits=mapped(w,fn,rp,'G43','history.visits'))
 for k,rows in [('orders',[17,18,19]),('sold',[22,23,24]),('backlog',[27,28])]:
  h[k]=[sum(mapped(w,fn,rp,f'{c}{r}',f'history.{k}[{m}]') for c in ['U','W','Y']) for m,r in enumerate(rows)]
  if k=='backlog':h[k].append(0) # internet orders are lost, not backlogged
 hist.append(h)
for fn,w in zip(FILES,workbooks):
 counts={};sheets=[]
 for s in w.sheets():
  n=0
  for r in range(s.nrows):
   for c in range(s.ncols):
    v=s.cell_value(r,c)
    if v=='':continue
    a=f'{xlrd.formula.colname(c)}{r+1}'
    if s.name=='W':cat='raw-helper-retained'
    elif isinstance(v,str):cat='label-or-context' if v.strip() else 'formatting-placeholder'
    else:cat='historical-observation-retained'
    records.append(dict(file=fn,sheet=s.name,cell=a,type=s.cell_type(r,c),value=v,category=cat));n+=1
  sheets.append(dict(name=s.name,rows=s.nrows,columns=s.ncols,populated=n))
 summaries.append(dict(file=fn,sha256=hashlib.sha256((UP/fn).read_bytes()).hexdigest(),sheets=sheets))
 if (UP/fn).resolve()!=(OUT/fn).resolve():shutil.copyfile(UP/fn,OUT/fn)
w=workbooks[-1]; fn=FILES[-1];M=lambda s,a,t,f=None:mapped(w,fn,s,a,t,f)
opening={}
for k,a in dict(machineValue='R11',buildingValue='R10',materialsValue='R17',finishedGoodsValue='R15',receivables='R18',payables='R25',taxDue='R24',termLoanAmt='R28',shareCapital='R33',sharePremium='R34',retainedEarnings='R35',termDepositAmt='X32',borrowingPower='X35',overdraftLimit='X34',overdraft='R26').items():opening[k]=M(fs,a,'opening.'+k)
opening['cash']=M(fs,'R19','opening.totalCash')-opening['termDepositAmt']
opening['taxableCarryforward']=M(fs,'F29','opening.taxableCarryforward')
for k,a in dict(machines='G21',machineEfficiency='G27',assemblyWorkers='N12',machinists='O12',factoryArea='G10',landUnused='G9',materialsStock='G35',agentsEU='M30',distNafta='N30',distNet='O30',ports='G42').items(): opening[k]=M(rp,a,'opening.'+k,float)
opening['sharePrice']=M(gi,'G35','opening.sharePrice',lambda x:x/100)
opening['priorWage']=M(yd,'P25','opening.priorWage',lambda x:round(x*100))
for k,rows in [('productStocks',[31,32,33]),('backlog',[27,28])]:
 opening[k]=[[M(rp,f'{c}{r}',f'opening.{k}[{m}][{p}]') for p,c in enumerate(['U','W','Y'])] for m,r in enumerate(rows)]
 if k=='backlog':opening[k].append([0,0,0])
opening['componentWipUnits']=[M(rp,c+'44','opening.componentWipUnits') for c in ['U','W','Y']]
# 75 official decision fields, with source units normalized once.
d={}
for k,rows,cols in [('advProd',[14,15,16],['F','H','J']),('prices',[19,20,21],['F','H','J']),('deliveries',[24,25,26],['F','H','J'])]:d[k]=[[M(yd,f'{c}{r}',f'decisions.{k}[{m}][{p}]') for p,c in enumerate(cols)] for m,r in enumerate(rows)]
d['advCorp']=[M(yd,f'E{r}',f'decisions.advCorp[{m}]') for m,r in enumerate([14,15,16])]
for k,r in dict(takeImprovement=29,rd=30,assemblyTimes=31,premium=32,subcontract=35).items():d[k]=[M(yd,f'{c}{r}',f'decisions.{k}[{p}]',bool if k=='takeImprovement' else None) for p,c in enumerate(['F','H','J'])]
for k,r in [('agentsEU',14),('distNafta',15),('distNet',16)]:d[k]={j:M(yd,f'{c}{r}',f'decisions.{k}.{j}') for j,c in dict(want='P',support='T',commission='W').items() if not(k=='distNet' and j=='want')}
for k,a in dict(matSpot='P19',matM3='T19',matM6='W19',maintenance='P20',shift='W20',ports='P21',webDev='W21',hire='P24',train='W24',wage='P25',mgmtBudget='P26',trainingDays='W26',shares='P29',dividend='W29',termLoan='P30',termDeposit='W30',machinesBuy='P31',machinesSell='W31',factoryExt='P32',insurance='W32',infoMarket='P35',infoCompetitors='W35').items():d[k]=M(yd,a,'decisions.'+k,(lambda x:round(x*100)) if k=='wage' else bool if k.startswith('info') else None)
context={}
for k,a in dict(exchangeRate='L10',baseRate='G10',buildingCostPerSqm='G13',matPriceSpotUSD='G20',matPrice3mUSD='H20',matPrice6mUSD='I20').items():context[k]=M(gi,a,'parameters.'+k)
context['quoteMin']=[M(gi,c+'16','parameters.subcontractQuoteRef.min') for c in ['G','H','I']];context['quoteMax']=[M(gi,c+'17','parameters.subcontractQuoteRef.max') for c in ['G','H','I']]
context['preciseRatings']=[float(read(w,'W','A'+str(r))) for r in [105,106,107]]
context['referenceOrders']=[[M(rp,f'{c}{r}',f'parameters.referenceOrders[{m}][{p}]') for p,c in enumerate(['U','W','Y'])]for m,r in enumerate([17,18,19])]
context['europeJourneyKm']=M(rp,'M36','parameters.europeJourneyKm')
context['businessReport']=' '.join(str(read(w,gi,a)).strip() for a in ['F23','F24'])
context['gdp']=[read(w,gi,c+'5') for c in ['G','H','I']];context['unemployment']=[read(w,gi,c+'6') for c in ['G','H']]
lookup={}
for m in maps:lookup.setdefault((m['file'],m['sheet'],m['cell']),[]).append(m['target'])
for r in records:
 ts=lookup.get((r['file'],r['sheet'],r['cell']),[])
 if ts:r.update(category='mapped-runtime-or-history',targets=ts)
counts={}
for r in records:counts[r['category']]=counts.get(r['category'],0)+1
payload=dict(files=summaries,history=hist,opening=opening,sourceDecisions=d,context=context,mappings=maps,counts=counts,populatedCells=len(records),coverageMeaning='Mapped cells feed the runtime starting state, actual history, decisions or parameters. Other cells are preserved, not silently treated as forecast drivers. W is an undocumented duplicate/helper stream; precise ratings are retained as context, not substituted for rounded public star ratings.')
(OUT/'source-summary.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False))
(OUT/'source-cells.json').write_text(json.dumps(records,ensure_ascii=False))
with (OUT/'source-cells.csv').open('w',newline='',encoding='utf-8-sig') as f:
 writer=csv.writer(f);writer.writerow(['file','sheet','cell','type','exact value','category','targets'])
 for r in records:writer.writerow([r['file'],r['sheet'],r['cell'],r['type'],repr(r['value']) if not isinstance(r['value'],str) else r['value'],r['category'],'; '.join(r.get('targets',[]))])
(ROOT/'src/engine/source-data.ts').write_text('// Generated by scripts/extract-history.py from uploaded XLS; do not hand-edit.\nexport const SOURCE = '+json.dumps(payload,ensure_ascii=False)+';\n')
assert len(records)==sum(s['populated'] for f in summaries for s in f['sheets'])
# Re-open every stored cell from every sheet and compare its type and exact value.
byfile={fn:w for fn,w in zip(FILES,workbooks)}
for r in json.loads((OUT/'source-cells.json').read_text()):assert read(byfile[r['file']],r['sheet'],r['cell'])==r['value']
print(json.dumps(dict(files=len(FILES),sheets=sum(len(f['sheets']) for f in summaries),cells=len(records),mapped=len(lookup),categories=counts),indent=2))
