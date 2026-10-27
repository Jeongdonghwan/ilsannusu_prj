"""기존 홈페이지 시공사진 게시판(bid=photo01) 원본 → public/img/case-NN.jpg/.webp (긴 변 1200)
   python -I scripts/prepare_images.py <원본 폴더>
   원본 파일명: files_2026_02_24_<해시>.jpg (curl 로 받은 /rb/files/... 경로를 _ 로 바꾼 것)
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1])
OUT = ROOT / 'public' / 'img'
OUT.mkdir(parents=True, exist_ok=True)

for c in json.loads((ROOT / 'data' / 'cases.json').read_text(encoding='utf-8'))['cases']:
    src = SRC / c['source'].lstrip('/').replace('rb/', '', 1).replace('/', '_')
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    im.thumbnail((1200, 1200), Image.LANCZOS)
    im.save(OUT / f"{c['img']}.jpg", 'JPEG', quality=82, optimize=True, progressive=True)
    im.save(OUT / f"{c['img']}.webp", 'WEBP', quality=80)
    print(c['img'], im.size)
