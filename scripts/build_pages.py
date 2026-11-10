"""키워드 원본 엑셀 + 추가 키워드 → data/site-pages.json (사이트 라우트의 단일 출처) + keywords/누수탐지_일산_510.xlsx

  python -I scripts/build_pages.py

오픈 단계(wave)
  1 = 시·구 핵심 (일산·일산동구·일산서구·김포·파주·은평구·마포 + 표기 변형) + 시·구 단위 추가 키워드
  2 = 생활권·신도시 (탄현·주엽·한강신도시·운정·연신내 …)
  3 = 동·읍면 (마두동·김포 대곶면·파주 문산읍·은평구 갈현동 …)
  기존 510개는 오픈 뒤 rebatch.py 로 1~4 묶음이 됐다 → 지금 data/site-pages.json 의 wave 를 그대로 이어받는다.
  5·6 = 오픈 뒤 추가(EXTRA, 2026-11-12 / 11-14). 순서대로 앞 절반 5, 뒤 절반 6.

추가 키워드(EXTRA) 고르는 기준 — 검색량 데이터 없음. 원본 엑셀 481행은 모두 페이지가 있어서
  영업 지역(5개 시·구) 안 장소 × 이미 쓰는 서비스 축(compose.ts SVC). 시·구 → 마포 새 동네 → 생활권 → 동·읍면,
  같은 급에선 본사(일산) 가까운 시·구 순. 건물 형태(ctxOf)에 맞는 서비스만(아파트 누수=아파트 동네, 빌라 누수=빌라 동네,
  수도 누수=마당·땅속 배관이 긴 주택·농가 동네). 민간인통제선 안 마을(군내·장단·진동·진서)과 이미 있는 조합·표기 변형은 뺀다.
"""
import json, re, sys
from collections import Counter
from pathlib import Path
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment

sys.path.insert(0, str(Path(__file__).resolve().parent))
from places_src import ALIAS, places  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'source' / 'keywords_src.xlsx'
OUT_XLSX = ROOT / 'keywords' / '누수탐지_일산_510.xlsx'
SITE_URL = 'https://leak.example'  # TODO: 도메인 확정 후 lib/site.ts 와 함께 바꿀 것
TOTAL = 510
OUT_EXTRA = ROOT / 'keywords' / '스타누수탐지_추가키워드.xlsx'
PUBLIC_URL = 'https://스타누수탐지.kr'  # 엑셀에 읽기 쉽게 (실제 SITE_URL 은 퓨니코드)
EXTRA_DATES = {5: '11-12', 6: '11-14'}

# 원본 481개에 더하는 연관 서비스 키워드 (홈페이지 '주요업무' 범위: 누수탐지·누수공사·배관·하수구 막힘·고압세척)
# (키워드, 지역 표기, 서비스, 수식어)
ADDED = [
    ('일산 누수공사', '일산', '누수공사', None),
    ('일산 누수탐지업체', '일산', '누수탐지', '업체'),
    ('일산 배관누수', '일산', '배관누수', None),
    ('일산 아파트 누수', '일산', '아파트 누수', None),
    ('일산 화장실 누수', '일산', '화장실 누수', None),
    ('일산 천장 누수', '일산', '천장 누수', None),
    ('일산 난방배관 누수', '일산', '난방배관 누수', None),
    ('일산 수도 누수', '일산', '수도 누수', None),
    ('일산 하수구막힘', '일산', '하수구막힘', None),
    ('일산 고압세척', '일산', '고압세척', None),
    ('일산동구 누수공사', '일산동구', '누수공사', None),
    ('일산서구 누수공사', '일산서구', '누수공사', None),
    ('김포 누수탐지업체', '김포', '누수탐지', '업체'),
    ('김포 누수공사', '김포', '누수공사', None),
    ('김포 아파트 누수', '김포', '아파트 누수', None),
    ('김포 화장실 누수', '김포', '화장실 누수', None),
    ('김포 하수구막힘', '김포', '하수구막힘', None),
    ('파주 누수탐지업체', '파주', '누수탐지', '업체'),
    ('파주 누수공사', '파주', '누수공사', None),
    ('파주 아파트 누수', '파주', '아파트 누수', None),
    ('파주 천장 누수', '파주', '천장 누수', None),
    ('파주 하수구막힘', '파주', '하수구막힘', None),
    ('은평구 누수탐지업체', '은평구', '누수탐지', '업체'),
    ('은평구 누수공사', '은평구', '누수공사', None),
    ('은평구 빌라 누수', '은평구', '빌라 누수', None),
    ('은평구 하수구막힘', '은평구', '하수구막힘', None),
    ('마포 누수공사', '마포', '누수공사', None),
    ('운정 누수공사', '운정', '누수공사', None),
    ('한강신도시 누수공사', '한강신도시', '누수공사', None),
]

