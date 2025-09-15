import csv
import json
from datetime import datetime
from pathlib import Path


def read_csv_rows(path: Path):
    with open(path, 'r', encoding='utf-8-sig', newline='') as f:
        r = csv.DictReader(f)
        rows = []
        for row in r:
            # Keep raw structure; trim whitespace but preserve empty cells
            cleaned = {
                (k.strip() if isinstance(k, str) else k): (v.strip() if isinstance(v, str) else v)
                for k, v in row.items()
            }
            rows.append(cleaned)
        return rows


def main():
    root = Path('.')
    # Expect filenames in Korean (as present in the repo)
    paths = {
        'characters': root / '캐릭터.csv',
        'characterDetails': root / '캐릭터 상세.csv',
        'kibo': root / '키보.csv',
        'kiboDetails': root / '키보 상세.csv',
    }
    missing = [str(p) for p in paths.values() if not p.exists()]
    if missing:
        raise FileNotFoundError('다음 CSV 파일을 찾을 수 없습니다: ' + ', '.join(missing))

    data = {
        'characters': read_csv_rows(paths['characters']),
        'characterDetails': read_csv_rows(paths['characterDetails']),
        'kibo': read_csv_rows(paths['kibo']),
        'kiboDetails': read_csv_rows(paths['kiboDetails']),
        'metadata': {
            'lastUpdated': datetime.now().strftime('%Y-%m-%d')
        }
    }

    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('data.json 생성 완료')


if __name__ == '__main__':
    main()

