// 데이터 로더 — data/site-pages.json(키워드 페이지), places.json(지역), cases.json(시공 사진). 빌드 전용.
import pagesData from '../data/site-pages.json';
import placesData from '../data/places.json';
import casesData from '../data/cases.json';
import { OPEN_WAVE, MERGE_VARIANTS } from './site';

export interface Page {
  n: number; kw: string; slug: string; label: string; place: string; city: string;
  service: string; mod: string; prio: number; wave: number; added: boolean; variantOf?: string;
}
export interface Place { key: string; name: string; city: string; admin: string; kind: string; homes: string; spots: string[]; note: string }
export interface City { full: string; route: string; traits: string }
export interface Case { uid: number; title: string; date: string; img: string; scene: string; space: string; tags: string[] }

export const ALL_PAGES = pagesData.pages as Page[];
export const OPEN_PAGES = ALL_PAGES.filter((p) => p.wave <= OPEN_WAVE);
const openSet = new Set(OPEN_PAGES.map((p) => p.slug));
export const isOpen = (slug: string) => openSet.has(slug);

export const PLACES = placesData.places as Record<string, Place>;
export const CITIES = placesData.cities as Record<string, City>;
export const CITY_ORDER = ['일산', '김포', '파주', '은평구', '마포'];
export const CASES = casesData.cases as Case[];

export const pagePath = (p: Page) => `/${p.slug}/`;
export const pageEncodedPath = (p: Page) => `/${encodeURIComponent(p.slug)}/`;
export const cityPath = (city: string) => `/area/${city}/`;
export const cityEncodedPath = (city: string) => `/area/${encodeURIComponent(city)}/`;

// canonical: 스위치가 켜져 있고 대표 페이지가 열려 있으면 대표 페이지로
export const canonicalPath = (p: Page) =>
  MERGE_VARIANTS && p.variantOf && openSet.has(p.variantOf) ? `/${encodeURIComponent(p.variantOf)}/` : pageEncodedPath(p);
export const inSitemap = (p: Page) => canonicalPath(p) === pageEncodedPath(p);

export function getPage(slug: string): Page | undefined {
  let key = slug;
  try { key = decodeURIComponent(slug); } catch {}
  return OPEN_PAGES.find((p) => p.slug === key);
}

export const openCities = () => CITY_ORDER.filter((c) => OPEN_PAGES.some((p) => p.city === c));
export const cityPages = (city: string) => OPEN_PAGES.filter((p) => p.city === city);

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
};
export const seedOf = hash;
export const rotate = <T,>(arr: T[], seed: string, salt = ''): T[] => {
  if (!arr.length) return arr;
  const k = hash(`${seed}::${salt}`) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
};

// 관련 페이지 — 열린 대표 페이지만. 같은 장소 다른 관점 / 같은 시·구 이웃 장소 / 다른 시·구 같은 관점
export function related(p: Page) {
  const pool = OPEN_PAGES.filter((x) => x.slug !== p.slug && inSitemap(x));
  const samePlace = pool.filter((x) => x.place === p.place);
  const sameCity = rotate(pool.filter((x) => x.city === p.city && x.place !== p.place && x.mod === p.mod && x.service === p.service), p.slug, 'rel').slice(0, 8);
  const otherCities = pool.filter((x) => x.city !== p.city && PLACES[x.place].kind === '시구' && x.mod === p.mod && x.service === p.service).slice(0, 6);
  return { samePlace, sameCity, otherCities };
}

// 시공 사진 배정 — 서비스 태그가 맞는 사진을 앞에 두고 슬러그 해시로 돌린다 (지역은 게시판에 없어 배정 기준이 아님)
export function casesFor(p: Page, n = 3): Case[] {
  const want = p.service === '누수탐지' ? (p.mod === '비용' || p.mod === '가격' ? '누수공사' : '누수탐지') : p.service;
  const fit = rotate(CASES.filter((c) => c.tags.includes(want)), p.slug, 'case');
  const rest = rotate(CASES.filter((c) => !c.tags.includes(want)), p.slug, 'case2');
  return [...fit, ...rest].slice(0, n);
}