rows = []
for r in list(load_workbook(SRC, read_only=True).worksheets[0].iter_rows(values_only=True))[1:]:
    no, kw, joined, prio, _cls, city, label, service, mod = r[:9]
    if kw:
        rows.append(dict(kw=kw, joined=joined, prio=prio, city=city, label=label, service=service, mod=mod, added=False))
assert len(rows) == 481, len(rows)
for kw, label, service, mod in ADDED:
    key = ALIAS.get(label, label)
    rows.append(dict(kw=kw, joined=kw.replace(' ', ''), prio=2 if places[key]['kind'] == '시구' else 3,
                     city=places[key]['city'], label=label, service=service, mod=mod, added=True))
assert len(rows) == TOTAL, len(rows)

# 이미 열린 페이지의 wave(rebatch 결과)는 그대로 — 다시 돌려도 기존 묶음이 바뀌지 않게
SP = ROOT / 'data' / 'site-pages.json'
prev = {p['slug']: p['wave'] for p in json.load(open(SP, encoding='utf-8'))['pages']} if SP.exists() else {}

pages, rep = [], {}
for i, r in enumerate(rows, 1):
    key = ALIAS.get(r['label'], r['label'])
    assert key in places, f"지역 데이터 없음: {r['label']} ({r['kw']})"
    kind = places[key]['kind']
    if r['added']:
        wave = 1 if kind == '시구' else 2
    else:
        wave = 1 if (r['prio'] in (1, 2) and kind == '시구') else (2 if r['prio'] in (1, 2) else 3)
    pg = dict(n=i, kw=r['kw'], slug=r['kw'].replace(' ', '-'), label=r['label'], place=key, city=r['city'],
              service=r['service'], mod=r['mod'] or '', prio=r['prio'], wave=prev.get(r['kw'].replace(' ', '-'), wave), added=r['added'])
    k = (key, r['service'], r['mod'] or '')
    if k in rep:
        pg['variantOf'] = rep[k]
    else:
        rep[k] = pg['slug']
    pages.append(pg)

# ---- 오픈 뒤 추가 (EXTRA) ----
ALL_SVC = ['누수공사', '배관누수', '아파트 누수', '빌라 누수', '화장실 누수', '천장 누수', '난방배관 누수', '수도 누수', '하수구막힘', '고압세척']
BY_CTX = {'apt': '아파트 누수', 'villa': '빌라 누수', 'house': '수도 누수'}
NO_EXTRA = {'군내면', '장단면', '진동면', '진서면'}  # 민간인통제선 안 — 출입 절차가 필요해 페이지를 늘리지 않음
SHOP = re.compile('상가|시장|음식점|상권')


def ctx_of(P):  # lib/compose.ts ctxOf 와 같은 규칙
    if re.search('농가|전원|공장|창고|통제선|접경|산간', P['homes']): return 'house'
    return 'villa' if re.search('빌라|다세대|다가구|원룸', re.split('[,와]', P['homes'])[0]) else 'apt'


def extra_services(P):
    cx, kind = ctx_of(P), P['kind']
    if kind == '시구':
        return ALL_SVC
    if kind == '생활권':
        s = ['누수공사', '배관누수', BY_CTX[cx], '화장실 누수', '천장 누수', '난방배관 누수', '하수구막힘']
    else:
        s = ['누수공사', BY_CTX[cx], '화장실 누수', '배관누수', '하수구막힘'] + (['천장 누수'] if cx != 'house' else []) + (['난방배관 누수'] if cx == 'apt' else [])
    s += [x for x, w in (('아파트 누수', '아파트'), ('빌라 누수', '빌라|다세대|다가구')) if x not in s and re.search(w, P['homes'])]  # 주거 형태에 적힌 건물
    return s + (['고압세척'] if SHOP.search(P['homes']) else [])


label_of = {}  # 장소 → 대표 페이지의 지역 표기 (키워드 표기를 기존과 맞춘다)
for p in pages:
    if 'variantOf' not in p: label_of.setdefault(p['place'], p['label'])
