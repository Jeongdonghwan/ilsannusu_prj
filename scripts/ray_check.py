"""키워드 페이지 점검 (h1 수식어·레이 구조, 2026-11-24) — 빌드 결과(out/)에서 잰다.

  python -I scripts/ray_check.py out

<main data-topic="..."> 가 붙은 페이지(키워드 페이지)만 본다.
  - h1(키워드+수식어) 중복 수
  - 본문 글자(main, 공백 제외)·절 문단 길이·문단(p) 수 / 본문 200자 (1 넘으면 잘게 쪼개진 것)
  - 키워드 전체가 든 h2 수
  - 같은 주제(data-topic) 페이지끼리 같은 문장 비율(무작위 쌍, 공유 문장 수 / 작은 쪽 문장 수) — 평균 30% 이하
  - description 45~80자·중복 0 (§5-3), 키워드 든 h2 4개 이상
  - title = "키워드 수식어 | 상호": 중복 0, 앞부분 == h1, 전체 40자 이하(넘으면 상호를 뺀다), og:title 같음
  - 조사 오류(받침 없는 말 + 은/을/과, 받침 있는 말 + 를/와), 치환 안 된 자리표시자
"""
import collections, glob, html, os, random, re, sys
from urllib.parse import unquote, urlparse

for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding='utf-8')
    except Exception: pass

root = sys.argv[1] if len(sys.argv) > 1 else 'out'
strip = lambda x: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', x))).strip()
nos = lambda x: len(re.sub(r'\s', '', x))
OK_WORDS = {'마을', '가을', '고을', '효과', '사과', '초과', '치과', '부과', '노은', '보은', '다은', '지은', '노을', '나을', '투과'}


def has_final(ch):
    o = ord(ch)
    return 0xAC00 <= o <= 0xD7A3 and (o - 0xAC00) % 28 != 0


def josa_errors(t):
    bad = []
    for m in re.finditer(r'([가-힣]+)(은|을|과|를|와)(?=[\s,.·)])', t):
        w, jo = m.group(1), m.group(2)
        if any((w + jo).endswith(x) for x in OK_WORDS): continue
        fin = has_final(w[-1])
        if (jo in '은을과' and not fin) or (jo in '를와' and fin):
            bad.append(m.group(0))
    return bad


pages = []
for f in glob.glob(os.path.join(root, '**', 'index.html'), recursive=True):
    s = open(f, encoding='utf-8', errors='ignore').read()
    m = re.search(r'<main[^>]*data-topic="([^"]*)"[^>]*>(.*?)</main>', s, re.S)
    if not m: continue
    topic, body = html.unescape(m.group(1)), m.group(2)
    dm = re.search(r'<meta name="description" content="([^"]*)"', s)
    desc = html.unescape(dm.group(1)) if dm else ''
    tm = re.search(r'<title>(.*?)</title>', s, re.S)
    title = html.unescape(tm.group(1)).strip() if tm else ''
    ogt = re.search(r'<meta property="og:title" content="([^"]*)"', s)
    ogt = html.unescape(ogt.group(1)) if ogt else ''
    canon = re.search(r'<link rel="canonical" href="([^"]+)"', s)
    own = '/' + os.path.relpath(os.path.dirname(f), root).replace(os.sep, '/') + '/'
    variant = bool(canon) and unquote(urlparse(canon.group(1)).path).rstrip('/') != own.rstrip('/')
    body = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', body, flags=re.S)
    h1 = strip(re.search(r'<h1[^>]*>(.*?)</h1>', body, re.S).group(1))
    kw = strip(re.search(r'<h1[^>]*>\s*<span[^>]*>(.*?)</span>', body, re.S).group(1))
    art = re.search(r'<article[^>]*>(.*?)</article>', body, re.S)
    art = art.group(1) if art else ''
    secs = [strip(x) for x in re.findall(r'<p[^>]*>(.*?)</p>', art, re.S)]
    h2s = [strip(x) for x in re.findall(r'<h2[^>]*>(.*?)</h2>', body, re.S)]
    text = strip(re.sub(r'<nav.*?</nav>', ' ', body, flags=re.S))
    sum_p = re.search(r'핵심 요약</h2>\s*<p[^>]*>(.*?)</p>', body, re.S)
    faq = [strip(x) for x in re.findall(r'<details[^>]*>.*?<p[^>]*>(.*?)</p>', body, re.S)]
    sents_src = ' '.join(([strip(sum_p.group(1))] if sum_p else []) + secs + faq)
    sents = {x.strip() for x in re.split(r'(?<=[.?!])\s+', sents_src) if len(x.strip()) > 12}
    pages.append(dict(f=f, title=title, ogt=ogt, desc=desc, topic=topic, h1=h1, kw=kw, secs=secs, h2=h2s, chars=nos(text), art_chars=nos(strip(art)),
                      art_p=len(secs), sents=sents, text=text, variant=variant))

