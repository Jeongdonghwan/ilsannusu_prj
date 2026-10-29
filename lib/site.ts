// 사이트 설정 — 연락처·사업자 정보·도메인은 이 파일만 고치면 전 페이지에 반영된다.
// 근거: 기존 홈페이지(01081198204.m7114.kr) 표기 + 네이버 플레이스(1627329997) 주소·좌표.

// TODO(도메인 확정 후): SITE_URL 환경변수로 넘기거나 기본값 교체. 배포: bash scripts/deploy.sh <단계> <URL>
export const SITE_URL = process.env.SITE_URL || 'https://leak.example';
export const BRAND = '스타누수탐지'; // 사용자 확정 2026-10-27 (플레이스 상호는 '누수탐지', 홈페이지 로고는 '스타누수탐지공사')
export const SITE_NAME = `${BRAND} | 일산 누수탐지·누수공사`;

// 카카오톡 채널 주소 — 기존 홈페이지에 채널 주소가 없음(pf.kakao.com 만). 받으면 넣기, 비어 있으면 버튼 자리에 플레이스
export const KAKAO = '';
export const BLOG = 'https://blog.naver.com/ilmano14'; // 기존 홈페이지 '블로그' 메뉴

export const CONTACT = {
  phone: '010-8119-8204', // 홈페이지 대표번호 (플레이스에는 안심번호 0507-1446-8215 노출)
  sms: '010-8119-8204',
  hours: '연중무휴 긴급출동', // 홈페이지 표기
};

export const BUSINESS = {
  name: BRAND,
  ceo: '김원수', // 홈페이지 시공사진 게시판 안내 이미지 표기
  bizNumber: '', // TODO 사업자등록번호
  address: '경기 고양시 일산동구 대산로31번길 29 1층',
  addressLot: '경기 고양시 일산동구 정발산동 690-6',
  geo: { lat: 37.6691926, lng: 126.7723056 }, // 네이버 플레이스 좌표
};

// 네이버 플레이스 — https://naver.me/Gdiz1T4T 가 가리키는 실제 주소 (2026-10-27 curl 확인)
export const PLACE = {
  id: '1627329997',
  url: 'https://m.place.naver.com/place/1627329997/home',
  map: 'https://map.naver.com/p/entry/place/1627329997',
  short: 'https://naver.me/Gdiz1T4T',
  reviews: 21, // 방문자 리뷰 수 (2026-10-27 확인, 바뀌면 고칠 것)
  checked: '2026년 10월',
};

// 순차 오픈: 이 단계 이하의 페이지만 빌드·사이트맵·내부링크에 포함된다.
//   OPEN_WAVE=1 npm run build  (post-launch 7일 오픈: 1 = 10/28 시·구 83 / 2 = 10/30 255 / 3 = 11/1 383 / 4 = 11/3 전체 510 — scripts/drip/rebatch.py)
export const OPEN_WAVE = Number(process.env.OPEN_WAVE || 3);

// 표기만 다른 키워드 페이지(일산/고양 일산/고양시 일산, 주엽/주엽동 …)는 대표 페이지로 canonical + 사이트맵 제외
export const MERGE_VARIANTS = true;

export const tel = `tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`;
export const smsHref = `sms:${CONTACT.sms.replace(/[^0-9]/g, '')}`;
export const absUrl = (path: string) => `${SITE_URL}${path}`;

// og·트위터 카드: public/og/<key>.jpg (scripts/make_og.py 로 생성)
export const shareMeta = (key: string, alt: string, o: { title?: string; description?: string; url?: string } = {}) => {
  const images = [{ url: `${SITE_URL}/og/${encodeURIComponent(key)}.jpg`, width: 1200, height: 630, alt }];
  return {
    openGraph: { type: 'website' as const, siteName: SITE_NAME, locale: 'ko_KR', ...o, images },
    twitter: { card: 'summary_large_image' as const, title: o.title, description: o.description, images },
  };
};

// 서치어드바이저(네이버)·서치콘솔(구글) HTML 태그 소유확인 — content 값만
export const NAVER_VERIFY = '';
export const GOOGLE_VERIFY = '';
