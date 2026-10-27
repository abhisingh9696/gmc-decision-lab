"""Diff our engine's Q3 opening state against the official Q2 report (W132162.xls)."""
import json, re

# Official Q2 values (verified from the dump of W132162.xls)
off = {
    'cash+bdeposit (X31)': 2201507,
    'bank (X31-X32)': 1051507,
    'deposit (X32)': 1150000,
    'productInventories value (R15)': 131971,
    'materialsInventory value (R17)': 79783,
    'receivables (R18)': 503393,
    'payables (R25)': 242181,
    'netAssets (R30)': 4018573,
    'retained (R35)': 18573,
    'machines next qtr (G21)': 4,
    'machineEff (G27)': 93.3,
    'assemblyWorkers next (N12)': 19,
    'machinists next (O12)': 24,
    'materialsStock closing (G35)': 332,
    'materials arriving Q3 (G37)': 1000,
    'ports (G42)': 5,
    'agentsEU (M30)': 3, 'distNafta (N30)': 1, 'distNet (O30)': 1,
    'warehouse EU P1/P2/P3 (U31/W31/Y31)': [198, 132, 112],
    'warehouse NAFTA (U32/W32/Y32)': [50, 39, 33],
    'warehouse NET (U33/W33/Y33)': [0, 0, 0],
}
o = json.load(open('src/engine/q3-opening.json'))
print('== engine opening ==')
for k in sorted(o): print(f'{k}: {json.dumps(o[k])[:110]}')

print('\n== DIFFS vs official Q2 ==')
def chk(name, engine_v, off_v):
    ok = (engine_v == off_v) if not isinstance(off_v, list) else (list(engine_v) == off_v)
    print(('OK  ' if ok else 'DIFF') + f' {name}: engine={engine_v} official={off_v}')

chk('cash (bank excl deposit)', o['cash'], 1051507)
chk('deposit', o.get('termDepositAmt'), 1150000)
chk('finished goods value', o.get('finishedGoodsValue'), 131971)
chk('materials value', o.get('materialsValue'), 79783)
chk('receivables', o.get('receivables'), 503393)
chk('payables', o.get('payables'), 242181)
chk('retained', o.get('retainedEarnings'), 18573)
chk('machines', o.get('machines'), 4)
chk('machineEff', o.get('machineEfficiency'), 93.3)
chk('assemblyWorkers', o.get('assemblyWorkers'), 19)
chk('machinists', o.get('machinists'), 24)
chk('materialsStock', o.get('materialsStock'), 332 + 1000)  # closing + arriving in Q3
chk('ports', o.get('ports'), 5)
print('productStocks (engine [m][p]):', json.dumps(o.get('productStocks')))
print('official [EU,NAFTA,NET][P1,P2,P3]: [[198,132,112],[50,39,33],[0,0,0]]')
tot = sum(sum(r) for r in o.get('productStocks', []))
print('engine total FG units:', tot, ' official total: 564')
print('backlog (engine):', json.dumps(o.get('backlog')), ' (EU P1 5, P3 6? official Q2: 0/0/0 all)')
