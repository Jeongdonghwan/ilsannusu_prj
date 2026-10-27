import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CITIES, PLACES, openCities, cityPages, cityEncodedPath, pagePath, pageEncodedPath, inSitemap } from '../../../lib/data';
import { breadcrumbJsonLd, itemListJsonLd } from '../../../lib/jsonld';
import { Actions, IconArrow, JsonLd, SectionHead } from '../../../components/Common';
import { BRAND, shareMeta } from '../../../lib/site';

export const dynamicParams = false;
export function generateStaticParams() {
  return openCities().map((city) => ({ city }));
}
const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
const KIND: Record<string, string> = { 시구: '시·구', 생활권: '생활권·신도시', 동: '동', 읍면: '읍·면' };

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const city = dec(params.city);
  if (!CITIES[city]) return {};
  const title = `${city} 누수탐지 지역 안내 | ${BRAND}`;
  const description = `${CITIES[city].full} 누수탐지 안내 모음. ${city} 동네별 누수탐지 비용·가격·잘하는 곳·전문업체와 누수공사·하수구 막힘 페이지로 이어집니다.`;
  return { title, description, alternates: { canonical: cityEncodedPath(city) }, ...shareMeta(`area-${city}`, `${city} 누수탐지 지역 안내`, { title, description, url: cityEncodedPath(city) }) };
}

export default function CityHub({ params }: { params: { city: string } }) {
  const city = dec(params.city);
  const C = CITIES[city];
  if (!C) notFound();
  const pages = cityPages(city);
  const keys = Array.from(new Set(pages.map((p) => p.place)));
  const kinds = ['시구', '생활권', '동', '읍면'].filter((k) => keys.some((x) => PLACES[x].kind === k));
  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '지역', path: '/area/' }, { name: `${city} 누수탐지`, path: cityEncodedPath(city) }]),
        itemListJsonLd(pages.filter(inSitemap).map((p) => ({ name: p.kw, path: pageEncodedPath(p) }))),
      ]} />
      <div className="wrap content page-top">
        <p className="eyebrow dark">{C.full}</p>
        <h1 className="page-title">{city} 누수탐지 지역 안내</h1>
        <p className="prose-p">{C.full}는 {C.traits}입니다. {C.route}. 아래에서 동네와 궁금한 내용(비용·잘하는 곳·전문업체·누수공사)을 고르세요.</p>
        <Actions />
        {kinds.map((k, i) => (
          <section key={k} className="sec">
            <SectionHead no={String(i + 1).padStart(2, '0')} title={`${city} ${KIND[k]}`} />
            {keys.filter((x) => PLACES[x].kind === k).map((key) => (
              <div key={key} className="area-block" data-reveal>
                <h3>{PLACES[key].name} <small style={{ fontWeight: 500, color: 'var(--muted)' }}>· {PLACES[key].homes}</small></h3>
                <ul className="area-list">
                  {pages.filter((p) => p.place === key).map((p) => <li key={p.slug}><Link href={pagePath(p)}>{p.kw}</Link></li>)}
                </ul>
              </div>
            ))}
          </section>
        ))}
        <p><Link href="/area/" className="more">다른 시·구 보기 <IconArrow /></Link></p>
      </div>
    </main>
  );
}
