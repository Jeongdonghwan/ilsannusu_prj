import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header, Footer, StickyBar, JsonLd } from '../components/Common';
import Motion from '../components/Motion';
import { businessJsonLd, webSiteJsonLd } from '../lib/jsonld';
import { SITE_URL, BRAND, NAVER_VERIFY, GOOGLE_VERIFY } from '../lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND} | 일산 누수탐지·누수공사`, template: `%s` },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  verification: { google: GOOGLE_VERIFY || undefined, other: NAVER_VERIFY ? { 'naver-site-verification': NAVER_VERIFY } : undefined },
};

export const viewport: Viewport = { themeColor: '#0a1d30', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>
        <JsonLd data={[businessJsonLd(), webSiteJsonLd()]} />
        <Header />
        {children}
        <Footer />
        <StickyBar />
        <Motion />
        <script dangerouslySetInnerHTML={{ __html: "document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'',k=h.indexOf('tel:')===0?'tel':h.indexOf('sms:')===0?'sms':/kakao/.test(h)?'kakao':'';if(k&&navigator.sendBeacon)navigator.sendBeacon('/_t?e='+k+'&p='+encodeURIComponent(location.pathname))},true)" }} />
      </body>
    </html>
  );
}
