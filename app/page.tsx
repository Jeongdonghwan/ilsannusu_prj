import type { Metadata } from 'next';
import Link from 'next/link';
import { CASES, CITIES, OPEN_PAGES, PLACES, openCities, cityPages, cityPath, pagePath, pageEncodedPath, inSitemap } from '../lib/data';
import { TOOLS } from '../lib/compose';
import { getPosts, postPath } from '../lib/blog';
import { BRAND, CONTACT, PLACE, KAKAO, BLOG, tel, smsHref, shareMeta } from '../lib/site';
import { faqJsonLd, itemListJsonLd } from '../lib/jsonld';
import { Actions, IconArrow, IconMsg, IconPhone, IconPin, JsonLd, SectionHead, Ticker } from '../components/Common';

const HOME_TITLE = `${BRAND} | 일산 누수탐지·누수공사·하수구 막힘`;
const HOME_DESC = '일산동구 정발산동의 누수탐지 전문업체. 열화상·청음식·가스식 탐지기 등 장비 6종으로 위치를 찾고 발생 부위만 수리합니다. 미해결 시 비용 0원, 연중무휴 긴급출동.';
export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESC,
  alternates: { canonical: '/', types: { 'application/rss+xml': '/rss.xml' } },
  ...shareMeta('home', `${BRAND} 누수탐지`, { title: HOME_TITLE, description: HOME_DESC, url: '/' }),
};

// 홈페이지 '주요업무' 이미지의 항목 그대로
const WORKS = [
  { t: '정밀 누수 탐지 및 누수 공사', d: ['내시경 카메라, 열화상 카메라, 음향 장비 사용', '벽·천장·바닥·지하 공간 등 보이지 않는 누수까지 탐지', '발견된 누수를 신속·정확하게 수리해 추가 손상 방지'] },
  { t: '배관·관로 문제 해결', d: ['변기, 싱크대, 하수구 막힘 처리', '관로 문제 및 언 수도 녹임(해빙)', '고압세척으로 배관 속 이물질 제거'] },
  { t: '현장 맞춤형 처리', d: ['작업 전후 상세 설명과 투명한 비용 안내', '정기 점검, 누수 보험 상담, 피해 복구 공사 지원', '문제 미해결 시 비용 0원'] },
  { t: '긴급 출동', d: ['서울·경기·인천 전지역 방문 및 무료견적 상담', '연중무휴 긴급 출동', '아파트·빌라·주택·상가·원룸·오피스텔·공장·야외'] },
];

const FAQ = [
  { q: '어느 지역까지 오나요?', a: '사무실이 고양시 일산동구 정발산동에 있어 일산이 가장 가깝고, 김포·파주·은평구·마포를 포함해 서울·경기·인천 전지역 방문 상담을 받습니다.' },
  { q: '누수를 못 찾으면 비용은요?', a: '홈페이지에 안내한 대로 문제를 해결하지 못하면 비용을 받지 않습니다(미해결 시 0원). 상담과 견적은 무료입니다.' },
  { q: '바닥을 다 뜯어야 하나요?', a: '장비로 위치를 좁힌 뒤 누수가 생긴 부위만 엽니다. 불필요한 공사를 줄이고 구조물은 그대로 두는 것이 원칙입니다.' },
  { q: '누수 보험 처리도 도와주나요?', a: '누수 보험 상담과 보험 서류, 피해 복구 공사를 지원합니다. 보장 여부는 가입한 보험 약관에 따라 다릅니다.' },
  { q: '하수구·변기 막힘도 하나요?', a: '네. 변기·싱크대·하수구 막힘 처리와 고압세척, 관로 문제, 언 수도 녹임(해빙)도 주요업무입니다.' },
];

