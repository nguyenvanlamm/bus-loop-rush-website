#!/usr/bin/env node
// Checks the static site before it is published: every page's language,
// canonical/hreflang/Open Graph URLs, JSON-LD, local links and anchors,
// images, fonts, issue forms, sitemap, robots, llms.txt and the README.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://nguyenvanlamm.github.io/bus-loop-rush-website/';
const repo = 'https://github.com/nguyenvanlamm/bus-loop-rush-website';
const issueForms = {
  bug: `${repo}/issues/new?template=bug_report.yml`,
  feature: `${repo}/issues/new?template=feature_request.yml`,
  feedback: `${repo}/issues/new?template=feedback.yml`,
};
const pages = [
  { file: 'index.html', lang: 'en', canonical: base, languageHref: 'vi/index.html', type: 'VideoGame', mustContain: ['Bus Loop', 'How to play', 'Mystery cars', 'Coming soon'], faqCount: 5 },
  { file: 'vi/index.html', lang: 'vi', canonical: `${base}vi/`, languageHref: '../index.html', type: 'VideoGame', mustContain: ['Bus Loop', 'Cách chơi', 'Xe bom', 'Sắp ra mắt'], faqCount: 5 },
  { file: 'support/index.html', lang: 'en', canonical: `${base}support/`, languageHref: '../vi/support/', type: 'WebPage', mustContain: ['Report a bug', 'Suggest a feature', 'Send feedback'], issueForms: true },
  { file: 'vi/support/index.html', lang: 'vi', canonical: `${base}vi/support/`, languageHref: '../../support/', type: 'WebPage', mustContain: ['Báo lỗi', 'Đề xuất tính năng', 'Gửi phản hồi'], issueForms: true },
  { file: 'privacy/index.html', lang: 'en', canonical: `${base}privacy/`, languageHref: '../vi/privacy/', type: 'WebPage', mustContain: ['Stored by the app', 'Effective 11 October 2026'] },
  { file: 'vi/privacy/index.html', lang: 'vi', canonical: `${base}vi/privacy/`, languageHref: '../../privacy/', type: 'WebPage', mustContain: ['Ứng dụng lưu những gì', 'Hiệu lực từ 11/10/2026'] },
  { file: 'changelog/index.html', lang: 'en', canonical: `${base}changelog/`, languageHref: '../vi/changelog/', type: 'WebPage', mustContain: ['0.1.0', 'In development / unreleased'] },
  { file: 'vi/changelog/index.html', lang: 'vi', canonical: `${base}vi/changelog/`, languageHref: '../../changelog/', type: 'WebPage', mustContain: ['0.1.0', 'Đang phát triển / chưa phát hành'] },
];
// The game is an original clone: no names, logos or art of the game that inspired it.
const forbidden = [/bus traffic fever/i, /goodroid/i];

const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const read = (file) => readFileSync(join(root, file), 'utf8');

function localTarget(pageFile, reference) {
  const url = new URL(reference, new URL(`${base}${pageFile}`));
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.origin !== new URL(base).origin || !url.pathname.startsWith(new URL(base).pathname)) return null;
  const clean = url.pathname.slice(new URL(base).pathname.length) || 'index.html';
  return clean.endsWith('/') ? join(root, clean, 'index.html') : join(root, clean);
}

function localReferences(pageFile, html) {
  const found = [];
  const pattern = /<(?:a|area|link|script|img|source)\b[^>]+(?:href|src)=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(pattern)) {
    const ref = match[1];
    if (/^(mailto:|tel:|data:|javascript:)/.test(ref)) continue;
    const target = localTarget(pageFile, ref);
    if (target) found.push({ ref, target });
  }
  return found;
}

function checkFragments(pageFile, html) {
  for (const match of html.matchAll(/href=["']([^"']*#([^"']+))["']/gi)) {
    const target = localTarget(pageFile, match[1]);
    if (!target || !existsSync(target)) continue;
    check(new RegExp(`(?:id|name)=["']${match[2]}["']`).test(readFileSync(target, 'utf8')), `${pageFile}: missing fragment target #${match[2]}`);
  }
}

