import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, postPath, postEncodedPath } from '../../lib/blog';
import { OPEN_PAGES, inSitemap, pagePath } from '../../lib/data';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';
import { Actions, IconArrow, JsonLd } from '../../components/Common';
import { BRAND, shareMeta } from '../../lib/site';

const TITLE = `누수 궁금증 블로그 | ${BRAND}`;
const DESC = `아랫집 누수 책임, 누수 보험, 수도요금이 갑자기 늘었을 때, 탐지 장비 차이처럼 누수탐지·누수공사·하수구 막힘에 대해 자주 받는 질문을 ${BRAND}가 글로 정리합니다.`;
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/blog/', types: { 'application/rss+xml': '/rss.xml' } },
  ...shareMeta('blog', `${BRAND} 누수 궁금증 블로그`, { title: TITLE, description: DESC, url: '/blog/' }),
};

const fmt = (d: string) => d.replace(/-/g, '.');

export default function BlogIndex() {
  const posts = getPosts();
  // 글이 없을 때도 목록이 비지 않게 열린 대표 페이지로 이어 준다
  const hubs = OPEN_PAGES.filter((p) => inSitemap(p) && p.city === '일산').slice(0, 8);
  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '블로그', path: '/blog/' }]),
        itemListJsonLd(posts.length
          ? posts.map((p) => ({ name: p.title, path: postEncodedPath(p) }))
          : hubs.map((p) => ({ name: p.kw, path: `/${encodeURIComponent(p.slug)}/` }))),
      ]} />
      <div className="wrap content page-top">
        <p className="eyebrow dark">블로그</p>
        <h1 className="page-title">누수 궁금증 블로그</h1>
        <p className="prose-p">상담 전화에서 자주 듣는 질문을 한 편에 하나씩 답합니다. 장비·절차·보험처럼 집집마다 공통인 내용이고, 현장마다 다른 비용은 적지 않습니다.</p>
        <section className="sec">
          <h2 className="area-h">최근 글</h2>
          {posts.length > 0 ? (
            <ol className="post-list">
              {posts.map((p) => (
                <li key={p.slug} data-reveal>
                  <Link href={postPath(p)}>
                    <span className="meta">{fmt(p.publishedAt)}</span>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="prose-p">첫 글을 준비하고 있습니다. 그동안 아래 안내 페이지를 참고해 주세요.</p>
          )}
        </section>
        <section className="sec">
          <h2 className="area-h">누수탐지 안내 페이지</h2>
          <ul className="linklist">{hubs.map((p) => <li key={p.slug}><Link href={pagePath(p)}>{p.kw}<IconArrow /></Link></li>)}</ul>
          <Actions />
        </section>
      </div>
    </main>
  );
}
