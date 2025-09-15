from convert_csv_to_json import try_read_header
from pathlib import Path
for p in Path('.').glob('*.csv'):
    header, enc = try_read_header(p)
    print(p.name, enc, header[:6])
