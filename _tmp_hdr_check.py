import csv
for enc in ('cp949','euc-kr','utf-8-sig','utf-8'):
    try:
        with open('ĳ���� ��.csv','r',encoding=enc, newline='') as f:
            r=csv.reader(f)
            header=next(r,[])
            print('enc',enc, header[:8])
    except Exception as e:
        print('enc',enc,'ERROR',e)
