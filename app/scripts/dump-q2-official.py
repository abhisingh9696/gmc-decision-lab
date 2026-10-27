"""Dump every populated cell of the official 2016 Q2 report W132162.xls, grouped by sheet."""
import xlrd, json, sys
p = r"C:\Users\bittu\AppData\Local\hermes\attachments\W132162.xls"
w = xlrd.open_workbook(p)
print('sheets:', w.sheet_names())
for s in w.sheets():
    if s.name == 'W':
        continue
    print(f"\n===== {s.name} ({s.nrows}x{s.ncols}) =====")
    for r in range(s.nrows):
        cells = []
        for c in range(s.ncols):
            v = s.cell_value(r, c)
            if v == '':
                continue
            a = xlrd.formula.colname(c) + str(r + 1)
            if isinstance(v, float) and v == int(v):
                v = int(v)
            cells.append(f"{a}={v}")
        if cells:
            print('  ' + ' | '.join(cells))