for (const page of pages) {
  const html = read(page.file);
  const enUrl = page.lang === 'en' ? page.canonical : page.canonical.replace('/vi/', '/');
  const viUrl = page.lang === 'vi' ? page.canonical : page.canonical.replace(base, `${base}vi/`);
  check(new RegExp(`<html\\s+lang=["']${page.lang}["']`, 'i').test(html), `${page.file}: html lang must be ${page.lang}`);
  check(html.includes(`<link rel="canonical" href="${page.canonical}">`), `${page.file}: canonical URL is missing or wrong`);
  check(html.includes(`<link rel="alternate" hreflang="en" href="${enUrl}">`), `${page.file}: English hreflang is missing or wrong`);
  check(html.includes(`<link rel="alternate" hreflang="vi" href="${viUrl}">`), `${page.file}: Vietnamese hreflang is missing or wrong`);
  check(html.includes(`<link rel="alternate" hreflang="x-default" href="${enUrl}">`), `${page.file}: x-default hreflang is missing or wrong`);
  check(/<title>[^<]+<\/title>/.test(html), `${page.file}: title is missing`);
  check(html.includes('<meta name="description" content="'), `${page.file}: meta description is missing`);
  check(html.includes(`<meta property="og:url" content="${page.canonical}">`), `${page.file}: Open Graph URL must match canonical`);
  check(html.includes(`<meta property="og:image" content="${base}assets/social-card.png">`), `${page.file}: absolute social image is missing`);
  check(html.includes(`<meta name="twitter:image" content="${base}assets/social-card.png">`), `${page.file}: twitter image is missing`);
  check(html.includes(`href="${page.languageHref}"`), `${page.file}: language switch does not point to the equivalent page`);
  const references = localReferences(page.file, html);
  const localeRoot = page.lang === 'vi' ? 'vi/' : '';
  for (const route of ['support', 'privacy', 'changelog']) {
    check(references.some(({ target }) => target === join(root, localeRoot, route, 'index.html')), `${page.file}: missing localized ${route} navigation`);
  }
  const brandHref = html.match(/<a class="brand" href="([^"]+)"/)?.[1];
  check(brandHref && localTarget(page.file, brandHref) === join(root, localeRoot, 'index.html'), `${page.file}: brand must link to the localized home`);
  check(html.includes('class="footer-links"'), `${page.file}: footer links are missing`);
  for (const marker of page.mustContain) check(html.includes(marker), `${page.file}: expected content missing: ${marker}`);
  for (const pattern of forbidden) check(!pattern.test(html), `${page.file}: must not mention ${pattern}`);
  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    check(/\salt="[^"]*"/.test(img[0]), `${page.file}: image without alt: ${img[0].slice(0, 80)}`);
    check(/\swidth="\d+"/.test(img[0]) && /\sheight="\d+"/.test(img[0]), `${page.file}: image without width/height: ${img[0].slice(0, 80)}`);
  }
  if (page.faqCount !== undefined) check((html.match(/<details\b/g) ?? []).length === page.faqCount, `${page.file}: landing FAQ must contain exactly ${page.faqCount} questions`);
  if (page.issueForms) {
    for (const url of Object.values(issueForms)) check(html.includes(url), `${page.file}: issue form link missing: ${url}`);
    check(!/<form\b/i.test(html), `${page.file}: support page must not add a fake on-page form`);
  }

  const jsonScripts = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  check(jsonScripts.length === 1, `${page.file}: expected one JSON-LD script`);
  if (jsonScripts.length === 1) {
    try {
      const data = JSON.parse(jsonScripts[0][1]);
      const nodes = Array.isArray(data['@graph']) ? data['@graph'] : [data];
      const primary = nodes.find((node) => node['@type'] === page.type);
      check(primary, `${page.file}: JSON-LD must include ${page.type}`);
      if (primary) {
        check(primary.url === page.canonical, `${page.file}: JSON-LD URL must match canonical`);
        if (page.type === 'VideoGame') {
          check(['Android', 'iOS'].every((p) => primary.gamePlatform?.includes(p)), `${page.file}: JSON-LD platforms must include Android and iOS`);
        } else {
          check(primary.inLanguage === page.lang, `${page.file}: WebPage JSON-LD language must match the page`);
        }
      }
      for (const node of nodes) {
        check(!('offers' in node) && !('aggregateRating' in node) && !('review' in node), `${page.file}: JSON-LD must not invent offers, ratings or reviews`);
      }
      if (page.faqCount !== undefined) {
        const faq = nodes.find((node) => node['@type'] === 'FAQPage');
        check(faq?.mainEntity?.length === page.faqCount, `${page.file}: FAQPage JSON-LD must list exactly ${page.faqCount} questions`);
        const summaries = [...html.matchAll(/<summary><span>([^<]+)<\/span>/g)].map((m) => m[1]);
        (faq?.mainEntity ?? []).forEach((entity, i) => {
          check(entity.name === summaries[i], `${page.file}: FAQ question ${i + 1} differs from the visible one`);
          const visible = html.match(new RegExp(`<summary><span>${summaries[i]?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</span><b aria-hidden="true">\\+</b></summary><p>([^<]+)</p>`))?.[1];
          check(entity.acceptedAnswer?.text === visible, `${page.file}: FAQ answer ${i + 1} differs from the visible one`);
        });
      }
    } catch (error) {
      errors.push(`${page.file}: JSON-LD is not valid JSON (${error.message})`);
    }
  }

  for (const { ref, target } of references) check(existsSync(target), `${page.file}: broken local reference ${ref}`);
  checkFragments(page.file, html);
}