NEW_LABEL = {v: k for k, v in ALIAS.items() if k.startswith('마포 ')}  # 마포 새 동네 중 다른 지역에도 있는 이름
CITY_ORDER = ['일산', '김포', '파주', '은평구', '마포']  # 본사(일산) 가까운 순
KIND_RANK = {'시구': 0, '생활권': 2, '동': 3, '읍면': 3}
cand = []
for key, P in places.items():
    if key in NO_EXTRA: continue
    new_place = key not in label_of
    label = label_of.get(key) or NEW_LABEL.get(key, P['name'])
    combos = ([('누수탐지', m) for m in ('', '비용', '잘하는곳')] if new_place else []) +              ([('누수탐지', m) for m in ('비용', '잘하는곳', '가격', '전문업체', '업체')] if P['kind'] == '시구' else []) +              [(s, '') for s in extra_services(P)]
    for j, (svc, mod) in enumerate(combos):
        if (key, svc, mod) in rep: continue
        kw = f"{label} {svc}" + (f" {mod}" if mod and mod != '업체' else '') if svc != '누수탐지' else              (f"{label} 누수탐지업체" if mod == '업체' else f"{label} 누수탐지" + (f" {mod}" if mod else ''))
        rank = (KIND_RANK[P['kind']] if not (new_place and svc == '누수탐지') else 1, CITY_ORDER.index(P['city']), list(places).index(key), j)
        cand.append((rank, dict(kw=kw, label=label, place=key, city=P['city'], service=svc, mod=mod)))
        rep[(key, svc, mod)] = kw.replace(' ', '-')
cand.sort(key=lambda x: x[0])
half = (len(cand) + 1) // 2
for i, (_, c) in enumerate(cand):
    pages.append(dict(n=len(pages) + 1, kw=c['kw'], slug=c['kw'].replace(' ', '-'), label=c['label'], place=c['place'], city=c['city'],
                      service=c['service'], mod=c['mod'], prio=3, wave=5 if i < half else 6, added=True, extra=True))

slugs = Counter(p['slug'] for p in pages)
assert all(v == 1 for v in slugs.values()), [k for k, v in slugs.items() if v > 1]
json.dump({'pages': pages}, open(ROOT / 'data' / 'site-pages.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)

# ---- 키워드 엑셀 (첫 시트 = 키워드 시트, 요약 시트 없음) ----
wb = Workbook()
ws = wb.active
ws.title = '키워드'
head = ['No', '키워드', '붙여쓰기', '우선순위', '지역', '서비스', '수식어', 'URL', '오픈 단계', '추가 여부']
ws.append(head)
for p, r in zip(pages[:TOTAL], rows):
    ws.append([p['n'], p['kw'], r['joined'], r['prio'], p['city'], p['service'], p['mod'] or '',
               f"{SITE_URL}/{p['slug']}/", p['wave'], '추가' if p['added'] else ''])
for c in ws[1]:
    c.font = Font(bold=True, color='FFFFFF')
    c.fill = PatternFill('solid', fgColor='0B2236')
    c.alignment = Alignment(horizontal='center')
for col, w in zip('ABCDEFGHIJ', [6, 30, 30, 9, 9, 14, 10, 52, 9, 9]):
    ws.column_dimensions[col].width = w
ws.freeze_panes = 'A2'
ws.auto_filter.ref = f'A1:J{TOTAL + 1}'
OUT_XLSX.parent.mkdir(exist_ok=True)
wb.save(OUT_XLSX)

# ---- 추가 키워드 엑셀 (첫 시트 = 키워드 시트) ----
wb = Workbook()
ws = wb.active
ws.title = '키워드'
ws.append(['키워드', 'URL', '오픈일'])
for p in pages[TOTAL:]:
    ws.append([p['kw'], f"{PUBLIC_URL}/{p['slug']}/", EXTRA_DATES[p['wave']]])
for c in ws[1]:
    c.font = Font(bold=True, color='FFFFFF')
    c.fill = PatternFill('solid', fgColor='0B2236')
    c.alignment = Alignment(horizontal='center')
for col, w in zip('ABC', [30, 60, 9]):
    ws.column_dimensions[col].width = w
ws.freeze_panes = 'A2'
ws.auto_filter.ref = f'A1:C{len(pages) - TOTAL + 1}'
wb.save(OUT_EXTRA)

sys.stdout.reconfigure(encoding='utf-8')
c = Counter(p['wave'] for p in pages)
acc = 0
for w in sorted(c):
    acc += c[w]
    print(f'wave {w}: {c[w]} (누적 {acc})')
print('표기 변형(variantOf):', sum(1 for p in pages if 'variantOf' in p), '/ 대표 페이지:', sum(1 for p in pages if 'variantOf' not in p))
print('엑셀:', OUT_XLSX.name, TOTAL, '행 /', OUT_EXTRA.name, len(pages) - TOTAL, '행')
ex = pages[TOTAL:]
print('추가:', len(ex), Counter(p['wave'] for p in ex), Counter(p['service'] + (' ' + p['mod'] if p['mod'] else '') for p in ex).most_common())
print('추가 장소 급:', Counter(places[p['place']]['kind'] for p in ex), Counter(p['city'] for p in ex))
