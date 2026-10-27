import type { Metadata } from 'next';
import Link from 'next/link';
import { CITIES, OPEN_PAGES, PLACES, openCities, cityPages, cityPath, cityEncodedPath, pagePath, pageEncodedPath, inSitemap } from '../../lib/data';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';
import { IconArrow, JsonLd } from '../../components/Common';
import { BRAND, shareMeta } from '../../lib/site';

const TITLE = `지역별 누수탐지 안내 | ${BRAND}`;
const DESC = '일산·김포·파주·은평구·마포 지역별 누수탐지 안내. 시·구, 생활권, 동·읍면별로 비용·잘하는 곳·전문업체·누수공사 페이지를 모았습니다.';
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/area/' },
  ...shareMeta('area', '지역별 누수탐지 안내', { title: TITLE, description: DESC, url: '/area/' }),
};

// 열린 모든 키워드 페이지로 가는 크롤 경로 (시·구별)
export default function AreaIndex() {
  const cities = openCities();
  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '지역', path: '/area/' }]),
        itemListJsonLd([
          ...cities.map((c) => ({ name: `${c} 누수탐지 지역 안내`, path: cityEncodedPath(c) })),
          ...OPEN_PAGES.filter(inSitemap).map((p) => ({ name: p.kw, path: pageEncodedPath(p) })),
        ]),
      ]} />
      <div className="wrap content page-top">
        <p className="eyebrow dark">지역</p>
        <h1 className="page-title">지역별 누수탐지 안내</h1>
        <p className="prose-p">{BRAND}가 다니는 지역의 안내 페이지입니다. 지금 {OPEN_PAGES.length.toLocaleString()}개가 열려 있습니다.</p>
        <section className="sec">
          <h2 className="area-h">시·구</h2>
          <div className="cities">
            {cities.map((city) => (
              <Link key={city} href={cityPath(city)} className="city-row">
                <div><b>{city}</b><span>{CITIES[city].full}</span></div>
                <em>{cityPages(city).length}</em>
              </Link>
            ))}
          </div>
        </section>
        {cities.map((city) => (
          <section key={city} className="sec">
            <h2 className="area-h"><Link href={cityPath(city)}>{city} <IconArrow /></Link></h2>
            {Array.from(new Set(cityPages(city).map((p) => p.place))).map((key) => (
              <div key={key} className="area-block">
                <h3>{PLACES[key].name}</h3>
                <ul className="area-list">
                  {cityPages(city).filter((p) => p.place === key).map((p) => <li key={p.slug}><Link href={pagePath(p)}>{p.kw}</Link></li>)}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
