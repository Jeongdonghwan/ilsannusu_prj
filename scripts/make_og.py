"""페이지별 og 이미지(1200x630 JPEG) → public/og/<key>.jpg  (home, area, cases, blog, area-<시구>, <키워드 슬러그>, blog-<글 슬러그>)
   python -I scripts/make_og.py           # 없는 것만 생성
   python -I scripts/make_og.py --force   # 전부 다시
배경 = 실제 시공 사진(public/img/case-*.jpg) 어둡게, 글자 = 굵은 한글 키워드.
네이버는 og 이미지를 가운데 정사각형으로 잘라 보여 주므로 글자는 가운데 630px 안쪽에 둔다.
"""
import datetime, json, os, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'og'
W, H = 1200, 630
SAFE_L, SAFE_W = 300, 600  # 가운데 정사각형(285~915) 안쪽
BRAND, PHONE = '스타누수탐지', '010-8119-8204'  # lib/site.ts 와 맞출 것
NAVY, ACCENT = (10, 29, 48), (31, 191, 212)
# 윈도우는 맑은 고딕, 리눅스(예약 작업)는 Noto CJK — fonts-noto-cjk 패키지
_FONTS = [(r'C:\Windows\Fonts\malgunbd.ttf', r'C:\Windows\Fonts\malgun.ttf'),
          ('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'),
          ('/usr/share/fonts/google-noto-cjk/NotoSansCJK-Bold.ttc', '/usr/share/fonts/google-noto-cjk/NotoSansCJK-Regular.ttc')]
BOLD, REG = next((f for f in _FONTS if Path(f[0]).exists()), _FONTS[0])


def fnv(s):  # lib/data.ts hash 와 같은 FNV-1a
    h = 2166136261
    for ch in s:
        h = ((h ^ ord(ch)) * 16777619) & 0xFFFFFFFF
    return h


def base(path):
    im = Image.open(path).convert('RGB')
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    im = ImageEnhance.Brightness(im.crop((l, t, l + W, t + H))).enhance(0.38)
    return Image.blend(im, Image.new('RGB', (W, H), NAVY), 0.35)


def wrap(d, text, font, maxw):
    lines, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw:
            cur = t
        else:
            lines.append(cur); cur = w
    return lines + [cur] if cur else lines


def render(bases, key, title, sub):
    im = bases[fnv(key) % len(bases)].copy()
    d = ImageDraw.Draw(im)
    size = 76
    while True:
        f = ImageFont.truetype(BOLD, size)
        lines = wrap(d, title, f, SAFE_W)
        if (len(lines) <= 3 and all(d.textlength(x, font=f) <= SAFE_W for x in lines)) or size <= 40:
            break
        size -= 4
    y = 300 - len(lines) * size * 0.62
    d.rectangle((SAFE_L, y - 34, SAFE_L + 70, y - 26), fill=ACCENT)
    for ln in lines:
        d.text((SAFE_L, y), ln, font=f, fill='white'); y += size * 1.2
    d.text((SAFE_L, y + 14), sub, font=ImageFont.truetype(REG, 28), fill=(214, 226, 236))
    d.text((SAFE_L, 540), f'{BRAND}  ·  {PHONE}', font=ImageFont.truetype(BOLD, 28), fill=ACCENT)
    im.save(OUT / f'{key}.jpg', 'JPEG', quality=80, optimize=True, progressive=True)


def blog_posts():  # content/blog/*.md ('_' 시작 = 비공개, 공개일이 빌드일보다 미래면 제외 — lib/blog.ts 와 같은 규칙) → [(slug, title)]
    today = os.environ.get('BUILD_DATE') or (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=9)).strftime('%Y-%m-%d')
    out = []
    for f in sorted((ROOT / 'content' / 'blog').glob('[!_]*.md')):
        head = f.read_text(encoding='utf-8').split('\n---', 1)[0]  # 첫 '---' ~ 닫는 '---' 앞
        meta = dict(re.findall(r'^(\w+):\s*(.*?)\s*$', head, re.M))
        date = meta.get('date') or meta.get('publishedAt') or ''
        if meta.get('slug') and meta.get('title') and re.fullmatch(r'\d{4}-\d{2}-\d{2}', date) and date <= today:
            out.append((meta['slug'], meta['title'].strip('\'"')))
    return out


def main():
    force = '--force' in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    pages = json.loads((ROOT / 'data' / 'site-pages.json').read_text(encoding='utf-8'))['pages']
    cities = ['일산', '김포', '파주', '은평구', '마포']
    jobs = [('home', '원인 위치부터 찾는 누수탐지', '일산 정발산동 · 서울·경기·인천 출장'),
            ('area', '지역별 누수탐지 안내', '일산 · 김포 · 파주 · 은평구 · 마포'),
            ('cases', '누수탐지·누수공사 시공 사진', '열화상 · 습도계 · 가스식 탐지'),
            ('blog', '누수 궁금증 블로그', '누수 책임 · 보험 · 탐지 장비 · 공사 절차')] + \
           [(f'area-{c}', f'{c} 누수탐지 지역 안내', '동네별 비용 · 업체 · 누수공사') for c in cities] + \
           [(p['slug'], p['kw'], '장비 6종 · 미해결 시 비용 0원') for p in pages] + \
           [(f'blog-{s}', t, '누수 궁금증 블로그') for s, t in blog_posts()]
    jobs = [j for j in jobs if force or not (OUT / f'{j[0]}.jpg').exists()]
    bases = [base(p) for p in sorted((ROOT / 'public' / 'img').glob('case-*.jpg'))] if jobs else []
    for i, (key, title, sub) in enumerate(jobs, 1):
        render(bases, key, title, sub)
        if i % 200 == 0:
            print(i, '/', len(jobs))
    print('생성', len(jobs))


if __name__ == '__main__':
    assert fnv('a') == 0xE40C292C  # FNV-1a 기준값
    main()
