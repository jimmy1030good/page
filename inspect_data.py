import json
from collections import Counter

with open('data.json','r',encoding='utf-8') as f:
    raw=json.load(f)

def pivot_to_map(rows, key_header):
    m={}
    for row in rows:
        field=row.get(key_header)
        if not field:
            continue
        for k,v in row.items():
            if k==key_header or not v:
                continue
            m.setdefault(k,{})[field]=v
    return m

char_rows = raw.get('characters', [])
char_detail_rows = raw.get('characterDetails', [])
cd_map = pivot_to_map(char_detail_rows, '캐릭터명')

characters=[{
    'name': r.get('캐릭터 이름',''),
    'attribute': r.get('속성') or cd_map.get(r.get('캐릭터 이름',''),{}).get('속성',''),
    'race': cd_map.get(r.get('캐릭터 이름',''),{}).get('종족',''),
    'releaseChannel': cd_map.get(r.get('캐릭터 이름',''),{}).get('공개채널','')
} for r in char_rows if r.get('캐릭터 이름')]

print('characters count:', len(characters))
print('first 5:', characters[:5])
print('attr counts:', Counter([c['attribute'] for c in characters]))

