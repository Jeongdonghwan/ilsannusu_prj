// 공통 UI — 이모지 없이 선 아이콘, 각진 버튼, 번호 붙은 섹션 머리.
import Link from 'next/link';
import { BRAND, CONTACT, BUSINESS, PLACE, tel, smsHref } from '../lib/site';

export const JsonLd = ({ data }: { data: object | object[] }) => (
  <>{(Array.isArray(data) ? data : [data]).map((d, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />)}</>
);

const Svg = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
export const IconPhone = () => <Svg d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />;
export const IconMsg = () => <Svg d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />;
export const IconArrow = () => <Svg d="M5 12h14M13 6l6 6-6 6" size={16} />;
export const IconPin = () => <Svg d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z" size={17} />;

// 네이버 플레이스 고정 링크 (모든 페이지: 헤더·하단 바·푸터)
export const PlaceLink = ({ className = 'btn-text', label = '네이버 플레이스(지도·리뷰) 보기' }: { className?: string; label?: string }) => (
  <a className={className} href={PLACE.url} target="_blank" rel="noopener noreferrer"><IconPin /><span>{label}</span></a>
);

// 본문 버튼 묶음. 플레이스 링크는 헤더·하단 바·푸터에 항상 있고, 본문에는 히어로에만 (place)
export const Actions = ({ sms = true, place = false }: { sms?: boolean; place?: boolean }) => (
  <div className="actions">
    <a className="btn-primary" href={tel}><IconPhone /><span>{CONTACT.phone}</span></a>
    {sms && <a className="btn-text" href={smsHref}><IconMsg /><span>누수사진 문자로 보내기</span><IconArrow /></a>}
    {place && <PlaceLink />}
  </div>
);

export const SectionHead = ({ no, title, sub }: { no: string; title: string; sub?: string }) => (
  <header className="sh" data-reveal>
    <span className="sh-no" aria-hidden="true">{no}</span>
    <h2>{title}</h2>
    {sub && <p>{sub}</p>}
  </header>
);

export const Ticker = ({ items }: { items: string[] }) => (
  <div className="ticker" aria-hidden="true">
    <div className="ticker-track">{[...items, ...items].map((x, i) => <span key={i}>{x}</span>)}</div>
  </div>
);

export const Header = () => (
  <header className="site-header">
    <div className="wrap header-inner">
      <Link href="/" className="logo" aria-label={`${BRAND} 홈`}>
        <img src="/img/logo-star.png" alt={`${BRAND} 누수탐지·누수공사 로고`} width={794} height={214} className="logo-img" />
      </Link>
      <nav className="nav" aria-label="주 메뉴">
        <Link href="/cases/" className="hide-m">시공 사진</Link>
        <Link href="/area/" className="hide-m">지역</Link>
        <a href={PLACE.url} className="nav-place hide-m" target="_blank" rel="noopener noreferrer"><IconPin />네이버 플레이스</a>
        <a href={tel} className="nav-call" aria-label={`전화 ${CONTACT.phone}`}><IconPhone /><span>{CONTACT.phone}</span></a>
      </nav>
    </div>
  </header>
);

export const Footer = () => (
  <footer className="site-footer">
    <div className="wrap foot-grid">
      <div>
        <strong className="foot-brand">{BRAND}</strong>
        <p>누수탐지 · 누수공사 · 하수구막힘 · 고압세척<br />일산·김포·파주·은평·마포·강서지역 출장상담 {CONTACT.hours}</p>
        <p><Link href="/area/">지역 안내</Link> · <Link href="/cases/">시공 사진</Link> · <Link href="/blog/">블로그</Link> · <a href="/rss.xml">RSS</a></p>
      </div>
      <ul className="foot-info">
        {BUSINESS.ceo && <li><span>대표</span>{BUSINESS.ceo}</li>}
        {BUSINESS.bizNumber && <li><span>사업자</span>{BUSINESS.bizNumber}</li>}
        <li><span>주소</span>{BUSINESS.address}</li>
        <li><span>전화</span><a href={tel}>{CONTACT.phone}</a></li>
        <li><span>지도·리뷰</span><a href={PLACE.url} target="_blank" rel="noopener noreferrer">네이버 플레이스(지도·리뷰) 보기</a></li>
      </ul>
    </div>
    <div className="wrap foot-bottom">© {new Date().getFullYear()} {BRAND} · 상담 때 받은 주소·연락처는 출동과 견적 안내에만 씁니다.</div>
  </footer>
);

export const StickyBar = () => (
  <div className="sticky-bar">
    <a href={tel} className="sb-call"><IconPhone />{CONTACT.phone}</a>
    <a href={PLACE.url} className="sb-place" target="_blank" rel="noopener noreferrer"><IconPin />플레이스 지도·리뷰</a>
  </div>
);
