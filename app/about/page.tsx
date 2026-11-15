// 소개 — 사실만 평서문으로 (무엇을·어디서·어떻게 연락). site.ts 와 데이터에 있는 것만 쓴다. 없는 정보는 줄을 내지 않는다.
import type { Metadata } from 'next';
import Link from 'next/link';
import { openCities } from '../../lib/data';
import { BLOG, BRAND, BUSINESS, CONTACT, PLACE, UPDATED, shareMeta, tel, smsHref } from '../../lib/site';
import { breadcrumbJsonLd, businessJsonLd } from '../../lib/jsonld';
import { JsonLd } from '../../components/Common';

const TITLE = `소개 | ${BRAND}`;
const DESC = `누수탐지·누수공사·하수구막힘·고압세척을 하는 ${BRAND} 소개입니다. 하는 일, 다니는 지역, 연락 방법을 사실대로 정리했습니다.`;
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/about/' },
  ...shareMeta('home', `${BRAND} 소개`, { title: TITLE, description: DESC, url: '/about/' }),
};

export default function About() {
  return (
    <main>
      <JsonLd data={[businessJsonLd(), breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '소개', path: '/about/' }])]} />
      <div className="wrap content page-top">
        <h1 className="page-title">{BUSINESS.name} 소개</h1>
        <p className="prose-p">{BUSINESS.name}는 누수탐지, 누수공사, 하수구막힘, 고압세척 작업을 합니다.</p>
        <section className="sec">
          <h2 className="area-h">하는 일</h2>
          <p className="prose-p">누수 위치를 장비로 찾고, 찾은 부위의 배관을 고칩니다. 막힌 하수구를 뚫고 고압세척을 합니다. 작업 사진은 <Link href="/cases/">시공 사진</Link>에 있습니다.</p>
        </section>
        <section className="sec">
          <h2 className="area-h">다니는 지역</h2>
          <p className="prose-p">{openCities().join(', ')} 지역을 다닙니다. 동네별 안내는 <Link href="/area/">지역별 안내</Link>에 있습니다.</p>
        </section>
        <section className="sec">
          <h2 className="area-h">연락 방법</h2>
          <p className="prose-p">전화 <a href={tel}>{CONTACT.phone}</a>, 문자 <a href={smsHref}>{CONTACT.sms}</a>{CONTACT.hours && ` (${CONTACT.hours})`}로 받습니다.</p>
          {BUSINESS.address && <p className="prose-p">주소는 {BUSINESS.address}입니다.</p>}
          {BUSINESS.ceo && <p className="prose-p">대표는 {BUSINESS.ceo}입니다.</p>}
          {BUSINESS.bizNumber && <p className="prose-p">사업자등록번호는 {BUSINESS.bizNumber}입니다.</p>}
          <p className="prose-p"><a href={PLACE.url} target="_blank" rel="noopener noreferrer">네이버 플레이스</a>{BLOG && <> · <a href={BLOG} target="_blank" rel="noopener noreferrer">네이버 블로그</a></>}</p>
        </section>
        <p className="prose-p">이 페이지의 최종 수정일은 <time dateTime={UPDATED}>{UPDATED}</time>입니다.</p>
      </div>
    </main>
  );
}
