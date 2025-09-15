import json
from collections import Counter

with open('_remote_data.json','r',encoding='utf-8') as f:
    data=json.load(f)

for key in ['characters','characterDetails','kibo','kiboDetails']:
    rows=data.get(key,[])
    print('==', key, 'rows:', len(rows))
    first_keys=[ next(iter(r.keys()), '') for r in rows[:10] if isinstance(r,dict) ]
    print('sample first keys:', first_keys)
    labels=[]
    for r in rows[:40]:
        if not isinstance(r,dict):
            continue
        fk=next(iter(r.keys()), '')
        labels.append(r.get(fk,''))
    cnt=Counter([str(x) for x in labels if x])
    print('top labels:', cnt.most_common(8))
print('done')

