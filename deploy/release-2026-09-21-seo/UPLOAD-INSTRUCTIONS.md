# Release 2026-09-21 — SEO rebuild of the customer website

This release replaces the one-page site with 14 prerendered pages. Every service, price, review, opening hour and FAQ answer is now in the HTML itself, instead of being loaded by JavaScript from the API. It also fixes the site-wide soft 404, turns `/location` into a real redirect, and redirects `www` to the main address.

## What's in it, and what isn't

| Part | In this release? |
| --- | --- |
| Customer website (`alisbarbershop.com`) | **Yes** — `customer-website.zip` |
| Dashboard (`manage.alisbarbershop.com`) | No. Leave it alone. |
| Laravel API (`api.alisbarbershop.com`) | No. No PHP files, no migrations, no `artisan` commands. |
| Database | No changes. |

The booking widget still calls the live API exactly as it did before. The API's CORS settings already allow `alisbarbershop.com`, so the new pages need no backend change.

The two 2026-09-19 releases stay retracted. According to their notes, those install-card changes were removed from the source, so this build does not contain them.

## Before you start (5 minutes)

1. **Back up the live site.** In hPanel go to **Websites → Manage → Files → File Manager**, open `public_html`, and download `index.html` and `.htaccess` at minimum. The full-site backup under **Files → Backups** also works.
2. **Open the live `.htaccess` and read it.** If it contains lines you or Hostinger added (for example a force-HTTPS block or anything that isn't the old SPA rules), copy them somewhere. You'll add them back in step 4. Do **not** keep this old line, which causes the soft 404:
   ```
   RewriteRule . /index.html [L]
   ```
3. Keep `customer-website.zip` and `SHA256SUMS.txt` together. To confirm the download isn't corrupted, run this in PowerShell and compare the result with `SHA256SUMS.txt`:
   ```powershell
   Get-FileHash .\customer-website.zip -Algorithm SHA256
   ```

## Deploy

1. In **File Manager**, open `public_html` (the folder that holds the current `index.html`).
2. **Upload** `customer-website.zip` into `public_html`.
3. Right-click the zip → **Extract** → extract into `public_html` itself, not into a new subfolder. Allow it to **overwrite** existing files.
   - The zip has its files at the top level. After extracting you should see `index.html`, `services/`, `faq/`, `about-ali/` and so on directly inside `public_html`. If you see `public_html/dist/` or `public_html/customer-website/`, the extraction went one level too deep. Move the contents up.
   - **Don't delete the old files in `public_html/assets/`.** Visitors with an open tab may still need them. They're harmless and you can remove them in a week or so.
4. If you saved custom `.htaccess` lines in step 2 of "Before you start", open the new `.htaccess` and add them near the top. Otherwise leave it as is.
5. **Delete** `customer-website.zip` from `public_html`.
6. **Purge the CDN cache. Don't skip this.** The live site is served through Hostinger's CDN (`Server: hcdn`), which caches pages. In hPanel go to **Websites → Manage → Performance → CDN** and click **Purge all** (sometimes labelled **Flush cache**). If **LiteSpeed Cache** is also enabled for the site, purge that too.

The site is never down during this. Each file is replaced in place.

## Verify (Windows PowerShell or any terminal)

Run each check. `curl.exe` is built into Windows 11.

```powershell
curl.exe -sI https://alisbarbershop.com/                       # 200
curl.exe -sI https://alisbarbershop.com/services/              # 200
curl.exe -sI https://alisbarbershop.com/about-ali/             # 200
curl.exe -sI https://alisbarbershop.com/does-not-exist         # 404   (was 200 — the soft 404 fix)
curl.exe -sI https://alisbarbershop.com/location               # 301 → google.com/maps (was 200)
curl.exe -sI https://www.alisbarbershop.com/                   # 301 → https://alisbarbershop.com/ (was 200)
curl.exe -sI https://alisbarbershop.com/faq                    # 301 → /faq/
curl.exe -sI https://alisbarbershop.com/sitemap.xml            # 200
```

Then check that the content is in the HTML itself, not loaded later by JavaScript:

```powershell
curl.exe -s https://alisbarbershop.com/ | Select-String -SimpleMatch "Barber Shop in Pinellas Park" | Measure-Object | % Count   # 1 or more
curl.exe -s https://alisbarbershop.com/ | Select-String -SimpleMatch '$30' | Measure-Object | % Count                          # 1 or more
```

If you see the old page or an old `200` for `/does-not-exist`, the CDN is still serving cached copies. Purge it again (Deploy step 6) and re-check.

In a browser:

- [ ] Homepage loads. The heading reads "Barber Shop in Pinellas Park, FL for Fades, Haircuts & Beard Trims".
- [ ] **Book a real test appointment end-to-end**, then cancel it in the dashboard. This is the revenue path.
- [ ] Nav links go to Services, Gallery, About Ali, FAQ and Contact. "Book Appointment" on a service page takes you to the homepage booking section.
- [ ] `/about-ali/` shows Ali's photo.
- [ ] A made-up URL shows the dark "This page doesn't exist" page.

### If you see a redirect loop

The browser shows "too many redirects". This would mean the host rule clashes with something in hPanel, such as a domain set to prefer `www`. Fix it by opening `public_html/.htaccess` in File Manager and putting a `#` at the start of these two lines:

```
#  RewriteCond %{HTTP_HOST} !^alisbarbershop\.com$ [NC]
#  RewriteRule ^(.*)$ https://alisbarbershop.com/$1 [R=301,L,QSA]
```

Save, purge the CDN, and reload. Everything else keeps working. Only the `www` redirect is lost.

## After it's live

1. **Google Search Console** → **Sitemaps** → submit `sitemap.xml`. You should see 14 discovered pages. Then **URL Inspection** → **Request indexing** for `/`, `/services/` and `/about-ali/`.
2. **Bing Webmaster Tools** → submit the same sitemap.
3. From the `remix-of-trimsync-first-br` folder, run:
   ```sh
   npm run seo:ping
   ```
   This tells Bing (and through it ChatGPT search) about the new pages right away. Google ignores this ping; step 1 covers Google.
4. In about 2 weeks: Search Console → **Pages**. A few 404s from old, made-up URLs are expected and correct now.

## Rollback

Upload `../release-2026-09-12/customer-website.zip`, extract it over `public_html` the same way, then purge the CDN. That restores the old homepage and the old `.htaccess`. The new folders (`services/`, `faq/`, …) would remain but do no harm. Delete them if you want a clean rollback.

## Local validation before packaging

- `npm run check:services`: all 12 website prices and durations match the live API.
- `npm test`: 24/24 tests passed. `tsc --noEmit` found no errors.
- Production build prerendered 14 pages. The homepage acceptance check passed (heading, services, prices, address, hours, structured data, canonical).
- Browser check against the built site: no hydration warnings, all pages 200, content present with JavaScript disabled.
- Archive: 44 files, top-level paths, `.htaccess` included, no source, `.env` or `node_modules`. Checksum is in `SHA256SUMS.txt`.
