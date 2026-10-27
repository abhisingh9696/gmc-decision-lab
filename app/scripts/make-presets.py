import pathlib,json
root=pathlib.Path(__file__).resolve().parents[1];src=root/'tests/fixtures/ui-plans'
x=json.loads((src/'Buffered_candidate_All_Quarters.json').read_text())
plans={}
for name,filename in [('BUF exact saved','Buffered_candidate_All_Quarters.json'),('C8 saved zero later hires','C8_recipe_All_Quarters.json'),('A45 saved zero hires','Aggressive_candidate_All_Quarters.json')]:
 x=json.loads((src/filename).read_text());out=[]
 for q in x['plan']:
  vs=[float(v['value']) for v in q['decisions']];d={};pos=0
  for k,size in [('advCorp',3),('advProd',9),('prices',9),('deliveries',9),('rd',3),('assemblyTimes',3),('premium',3),('subcontract',3)]:
   a=vs[pos:pos+size];pos+=size;d[k]=[a[i:i+3]for i in range(0,9,3)]if size==9 else a
  for k,parts in [('agentsEU',['want','support','commission']),('distNafta',['want','support','commission']),('distNet',['support','commission'])]:d[k]=dict(zip(parts,vs[pos:pos+len(parts)]));pos+=len(parts)
  for k in ['matSpot','matM3','matM6','maintenance','shift','ports','webDev','hire','train','wage','trainingDays','mgmtBudget','shares','dividend','termLoan','termDeposit','machinesBuy','machinesSell','factoryExt','insurance']:d[k]=vs[pos];pos+=1
  assert pos==70
  sw=[v['checked']=='true'for v in q['switches']];d.update(takeImprovement=sw[:3],infoMarket=sw[3],infoCompetitors=sw[4]);out.append(d)
 plans[name]=out
(root/'src/engine/saved-plans.ts').write_text('// Exact saved UI plans, including each quarter\'s hiring and financing.\nexport const SAVED_PLANS = '+json.dumps(plans)+';\n')