if not pages:
    print('data-topic 이 붙은 키워드 페이지가 없음'); sys.exit(1)
print(f'키워드 페이지 {len(pages)}쪽 (표기 변형 canonical {sum(p["variant"] for p in pages)}쪽은 문장 비교에서 뺌)')
h1c = collections.Counter(p['h1'] for p in pages)
dup = [k for k, v in h1c.items() if v > 1]
nosub = [p['h1'] for p in pages if p['h1'] == p['kw']]
print(f'h1 중복 {len(dup)}  수식어 없는 h1 {len(nosub)}' + (f'  예: {dup[:3]}' if dup else ''))
avg = lambda a: sum(a) / len(a) if a else 0
L = [p['chars'] for p in pages]
S = [nos(x) for p in pages for x in p['secs']]
print(f'본문(main) 평균 {avg(L):.0f}자 최소 {min(L)} 최대 {max(L)} | 절 문단 평균 {avg(S):.0f}자 최소 {min(S)} 최대 {max(S)}')
ratio = [p['art_p'] / (p['art_chars'] / 200) for p in pages if p['art_chars']]
print(f'절 문단 p / 200자: 평균 {avg(ratio):.2f} 최대 {max(ratio):.2f} (1 넘으면 쪼개진 것)')
kwh2 = [sum(1 for h in p['h2'] if p['kw'] in h) for p in pages]
print(f'키워드 전체가 든 h2: 평균 {avg(kwh2):.1f}개 최소 {min(kwh2)} (기준 4개 이상)')
DL = [len(p['desc']) for p in pages]
ddup = len(pages) - len({p['desc'] for p in pages})
dbad = sum(1 for x in DL if not 45 <= x <= 80)
print(f'description 길이 {min(DL)}~{max(DL)}자, 45~80 밖 {dbad}, 중복 {ddup}')

groups = collections.defaultdict(list)
for p in pages:
    if not p['variant']: groups[p['topic']].append(p)
random.seed(7)
worst_avg, worst_max = 0, 0
for k, v in sorted(groups.items(), key=lambda x: -len(x[1])):
    if len(v) < 2: continue
    r = []
    for _ in range(min(400, len(v) * (len(v) - 1) // 2)):
        a, b = random.sample(v, 2)
        r.append(len(a['sents'] & b['sents']) / max(1, min(len(a['sents']), len(b['sents']))))
    worst_avg, worst_max = max(worst_avg, avg(r)), max(worst_max, max(r))
    print(f'  같은 문장 [{k}] {len(v)}쪽: 평균 {avg(r):.0%} 최대 {max(r):.0%}')
print(f'같은 주제 같은 문장: 주제별 평균 중 가장 높은 값 {worst_avg:.0%}, 쌍 최대 {worst_max:.0%} (기준 평균 30% 이하)')

jb = collections.Counter(e for p in pages for e in josa_errors(p['text']))
raw = [p['f'] for p in pages if re.search(r'\$\{|undefined|NaN|\bnull\b|\[object', p['text'])]
print(f'조사 오류 {sum(jb.values())}' + (f'  {jb.most_common(10)}' if jb else '') + f' | 자리표시자 남은 페이지 {len(raw)}')
TL = [len(p['title']) for p in pages]
HL = [len(p['h1']) for p in pages]
tdup = len(pages) - len({p['title'] for p in pages})
tneq = sum(1 for p in pages if p['title'] != p['h1'] and not p['title'].startswith(p['h1'] + ' | '))
togn = sum(1 for p in pages if p['ogt'] != p['title'])
tbad = sum(1 for a in TL if a > 40)
print(f'title 길이 {min(TL)}~{max(TL)}자(앞부분 {min(HL)}~{max(HL)}자), 40자 넘는 것 {tbad}, 중복 {tdup}, 앞부분이 h1 과 다른 것 {tneq}, og:title 다른 것 {togn}')
ok = not tdup and not tneq and not tbad and not togn and not dup and not nosub and worst_avg <= 0.30 and not jb and not raw and min(kwh2) >= 4 and not dbad and not ddup
print('판정: ' + ('통과' if ok else '미달'))
sys.exit(0 if ok else 1)
