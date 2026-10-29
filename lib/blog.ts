// 블로그 로더 — content/blog/*.md (프런트매터 + '##' 섹션). '_' 로 시작하는 파일은 비공개(예시·초안). 빌드 전용.
// 예약 공개: 프런트매터 date(없으면 publishedAt, YYYY-MM-DD KST)가 빌드일보다 미래면 목록·글·sitemap·rss·og 전부에서 빠진다.
// 빌드일 = env BUILD_DATE(YYYY-MM-DD) 또는 KST 오늘. scripts/make_og.py 도 같은 규칙.
import fs from 'node:fs';
import path from 'node:path';

// 블록은 본문 순서 그대로: 문자열 = 문단, { ol, items } = 목록('- ' 또는 '1. ')
export type Block = string | { ol: boolean; items: string[] };
export interface Section { h: string; blocks: Block[] }
export interface Post {
  slug: string; title: string; description: string; keyword: string; pattern?: string;
  publishedAt: string; sections: Section[];
}

const DIR = path.join(process.cwd(), 'content', 'blog');

function parse(raw: string) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const k = line.indexOf(':');
    if (k < 0) continue;
    meta[line.slice(0, k).trim()] = line.slice(k + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return { meta, body: m[2] };
}

function toSections(body: string): Section[] {
  const out: Section[] = [];
  let cur: Section | null = null;
  for (const line of body.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.*)$/);
    if (h) { if (cur) out.push(cur); cur = { h: h[1].trim(), blocks: [] }; continue; }
    if (!cur) continue;
    const li = line.match(/^(?:([-*])|\d+\.)\s+(.*)$/);
    if (li) {
      const ol = !li[1];
      const last = cur.blocks[cur.blocks.length - 1];
      if (typeof last === 'object' && last.ol === ol) last.items.push(li[2].trim());
      else cur.blocks.push({ ol, items: [li[2].trim()] });
    } else if (line.trim()) cur.blocks.push(line.trim());
  }
  if (cur) out.push(cur);
  return out;
}

export const BUILD_DATE = process.env.BUILD_DATE || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

let cache: Post[] | null = null;
export function getPosts(): Post[] {
  if (cache) return cache;
  let files: string[] = [];
  try { files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_')); } catch {}
  const posts = files.flatMap((f) => {
    const r = parse(fs.readFileSync(path.join(DIR, f), 'utf-8'));
    if (!r || !r.meta.slug || !r.meta.title) return [];
    const m = r.meta;
    const date = m.date || m.publishedAt || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > BUILD_DATE) return [];
    return [{ slug: m.slug, title: m.title, description: m.description || '', keyword: m.keyword || '', pattern: m.pattern, publishedAt: date, sections: toSections(r.body) }];
  });
  posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (cache = posts);
}

export function getPost(slug: string) {
  let key = slug;
  try { key = decodeURIComponent(slug); } catch {}
  return getPosts().find((p) => p.slug === key);
}

export const postPath = (p: Post) => `/blog/${p.slug}/`;
export const postEncodedPath = (p: Post) => `/blog/${encodeURIComponent(p.slug)}/`;
export const ogKey = (p: Post) => `blog-${p.slug}`; // public/og/blog-<slug>.jpg (scripts/make_og.py)
