import { SITE_URL, SITE_NAME, BRAND, CONTACT, BUSINESS, PLACE } from './site';

export const businessJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Plumber',
  '@id': `${SITE_URL}/#business`,
  name: BRAND,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/img/case-04.jpg`,
  telephone: CONTACT.phone,
  founder: BUSINESS.ceo || undefined,
  address: {
    '@type': 'PostalAddress', addressCountry: 'KR', addressRegion: '경기도', addressLocality: '고양시 일산동구',
    streetAddress: '대산로31번길 29 1층',
  },
  geo: { '@type': 'GeoCoordinates', latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng },
  hasMap: PLACE.map,
  sameAs: [PLACE.url],
  areaServed: ['고양시 일산동구', '고양시 일산서구', '김포시', '파주시', '서울 은평구', '서울 마포구'],
  knowsAbout: ['누수탐지', '누수공사', '배관 누수', '하수구 막힘', '고압세척', '언수도 해빙'],
});

export const webSiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: 'ko',
  publisher: { '@id': `${SITE_URL}/#business` },
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
});

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const serviceJsonLd = (o: { name: string; type: string; description: string; path: string; area: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: o.name,
  serviceType: o.type,
  description: o.description,
  url: `${SITE_URL}${o.path}`,
  areaServed: { '@type': 'Place', name: o.area },
  provider: { '@id': `${SITE_URL}/#business` },
});

// 관련 페이지·허브 목록. path 는 인코딩된 경로
export const itemListJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${it.path}`, name: it.name })),
});