const fontsCss = read('assets/fonts/fonts.css');
for (const match of fontsCss.matchAll(/url\('([^']+)'\)/g)) check(existsSync(join(root, 'assets/fonts', match[1])), `fonts.css: missing font file ${match[1]}`);
check(!/fonts\.(googleapis|gstatic)\.com/.test(fontsCss + read('styles.css')), 'fonts must be self-hosted');

const socialCard = join(root, 'assets/social-card.png');
check(existsSync(socialCard), 'assets/social-card.png is missing');
if (existsSync(socialCard)) {
  const png = readFileSync(socialCard);
  check(png.subarray(0, 8).toString('hex') === '89504e470d0a1a0a', 'assets/social-card.png is not a PNG');
  check(png.readUInt32BE(16) === 1200 && png.readUInt32BE(20) === 630, 'assets/social-card.png must be 1200x630');
}

for (const file of ['bug_report.yml', 'feature_request.yml', 'feedback.yml']) {
  const template = join(root, '.github/ISSUE_TEMPLATE', file);
  check(existsSync(template), `.github/ISSUE_TEMPLATE/${file} is missing`);
  if (existsSync(template)) {
    const yaml = readFileSync(template, 'utf8');
    for (const key of ['name', 'description', 'title']) check(new RegExp(`^${key}:\\s*.+`, 'm').test(yaml), `${file}: ${key} is missing`);
    check(/^body:\s*$/m.test(yaml), `${file}: body is missing`);
    check(!/^labels:/m.test(yaml), `${file}: do not reference labels that may not exist`);
  }
}
check(/^blank_issues_enabled:\s*false\s*$/m.test(read('.github/ISSUE_TEMPLATE/config.yml')), 'issue template config must disable blank issues');

const sitemap = read('sitemap.xml');
for (const page of pages) check(sitemap.includes(`<loc>${page.canonical}</loc>`), `sitemap.xml is missing ${page.canonical}`);
check((sitemap.match(/<loc>/g) ?? []).length === pages.length, `sitemap.xml must contain exactly ${pages.length} routes`);
check(read('robots.txt').includes(`Sitemap: ${base}sitemap.xml`), 'robots.txt must point to sitemap.xml');
const llms = read('llms.txt');
for (const page of pages) check(llms.includes(page.canonical), `llms.txt is missing ${page.canonical}`);
check(llms.includes('not a guarantee of AI ranking'), 'llms.txt must state its factual, non-ranking purpose');
const readme = read('README.md');
for (const route of ['support/', 'privacy/', 'changelog/']) check(readme.includes(`${base}${route}`), `README is missing the ${route} URL`);
check(readme.includes('privacy labels'), 'README must document the store privacy follow-up');
check(readme.includes('not a domain-root robots policy'), 'README must document the project-path robots scope');

if (errors.length) {
  console.error(`Static validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Static validation passed: ${pages.length} pages, metadata/JSON-LD, links/anchors, images, fonts, issue forms, sitemap/robots/llms and social card.`);
