import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OPEN_PAGES, PLACES, getPage, pagePath, pageEncodedPath, canonicalPath, cityPath, cityEncodedPath, related } from '../../lib/data';
import { compose } from '../../lib/compose';
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, serviceJsonLd } from '../../lib/jsonld';
import { BRAND, shareMeta } from '../../lib/site';
import { Actions, IconArrow, JsonLd, SectionHead, Ticker } from '../../components/Common';

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
  const P = PLACES[p.place];
  const rel = related(p);
  const path = pageEncodedPath(p);
  const relList = [...rel.samePlace, ...rel.sameCity, ...rel.otherCities].map((x) => ({ name: x.kw, path: pageEncodedPath(x) }));
  const [first, ...restWords] = p.kw.split(' ');
  const h1b = restWords.join(' ');
  const signPhoto = c.cases.items[1] || c.cases.items[0];

  return (
    <main>
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
            <p className="eyebrow">{c.eyebrow}</p>
            <h1><span><i>{first}</i></span>{h1b && <span><i>{h1b}</i></span>}</h1>
            <p className="hero-lead">{c.lead}</p>
            <Actions place />
          </div>
          <figure className="hero-photo">
            <img src={`/img/${c.heroCase.img}.webp`} alt={`${p.kw} 관련 ${BRAND} 시공 사진 - ${c.heroCase.space}`} />
            <figcaption><b>시공 사진</b>{c.heroCase.space} · {fmt(c.heroCase.date)} 게시</figcaption>
          </figure>
        </div>
      </section>

      <div className="wrap">
        <section className="answer" aria-label="요약" data-reveal>
          <p>{c.answer}</p>
          <dl>{c.summary.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>
      </div>

      <Ticker items={c.ticker} />

      <div className="wrap content">
        <section className="sec">
          <SectionHead no="01" title={c.region.heading} />
          <div className="cols">
            <div className="prose" data-reveal>
              {c.intro.map((t, i) => <p key={i} className={i === 0 ? 'first' : ''}>{t}</p>)}
              {c.region.paras.map((t, i) => <p key={`r${i}`}>{t}</p>)}
            </div>
            <aside className="memo" data-reveal>
              <h3>{P.name} 주변</h3>
              <ol>{c.region.spots.map((h) => <li key={h}>{h}</li>)}</ol>
              {c.region.nearby.length > 0 && <><h3>같이 다니는 동네</h3><p>{c.region.nearby.join(' · ')}</p></>}
            </aside>
          </div>
        </section>

        <section className="sec mist">
          <SectionHead no="02" title={c.view.heading} />
          <div className="prose" data-reveal>{c.view.paras.map((t, i) => <p key={i}>{t}</p>)}</div>
          {c.view.table && <dl className="spec" data-reveal>{c.view.table.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
          {c.view.list && <>
            <h3 className="h3-sub" data-reveal>{c.view.list.title}</h3>
            <ol className="memo-list reveal-group">{c.view.list.items.map((x) => <li key={x}>{x}</li>)}</ol>
          </>}
        </section>

        <section className="sec">
          <SectionHead no="03" title={c.symptoms.heading} />
          <div className="signs">
            <ul className="reveal-group">{c.symptoms.items.map((x) => <li key={x}>{x}</li>)}</ul>
            <figure data-reveal>
              <img src={`/img/${signPhoto.c.img}.webp`} alt={`${p.kw} 확인 장면 - ${signPhoto.c.space}`} loading="lazy" />
              <figcaption>{signPhoto.c.space} · {BRAND} 시공 사진</figcaption>
            </figure>
          </div>
        </section>
      </div>

      <section className="band">
        <div className="wrap">
          <SectionHead no="04" title={c.tools.heading} sub={c.tools.text} />
          <ol className="tools reveal-group">
            {c.tools.items.map((t) => <li key={t.name}><div><h3>{t.name}</h3><p>{t.d}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="cta-band" data-reveal>
        <div className="wrap cta-band-in">
          <p>{c.cta}</p>
          <Actions sms={false} />
        </div>
      </section>

      <div className="wrap content">
        <section className="sec">
          <SectionHead no="05" title={c.cases.heading} sub="기존 홈페이지 현장사진 게시판에 올린 사진입니다. 게시판에 지역이 적혀 있지 않아 장소는 표시하지 않았습니다." />
          <div className="shots">
            {c.cases.items.map(({ c: k, caption }, i) => (
              <figure key={k.img} data-reveal style={{ transitionDelay: `${i * 80}ms` }} tabIndex={0}>
                <img src={`/img/${k.img}.webp`} alt={`${p.kw} - ${k.scene}`} loading="lazy" />
                <figcaption><b>{fmt(k.date)} · {k.space}</b>{caption}</figcaption>
              </figure>
            ))}
          </div>
          <p className="case-note" data-reveal><Link href="/cases/" className="more">시공 사진 전체 보기 <IconArrow /></Link></p>
        </section>

        <section className="sec mist">
          <SectionHead no="06" title={c.stepsHeading} />
          <ol className="flow reveal-group">
            {c.steps.map((st) => <li key={st.title}><strong>{st.title}</strong><p>{st.text}</p></li>)}
          </ol>
        </section>

        <section className="sec">
          <SectionHead no="07" title={`${P.name} 상담 안내`} />
          <dl className="info" data-reveal>{c.info.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>

        <section className="sec mist" id="faq">
          <SectionHead no="08" title="자주 묻는 질문" />
          <div className="faq">
            {c.faq.map((f) => <details key={f.q} data-reveal><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}
          </div>
        </section>

        <section className="sec">
          <SectionHead no="09" title={`${p.kw} 관련 안내`} />
          <div className="related">
            {rel.samePlace.length > 0 && <div><h3>{P.name} 다른 안내</h3><ul>{rel.samePlace.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
            {rel.sameCity.length > 0 && <div><h3>{p.city} 이웃 동네</h3><ul>{rel.sameCity.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
            <div><h3>다른 시·구</h3><ul>
              {rel.otherCities.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}
              <li><Link href={cityPath(p.city)}>{p.city} 누수탐지 지역 전체<IconArrow /></Link></li>
            </ul></div>
          </div>
        </section>
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