export default function Home() {
  const cities = openCities();
  // 메인 캐러셀: 시·구 대표 페이지 + 열린 생활권 대표 페이지 (최대 30)
  const hubs = OPEN_PAGES.filter((p) => inSitemap(p) && !p.mod && p.service === '누수탐지').slice(0, 30);
  const posts = getPosts().slice(0, 5);
  const tickerNames = Array.from(new Set(OPEN_PAGES.map((p) => PLACES[p.place].name))).slice(0, 24);

  return (
    <main>
      <JsonLd data={[faqJsonLd(FAQ), itemListJsonLd(hubs.map((p) => ({ name: p.kw, path: pageEncodedPath(p) })))]} />
      {/* 히어로: 업체 배너 구성 그대로 (2026-10-28 사용자 수정 요청) */}
      <section className="hero hero-star">
        <div className="wrap star-grid">
          <div className="star-text">
            <p className="star-eyebrow">누수탐지 <em>전문업체</em></p>
            <h1><img src="/img/star-emblem.png" alt="스타누수탐지 STAR 로고" width={215} height={214} /><span>{BRAND}</span></h1>
            <p className="star-lead">욕실누수, 천장누수, 화장실누수, 싱크대누수, 배관누수,<br className="br-d" /> 하수구막힘까지 누수 관련 상담 항목을 한 번에 확인해보세요.</p>
            <div className="star-btns">
              <a className="sb sb-tel" href={tel}><IconPhone /><span>전화문의 {CONTACT.phone}</span></a>
              {KAKAO
                ? <a className="sb sb-kakao" href={KAKAO} target="_blank" rel="noopener noreferrer"><IconMsg /><span>카카오톡 상담</span></a>
                : <a className="sb sb-kakao" href={PLACE.url} target="_blank" rel="noopener noreferrer"><IconPin /><span>네이버 플레이스</span></a>}
              <a className="sb sb-sms" href={smsHref}><IconMsg /><span>누수사진 문자 보내기</span></a>
              <a className="sb sb-blog" href={BLOG} target="_blank" rel="noopener noreferrer"><span>블로그 작업사례 보기</span></a>
            </div>
          </div>
          <figure className="star-photo">
            <img src="/img/hero-star.webp" alt={`${BRAND} 기사가 싱크대 하부장 배관에 탐지 장비를 대고 누수를 확인하는 모습`} width={666} height={602} />
          </figure>
        </div>
        <ul className="star-points wrap">
          {['정확한 진단', '최소한의 공사', '합리적인 비용', '24시간 상담', '보험처리 지원', 'A/S 보장'].map((x) => <li key={x}>{x}</li>)}
        </ul>
      </section>

      <Ticker items={tickerNames} />

      <div className="wrap content">
        <section className="sec">
          <SectionHead no="01" title="보이지 않는 작은 누수까지 찾습니다" />
          <div className="cols">
            <div className="prose" data-reveal>
              <p className="first">누수는 시간이 지날수록 건물 구조를 상하게 하고 비용 부담도 커집니다. 그래서 초기에 정확히 찾는 것이 가장 중요합니다.</p>
              <p>{BRAND}는 내시경 카메라, 열화상 카메라, 음향 장비 등으로 벽·천장·바닥·지하 공간까지 정밀하게 탐지하고, 찾은 문제는 바로 고쳐 추가 손상을 막습니다. 변기·싱크대·하수구 막힘과 관로 문제, 언 수도 녹임(해빙)도 함께 처리합니다.</p>
              <p>수리로 끝내지 않고 작업 전후 상세 설명과 투명한 비용 안내, 정기 점검, 누수 보험 상담, 피해 복구 공사까지 지원합니다. 문제를 해결하지 못하면 비용은 0원입니다.</p>
            </div>
            <figure className="memo-photo" data-reveal>
              <img src="/img/office-star.webp" alt={`${BRAND} 누수탐지·누수공사 기사가 청음 장비로 바닥 누수를 듣는 모습`} width={706} height={635} loading="lazy" />
            </figure>
          </div>
        </section>

        <section className="sec mist">
          <SectionHead no="02" title="주요업무" sub="기존 홈페이지 '주요업무'에 적힌 내용입니다." />
          <ol className="works">
            {WORKS.map((w, i) => (
              <li key={w.t} data-reveal style={{ transitionDelay: `${(i % 2) * 80}ms` }}>
                <span className="works-no">{String(i + 1).padStart(2, '0')}</span>
                <div><h3>{w.t}</h3><ul>{w.d.map((x) => <li key={x}>{x}</li>)}</ul></div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="band">
        <div className="wrap">
          <SectionHead no="03" title="보유 장비" sub="아파트·빌라·상가·건물·공장·야외 등 모든 유형의 현장과 구조물에 씁니다." />
          <ol className="tools reveal-group">{TOOLS.map((t) => <li key={t.name}><div><h3>{t.name}</h3><p>{t.d[0]}</p></div></li>)}</ol>
        </div>
      </section>

      <section className="cta-band" data-reveal>
        <div className="wrap cta-band-in">
          <p>아래층 천장 얼룩, 도는 계량기, 떨어지는 보일러 압력<br />셋 중 하나면 위치 확인부터</p>
          <Actions sms={false} />
        </div>
      </section>

      <div className="wrap content">
        <section className="sec">
          <SectionHead no="04" title="시공 사진" sub="기존 홈페이지 현장사진 게시판에 올린 사진입니다." />
          <div className="rail-nav">
            <button type="button" data-scroll="-1" data-target="case-rail" aria-label="이전 사진">←</button>
            <button type="button" data-scroll="1" data-target="case-rail" aria-label="다음 사진">→</button>
          </div>
          <div className="rail" id="case-rail">
            {CASES.map((k, i) => (
              <figure key={k.img} data-reveal style={{ transitionDelay: `${(i % 4) * 70}ms` }}>
                <div className="ph"><img src={`/img/${k.img}.webp`} alt={`${BRAND} 시공 사진 - ${k.scene}`} loading="lazy" /></div>
                <figcaption><b>{k.space}</b>{k.scene}</figcaption>
              </figure>
            ))}
          </div>
          <p data-reveal><Link href="/cases/" className="more">시공 사진 설명 보기 <IconArrow /></Link></p>
        </section>

        <section className="sec mist">
          <SectionHead no="05" title="지역" sub="지역을 고르면 그 지역 누수탐지 안내로 이어집니다." />
          <div className="cities">
            {cities.map((city) => (
              <Link key={city} href={cityPath(city)} className="city-row" data-reveal>
                <div><b>{city}</b><span>{CITIES[city].full}</span></div>
                <em>{cityPages(city).length}</em>
              </Link>
            ))}
          </div>
          <ul className="linklist" style={{ marginTop: 28 }}>
            {hubs.slice(0, 8).map((p) => <li key={p.slug}><Link href={pagePath(p)}>{p.kw}<IconArrow /></Link></li>)}
          </ul>
          <p data-reveal><Link href="/area/" className="more">전체 지역 페이지 <IconArrow /></Link></p>
        </section>

        <section className="sec">
          <SectionHead no="06" title="자주 묻는 질문" />
          <div className="faq">{FAQ.map((f) => <details key={f.q} data-reveal><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}</div>
        </section>

        <section className="sec">
          <SectionHead no="07" title="누수 궁금증 블로그" sub="아랫집 누수 책임, 누수 보험, 수도요금처럼 상담 때 자주 받는 질문을 글로 정리합니다." />
          {posts.length > 0 && <ul className="linklist">{posts.map((p) => <li key={p.slug}><Link href={postPath(p)}>{p.title}<IconArrow /></Link></li>)}</ul>}
          <p data-reveal><Link href="/blog/" className="more">블로그 글 전체 보기 <IconArrow /></Link></p>
        </section>
      </div>

      <section className="closing">
        <div className="wrap" data-reveal>
          <h2>주소와 증상만 알려주세요</h2>
          <p>상담·견적은 무료입니다.</p>
          <Actions />
        </div>
      </section>
    </main>
  );
}
