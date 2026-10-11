# Bus Loop Rush — website

A dependency-free English/Vietnamese landing site for **Bus Loop Rush**, the bus-and-crowd color puzzle for Android and iOS. It is published with GitHub Pages:

- English: <https://nguyenvanlamm.github.io/bus-loop-rush-website/>
- Vietnamese: <https://nguyenvanlamm.github.io/bus-loop-rush-website/vi/>

### Pages for store submission

| Purpose | English | Vietnamese |
| --- | --- | --- |
| Support / issue forms | <https://nguyenvanlamm.github.io/bus-loop-rush-website/support/> | <https://nguyenvanlamm.github.io/bus-loop-rush-website/vi/support/> |
| Privacy policy | <https://nguyenvanlamm.github.io/bus-loop-rush-website/privacy/> | <https://nguyenvanlamm.github.io/bus-loop-rush-website/vi/privacy/> |
| Changelog | <https://nguyenvanlamm.github.io/bus-loop-rush-website/changelog/> | <https://nguyenvanlamm.github.io/bus-loop-rush-website/vi/changelog/> |

The store section is informational on purpose: Google Play and the App Store are both **coming soon**, with no made-up download links, dates, prices, ratings or reviews.

## Run locally

No build step. From this folder:

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000/
node scripts/validate.mjs
```

The validator checks all eight pages: language, canonical/hreflang/Open Graph URLs, JSON-LD (including that the FAQ markup matches the visible FAQ), local links and anchors, image alt text and sizes, self-hosted fonts, the issue forms, sitemap, robots, llms.txt, the 1200×630 social card, and that no page mentions the game that inspired it.

## Design and assets

The site uses the game's own "Jewel Transit" interface: plaza ground, jewel buttons on a dark lip, cream bus-ticket cards and navy plates. Every picture comes from the game itself: screenshots, the rule portholes from its lesson popups, and its car, bus and passenger art, exported with the game's dev tools (`tool/screens_test.dart`, `tool/popups_test.dart`, `tool/sprites_test.dart`).

Fonts are self-hosted copies of Google Fonts (SIL Open Font License, see `assets/fonts/LICENSES.md`). English pages use the game's Lilita One and Fredoka. Those have no Vietnamese letters, so Vietnamese pages use Baloo 2 and Nunito; the wordmark stays in Lilita One.

## Deployment

`.github/workflows/pages.yml` validates the site and deploys only the public files with GitHub Actions Pages on every push to `main` (or a manual run). The repository's Pages source must be **GitHub Actions**.

If the owner, repository name or host changes, update together: the canonical, hreflang, Open Graph and JSON-LD URLs in all eight pages, `sitemap.xml`, `robots.txt`, `llms.txt`, `scripts/validate.mjs` and this README.

`robots.txt` is scoped to the `/bus-loop-rush-website/` project path on GitHub Pages; it is not a domain-root robots policy.

## Store follow-up

Use the privacy and support URLs above in the Google Play and App Store listings. Before release, check that the in-app privacy link and the store privacy labels (Google Play Data safety, App Store App Privacy) match the shipped app: it collects no data, stores progress on the device and sells optional coin packs through the stores. This site is not a legal review and does not guarantee store approval.

Replace the two "Coming soon" labels with real store links only once each listing is public.
