# Bus Loop Rush — website

A dependency-free, English-only landing site for **Bus Loop Rush**, the bus-and-crowd color puzzle for Android and iOS. It is published with Netlify at <https://buslooprushld.lamnv.com/>.

### Pages for store submission

| Purpose | URL |
| --- | --- |
| Support / issue forms | <https://buslooprushld.lamnv.com/support/> |
| Privacy policy | <https://buslooprushld.lamnv.com/privacy/> |
| Changelog | <https://buslooprushld.lamnv.com/changelog/> |

The store section is informational on purpose: Google Play and the App Store are both **coming soon**, with no made-up download links, dates, prices, ratings or reviews.

## Run locally

No build step. From this folder:

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000/
node scripts/validate.mjs
```

The validator checks all four pages: language, canonical and Open Graph URLs, JSON-LD (including that the FAQ markup matches the visible FAQ), local links and anchors, image alt text and sizes, self-hosted fonts, the issue forms, sitemap, robots, llms.txt, the 1200×630 social card, that the site stays English-only, and that no page mentions the game that inspired it.

## Design and assets

The site uses the game's own "Jewel Transit" interface: plaza ground, jewel buttons on a dark lip, cream bus-ticket cards and navy plates. Every picture comes from the game itself: screenshots, the rule portholes from its lesson popups, and its car, bus and passenger art, exported with the game's dev tools (`tool/screens_test.dart`, `tool/popups_test.dart`, `tool/sprites_test.dart`).

Fonts are self-hosted copies of the game's own faces, Lilita One and Fredoka (SIL Open Font License, see `assets/fonts/LICENSES.md`), so the site makes no third-party requests.

## Deployment

Netlify builds the site from this GitHub repository on every push to `main` and makes a deploy preview for each pull request. `netlify.toml` runs the validator, copies only the public files into `_site/` and publishes that folder; a failed validation stops the deploy. The custom domain `buslooprushld.lamnv.com` is set in the Netlify site's domain settings, with a DNS `CNAME` record pointing to the site's `*.netlify.app` address.

`.github/workflows/pages.yml` still publishes the same files to GitHub Pages as a mirror; its pages declare the Netlify domain as canonical. Both files list the public files, so keep the two lists in step.

If the owner, repository name or host changes, update together: the canonical, Open Graph and JSON-LD URLs in all four pages, `sitemap.xml`, `robots.txt`, `llms.txt`, the hosting paragraph of the privacy policy, `.github/ISSUE_TEMPLATE/config.yml`, `scripts/validate.mjs` and this README.

`robots.txt` is the domain-root robots policy for `buslooprushld.lamnv.com`.

## Store follow-up

Use the privacy and support URLs above in the Google Play and App Store listings. Before release, check that the in-app privacy link and the store privacy labels (Google Play Data safety, App Store App Privacy) match the shipped app: it collects no data, stores progress on the device and sells optional coin packs through the stores. This site is not a legal review and does not guarantee store approval.

Replace the two "Coming soon" labels with real store links only once each listing is public.
