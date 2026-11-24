// title 점검 (빌드 없이 조합기를 직접 돈다, 2026-11-24): node scripts/title_check.js <OPEN_WAVE>
// title = "키워드 수식어 | 상호": 중복 0 · 앞부분 == h1(키워드 + 수식어) · 전체 40자 이하(넘으면 상호를 뺀다)
const fs = require('fs'), path = require('path'), os = require('os');
const ts = require('typescript');
process.env.OPEN_WAVE = process.argv[2] || '99';
const root = path.join(__dirname, '..'), out = fs.mkdtempSync(path.join(os.tmpdir(), 'tchk-'));
for (const f of fs.readdirSync(path.join(root, 'lib')).filter((x) => x.endsWith('.ts'))) {
  const js = ts.transpileModule(fs.readFileSync(path.join(root, 'lib', f), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
    .replace(/require\("(\.\.\/[^"]+\.json)"\)/g, (m, p) => `require(${JSON.stringify(path.resolve(root, 'lib', p))})`);
  fs.writeFileSync(path.join(out, f.replace(/\.ts$/, '.js')), js);
}
process.chdir(root);
const { OPEN_PAGES } = require(path.join(out, 'data.js')); const C = require(path.join(out, 'compose.js'));
const seen = new Map(); let branded = 0, neq = 0, over = 0, min = 999, max = 0, hmax = 0;
for (const p of OPEN_PAGES) {
  const c = C.compose(p); const sub = (c.ray || C.composeRay(p, c)).h1sub; const head = `${p.kw} ${sub}`;
  seen.set(c.title, (seen.get(c.title) || 0) + 1);
  if (c.title !== head && !(c.title.startsWith(`${head} | `) && !c.title.slice(head.length + 3).includes(' | '))) neq++;
  if (c.title !== head) branded++;
  if (c.title.length > 40) over++;
  min = Math.min(min, c.title.length); max = Math.max(max, c.title.length); hmax = Math.max(hmax, head.length);
}
const dup = [...seen.values()].filter((v) => v > 1).length;
console.log(`키워드 페이지 ${OPEN_PAGES.length} · title 중복 ${dup} · h1 과 다른 것 ${neq} · 길이 ${min}~${max}자(앞부분 최대 ${hmax}자) · 40자 넘는 것 ${over} · 상호 붙은 쪽 ${branded} · 상호 뺀 쪽 ${OPEN_PAGES.length - branded}`);
console.log('예:', OPEN_PAGES.slice(0, 2).map((p) => C.compose(p).title).join(' / '));
fs.rmSync(out, { recursive: true, force: true });
process.exit(dup || neq || over ? 1 : 0);
