import csv
from pathlib import Path

files = list(Path('.').glob('*.csv'))
print('CSV files:', [str(p) for p in files])
for p in files:
    for enc in ('utf-8-sig','utf-8','cp949','euc-kr'):
        try:
            with open(p, 'r', encoding=enc, newline='') as f:
                r = csv.reader(f)
                header = next(r, [])
                print(p.name, 'encoding=', enc, 'header=', header[:10])
                break
        except Exception as e:
            continue
