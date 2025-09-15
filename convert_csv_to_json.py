import csv
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Tuple


PREFERRED_ENCODINGS = (
    'cp949',           # Most likely for these CSVs
    'euc-kr',
    'utf-8-sig',
    'utf-8',
)


def try_read_header(path: Path) -> Tuple[List[str], str]:
    """Read only the header row with best-effort encoding detection.

    Picks the encoding with the highest Hangul score to avoid mojibake.
    Returns: (header_list, used_encoding)
    Raises: IOError if none of the encodings work.
    """
    best: Tuple[int, List[str], str] | None = None  # (score, header, enc)
    last_err = None
    for enc in PREFERRED_ENCODINGS:
        try:
            with open(path, 'r', encoding=enc, newline='') as f:
                r = csv.reader(f)
                header = next(r, [])
                text = ' '.join(header)
                # Score: count Hangul syllables
                score = sum(1 for ch in text if '\uAC00' <= ch <= '\uD7A3')
                if best is None or score > best[0]:
                    best = (score, header, enc)
        except Exception as e:
            last_err = e
            continue
    if best is not None:
        return best[1], best[2]
    raise IOError(f"Failed to read header of {path} with known encodings: {last_err}")


def read_csv_rows(path: Path, encoding: str) -> List[Dict[str, str]]:
    with open(path, 'r', encoding=encoding, newline='') as f:
        r = csv.DictReader(f)
        rows: List[Dict[str, str]] = []
        for row in r:
            cleaned = {
                (k.strip() if isinstance(k, str) else k): (v.strip() if isinstance(v, str) else v)
                for k, v in row.items()
            }
            rows.append(cleaned)
        return rows


def classify_csv(path: Path, header: List[str]) -> str:
    """Classify CSV by header heuristics into one of:
    'characters', 'characterDetails', 'kibo', 'kiboDetails', or '' if unknown.
    """
    header0 = (header[0] if header else '')
    joined = ' '.join(header)

    # Heuristics based on known structures/keywords
    has_hash = any(h.strip() == '#' for h in header)
    has_kibo_kw = any('키보' in h or 'KIBO' in h.upper() for h in header)
    has_char_kw = any('캐릭' in h for h in header)

    # Block/pivot style details: first column indicates field names
    if not has_hash and (('캐릭' in header0) or ('키보' in header0)):
        return 'kiboDetails' if has_kibo_kw and not has_char_kw else (
            'characterDetails' if has_char_kw else '')

    # List style with # column
    if has_hash:
        if has_kibo_kw and not has_char_kw:
            return 'kibo'
        if has_char_kw:
            return 'characters'

    # Fallbacks with mojibake (very rough)
    if 'Ű��' in joined and has_hash:
        return 'kibo'
    if 'ĳ����' in joined and has_hash:
        return 'characters'
    if 'Ű��' in header0 and not has_hash:
        return 'kiboDetails'
    if 'ĳ����' in header0 and not has_hash:
        return 'characterDetails'

    return ''


def main():
    root = Path('.')
    csv_files = sorted(p for p in root.glob('*.csv'))
    if not csv_files:
        raise FileNotFoundError('CSV 파일을 찾을 수 없습니다 (*.csv).')

    buckets: Dict[str, Tuple[Path, str]] = {}

    for p in csv_files:
        header, enc = try_read_header(p)
        kind = classify_csv(p, header)
        if not kind:
            continue
        buckets[kind] = (p, enc)

    missing_kinds = [k for k in ['characters', 'characterDetails', 'kibo', 'kiboDetails'] if k not in buckets]
    if missing_kinds:
        found = {k: str(v[0]) for k, v in buckets.items()}
        raise FileNotFoundError(f"다음 CSV를 식별하지 못했습니다: {', '.join(missing_kinds)}\n찾은 파일: {found}")

    data = {
        'characters': read_csv_rows(*buckets['characters']),
        'characterDetails': read_csv_rows(*buckets['characterDetails']),
        'kibo': read_csv_rows(*buckets['kibo']),
        'kiboDetails': read_csv_rows(*buckets['kiboDetails']),
        'metadata': { 'lastUpdated': datetime.now().strftime('%Y-%m-%d') }
    }

    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('data.json 생성 완료')


if __name__ == '__main__':
    main()
