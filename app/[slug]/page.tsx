import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OPEN_PAGES, PLACES, getPage, pagePath, pageEncodedPath, canonicalPath, cityPath, cityEncodedPath, related } from '../../lib/data';
import { compose, composeRay } from '../../lib/compose';
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, serviceJsonLd } from '../../lib/jsonld';
import { BRAND, shareMeta } from '../../lib/site';
import { Actions, IconArrow, JsonLd } from '../../components/Common';

export const dynamicParams = false;

// 순차 오픈: lib/site.ts 의 OPEN_WAVE 이하 페이지만 생성
export function generateStaticParams() {
  return OPEN_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPage(params.slug);
  if (!p) return {};
  const c = compose(p);
  const url = canonicalPath(p);
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: url },
    ...shareMeta(p.slug, `${p.kw} - ${BRAND}`, { title: c.title, description: c.description, url }),
  };
}

const fmt = (d: string) => d.replace(/-/g, '.');

export default function KeywordPage({ params }: { params: { slug: string } }) {
  const p = getPage(params.slug);
  if (!p) notFound();
  const c = compose(p);
  const r = composeRay(p, c);
  const P = PLACES[p.place];
  const rel = related(p);
  const path = pageEncodedPath(p);
  // 관련 링크 3묶음 — 본문 내부링크 합계 10~15개 (경로 3 + 아래 최대 12)
  const groups = [
    { h: `${P.name} 다른 안내`, items: rel.samePlace.slice(0, 4) },
    { h: `${p.city} 이웃 동네`, items: rel.sameCity.slice(0, 4) },
    { h: '다른 시·구', items: rel.otherCities.slice(0, 3) },
  ].filter((g) => g.items.length);
  const relList = groups.flatMap((g) => g.items).map((x) => ({ name: x.kw, path: pageEncodedPath(x) }));

  return (
    <main data-topic={`${p.service}|${p.mod}`}>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: '홈', path: '/' },
            { name: '지역', path: '/area/' },
            { name: `${p.city} 누수탐지`, path: cityEncodedPath(p.city) },
            { name: p.kw, path },
          ]),
          serviceJsonLd({ name: p.kw, type: p.service, description: c.description, path, area: P.admin }),
          faqJsonLd(c.faq),
          itemListJsonLd(relList.length ? relList : [{ name: `${p.city} 누수탐지 지역 안내`, path: cityEncodedPath(p.city) }]),
        ]}
      />

      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-text">
            <nav className="crumbs" aria-label="경로">
              <Link href="/">홈</Link><span>/</span><Link href="/area/">지역</Link><span>/</span><Link href={cityPath(p.city)}>{p.city}</Link>
            </nav>
            <p className="eyebrow">{r.cat}</p>
            <h1><span>{p.kw}</span>{' '}<span className="hero-sub">{r.h1sub}</span></h1>
            <p className="hero-lead">{c.lead}</p>
            <Actions place />
          </div>
          <figure className="hero-photo">
            <img src={`/img/${c.heroCase.img}.webp`} alt={`${p.kw} 관련 ${BRAND} 시공 사진 - ${c.heroCase.space}`} />
            <figcaption><b>시공 사진</b>{c.heroCase.space} · {fmt(c.heroCase.date)} 게시</figcaption>
          </figure>
        </div>
      </section>

      <div className="wrap ray-grid">
        <div className="ray-main">
          <section className="ray-sum" data-reveal>
            <h2>{p.kw} 핵심 요약</h2>
            <p>{r.summary}</p>
            <dl>{c.summary.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>
          <article className="ray-article">
            {r.sections.map((x, i) => (
              <section key={i}>
                <h2><span>{String(i + 1).padStart(2, '0')}</span>{x.h}</h2>
                <p>{x.p}</p>
              </section>
            ))}
          </article>
          <section className="ray-faq" id="faq">
            <h2>{p.kw} 자주 묻는 질문</h2>
            <div className="faq">
              {c.faq.map((f) => <details key={f.q}><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}
            </div>
          </section>
        </div>
        <aside className="ray-side">
          <h3>바로 확인</h3>
          <dl>{c.info.slice(0, 2).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <Actions sms={false} />
        </aside>
      </div>

      <div className="wrap ray-rel">
        <div className="related">
          {groups.map((g) => <div key={g.h}><h3>{g.h}</h3><ul>{g.items.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>)}
        </div>
      </div>

      <section className="closing">
        <div className="wrap" data-reveal>
          <h2>{c.closing.heading}</h2>
          <p>{c.closing.text}</p>
          <Actions />
        </div>
      </section>
    </main>
  );
}
