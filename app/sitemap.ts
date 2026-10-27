import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { OPEN_PAGES, PLACES, openCities, cityEncodedPath, pageEncodedPath, inSitemap } from '../lib/data';

// 빌드 시 out/sitemap.xml — 열린 단계(OPEN_WAVE)의 대표 페이지만 (표기 변형은 canonical 대상이라 제외)
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/area/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/cases/`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ...openCities().map((c) => ({ url: `${SITE_URL}${cityEncodedPath(c)}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...OPEN_PAGES.filter(inSitemap).map((p) => ({
      url: `${SITE_URL}${pageEncodedPath(p)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: PLACES[p.place].kind === '시구' ? 0.8 : PLACES[p.place].kind === '생활권' ? 0.7 : 0.6,
    })),
  ];
}
