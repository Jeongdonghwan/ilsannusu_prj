# 스타누수탐지 SEO 사이트 — 기획·운영

기존 홈페이지(01081198204.m7114.kr)를 대체하는 SEO 사이트. 키워드 엑셀(`keywords/누수탐지_일산_510.xlsx`, 510개) 한 줄이 페이지 하나.

## 구조
| 경로 | 내용 |
|---|---|
| `/` | 메인: 회사 소개·주요업무(홈페이지 문구), 장비 6종, 시공 사진 레일, 지역 |
| `/area/`, `/area/<시구>/` | 지역 허브 (일산·김포·파주·은평구·마포) — 열린 키워드 페이지 전부로 가는 크롤 경로 |
| `/<키워드>/` | 키워드 페이지 510개 |
| `/cases/` | 시공 사진 7장 (현장사진 게시판, 2026.02.24 게시) |
| `/blog/`, `/blog/<한글슬러그>/` | 누수 궁금증 블로그 — `content/blog/*.md` (`_` 시작 = 비공개, `_example.md` = 톤 예시). 프런트매터 `date`(없으면 `publishedAt`)가 빌드일(env `BUILD_DATE`, 없으면 KST 오늘)보다 미래면 목록·글·sitemap·rss·og 모두 제외 → 미리 써 두고 날짜로 공개. 키워드 큐 `content/blog/_data/keywordQueue.json`(50개, 지역+서비스 금지), 스크립트 `scripts/drip/` |
| `/sitemap.xml`, `/robots.txt`, `/rss.xml` | 열린 단계의 대표 페이지만 |

## 단계 오픈 (`OPEN_WAVE`)

오픈 후 7일 안 4번 나눠 오픈 (post-launch 스킬, 2026-10-29). 순서는 시군구 → 생활권 → 동 그대로, wave 값은 `scripts/drip/rebatch.py --plan 50,75,100 --keep-first` 로 다시 매김.
`build_pages.py` 를 다시 돌리면 wave 가 원래 단계로 돌아가므로 그 뒤 rebatch 를 꼭 다시 돌린다. 오늘 열 묶음: `python -I scripts/drip/drip_status.py data/drip.json`

| 묶음 | 날짜 | 누적 페이지 |
|---|---|---|
| 1 | 10/28 (오픈일) | 83 (시·구) |
| 2 | 10/30 | 255 (50%) |
| 3 | 11/1 | 383 (75%) |
| 4 | 11/3 | 510 (100%) |

```bash
python -I scripts/build_pages.py   # 원본 엑셀 + 추가 29개 → data/site-pages.json + keywords/누수탐지_일산_510.xlsx
python -I scripts/places_src.py    # 지역 데이터 → data/places.json
python -I scripts/make_og.py       # 페이지별 og 이미지 (public/og, 없는 것만)
OPEN_WAVE=1 SITE_URL=https://도메인 npx next build
bash scripts/deploy.sh <단계> <https://도메인>
```
표기만 다른 페이지(고양 일산/고양시 일산 → 일산, 주엽동 → 주엽, 은평 → 은평구 …)는 `MERGE_VARIANTS`로 대표 페이지에 canonical, 사이트맵 제외.

## 사실 근거 (지어낸 수치 없음)
- 홈페이지: 장비(열화상카메라·청음식탐지기·가스식탐지기·습도계·음향장비·내시경), 주요업무, 미해결 시 비용 0원, 무료견적 상담, 연중무휴 긴급출동, 국가공인 자격증 보유, 누수 보험 상담·피해 복구 공사 지원, 하수구·변기·싱크대 막힘·고압세척·언수도 해빙
- 게시판 안내 이미지: 대표 김원수, 24시간 연중무휴
- 네이버 플레이스(1627329997): 주소·좌표, 방문자 리뷰 21건(2026-10 확인)
- 가격·건수·경력 연수는 홈페이지에 없어서 쓰지 않음. 시공 사진은 지역이 적혀 있지 않아 장소를 표시하지 않음

## 디자인
짙은 남청(#0a1d30) + 흰 + 쿨그레이(#e7edf2) + 물빛 강조(#1fbfd4). 남청 글 + 오른쪽 세로 현장 사진 히어로(커튼 등장), 답 먼저 상자, 남청 장비 띠, 강조색 상담 띠, 세로선 진행 순서. web-design 프리셋 4(로컬 서비스) 리듬, 따뜻한 회색 대신 쿨그레이.

## 받아야 할 정보 → `lib/site.ts`
- [ ] 도메인 (`SITE_URL`, 지금은 `https://leak.example`)
- [ ] 사업자등록번호, 상담 시간
- [ ] 서치어드바이저·서치콘솔 소유확인 코드 (`app/layout.tsx`)
- [ ] (선택) 시공 사진별 지역·날짜·내용, 기본 비용 기준
