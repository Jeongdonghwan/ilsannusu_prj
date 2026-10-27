import type { Metadata } from 'next';
import Link from 'next/link';
import { CASES, OPEN_PAGES, inSitemap, pagePath } from '../../lib/data';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';
import { Actions, IconArrow, JsonLd } from '../../components/Common';
import { BRAND, SITE_URL, shareMeta } from '../../lib/site';

const TITLE = `시공 사진 | ${BRAND} 누수탐지·누수공사 현장`;
const DESC = `${BRAND} 현장사진 게시판의 시공 사진 7장. 열화상 카메라·습도계·가스식 탐지기로 찾고, 발생 부위만 열어 배관을 고치는 과정을 사진으로 봅니다.`;
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/cases/' },
  ...shareMeta('cases', `${BRAND} 시공 사진`, { title: TITLE, description: DESC, url: '/cases/' }),
};

const fmt = (d: string) => d.replace(/-/g, '.');
// 사진의 태그(서비스)로 이어지는 열린 대표 페이지 하나
const linkFor = (tag: string) => OPEN_PAGES.find((p) => inSitemap(p) && p.city === '일산' && (p.service === tag || (tag === '누수탐지' && p.service === '누수탐지' && !p.mod)));

export default function Cases() {
  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '시공 사진', path: '/cases/' }]),
        {
          '@context': 'https://schema.org', '@type': 'ItemList',
          itemListElement: CASES.map((k, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'ImageObject', contentUrl: `${SITE_URL}/img/${k.img}.jpg`, name: k.space, description: k.scene, uploadDate: k.date } })),
        },
        itemListJsonLd(OPEN_PAGES.filter((p) => inSitemap(p) && p.city === '일산' && !p.mod).slice(0, 12).map((p) => ({ name: p.kw, path: `/${encodeURIComponent(p.slug)}/` }))),
      ]} />
      <div className="wrap content page-top">
        <p className="eyebrow dark">현장사진 게시판</p>
        <h1 className="page-title">시공 사진</h1>
        <p className="prose-p">기존 홈페이지 현장사진 게시판(2026.02.24 게시)에 올린 사진입니다. 게시글에는 제목('{BRAND}')과 사진만 있고 지역·설명이 없어, 사진에 보이는 장면만 적었습니다.</p>
        <ol className="case-list">
          {CASES.map((k, i) => {
            const lk = linkFor(k.tags[0]);
            return (
              <li key={k.img} data-reveal>
                <figure><img src={`/img/${k.img}.webp`} alt={`${BRAND} 시공 사진 ${i + 1} - ${k.scene}`} loading={i < 2 ? 'eager' : 'lazy'} /></figure>
                <div>
                  <p className="meta">{String(i + 1).padStart(2, '0')} · {fmt(k.date)} 게시</p>
                  <h2>{k.space}</h2>
                  <p>{k.scene}.</p>
                  <p className="meta">관련 작업: {k.tags.join(' · ')}</p>
                  {lk && <p><Link href={pagePath(lk)} className="more">{lk.kw} 안내 <IconArrow /></Link></p>}
                </div>
              </li>
            );
          })}
        </ol>
        <section className="sec">
          <h2 className="area-h">현장 사진을 보내 주시면</h2>
          <p className="prose-p">젖은 곳, 계량기, 보일러 압력계를 찍어 문자로 보내 주시면 통화 때 바로 이어서 설명드립니다.</p>
          <Actions />
        </section>
      </div>
    </main>
  );
}
