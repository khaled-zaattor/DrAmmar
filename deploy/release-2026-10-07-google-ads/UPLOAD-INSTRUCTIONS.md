# Release 2026-10-07: keep regular customers from seeing Google Ads

This release helps you stop paying for Google Ads clicks from existing customers. It does this two ways:

- **Customer site:** after each completed booking, the site sends a `booking_completed` event to Google Tag Manager. Google Ads uses it to build a list of people who have booked.
- **Dashboard and API:** admins get an **"Export customers (Google Ads)"** button on the Appointments page. It downloads a customer list in Google's Customer Match format.

## What's in it, and what isn't

| Part | In this release? | Archive |
| --- | --- | --- |
| Customer website (`alisbarbershop.com`) | Yes | `customer-website.zip` |
| Dashboard (`manage.alisbarbershop.com`) | Yes | `dashboard.zip` |
| Laravel API (`api.alisbarbershop.com`) | Yes, 2 files | `backend-changes.zip` |
| Database | No migrations | — |
| Composer / `vendor/` | No changes | — |

**Left out on purpose:** the local changes that move email sending to Resend (the `resend/resend-php` package, mail config, and email templates). They need `composer install` and new `.env` values, so they will ship in their own release. Don't upload `composer.json`, `composer.lock`, `config/` or `resources/views/emails/` from your local copy as part of this release.

## Before you start

1. Back up the live files you're about to replace:
   - In `public_html`: `index.html` and `.htaccess`.
   - In the dashboard root: `index.html`.
   - In the Laravel root: `routes/api.php`.
2. Check the downloads aren't corrupted. In PowerShell, from this folder:
   ```powershell
   Get-FileHash .\*.zip -Algorithm SHA256
   ```
   The results should match `SHA256SUMS.txt`.

## Deploy

Use hPanel → **Websites → Manage → Files → File Manager**.

1. **Backend (API).** Upload `backend-changes.zip` to the Laravel root, which is the folder that contains `artisan`, `app/` and `routes/`. Do **not** upload it into `public/`.
   - Extract it there and allow it to overwrite.
   - It replaces `routes/api.php` and adds `app/Http/Controllers/Api/Admin/CustomerExportController.php`.
   - Then, in the hPanel Terminal or over SSH, from that same folder, run:
     ```sh
     php artisan optimize:clear
     ```
     If you can't use Terminal, ask Hostinger support to run it. Without it, a cached route list can hide the new export route.
   - The API stays online the whole time, so maintenance mode isn't needed.
2. **Dashboard.** Upload `dashboard.zip` into the dashboard's document root, next to its `index.html`.
   - Extract it there and allow it to overwrite.
   - Keep the existing `.htaccess`; this archive doesn't include one.
   - Don't delete the old files in `static/`.
3. **Customer website.** Upload `customer-website.zip` into `public_html`.
   - Extract it there and allow it to overwrite.
   - Files must land directly in `public_html`, not inside a `dist/` subfolder.
   - The included `.htaccess` is identical to the 2026-09-21 release. If you've added custom lines since then, add them back.
   - Don't delete the old files in `assets/`.
4. Delete the three ZIP files from the server, especially `backend-changes.zip`.
5. **Purge the CDN.** In hPanel go to **Performance → CDN → Purge all**. Purge LiteSpeed Cache too if it's enabled.

## Verify

- [ ] **Dashboard:**
  - Log in as an admin, open **Booked Appointments** and click **Export customers (Google Ads)**.
  - A `customer-match-YYYY-MM-DD.csv` file should download.
  - It should list each customer once, with phone numbers like `+17275551234`.
  - A receptionist or barber account shouldn't see the button.
- [ ] **Customer site:**
  - Open the site, press F12 → Console, then book a real test appointment.
  - After the confirmation screen appears, type `dataLayer` and press Enter. The last entry should be `event: "booking_completed"` with the booking reference.
  - Cancel the test appointment in the dashboard afterwards.
- [ ] The homepage and service pages still load, and booking still works end to end.

## One-time setup in Google (needed before ads change)

The website only sends the event; nothing happens in your ads until Google Tag Manager and Google Ads are set up.

1. **Google Tag Manager** (container `GTM-N5G6ZXP2`):
   - Create a trigger: type **Custom Event**, event name `booking_completed`.
   - Add a **Google Ads Conversion Tracking** tag that fires on that trigger. Use your conversion ID and label from Google Ads.
     - Set Conversion Value to a Data Layer Variable `value`, Transaction ID to `transaction_id`, and Currency to `USD`.
     - Turn on **Include user-provided data from your website** and map it to the Data Layer Variable `user_data`.
   - Add a **Google Ads Remarketing** tag on the same trigger.
   - Make sure a **Conversion Linker** tag fires on All Pages.
   - Click **Submit → Publish**.
2. **Google Ads → Tools → Audience manager:**
   - **Website visitors:** create a segment called "Booked customers" from the `booking_completed` event. Set membership duration to 540 days.
   - **Customer list:** upload the CSV from the dashboard. Upload a new export about once a month, because Google doesn't refresh it on its own.
3. **Each campaign → Audiences → Exclusions:** add both lists. For Performance Max, customer lists can only be excluded from account-wide settings.

**Limits to know about:**
- Google has to approve your account before you can use customer lists. Approval depends on your account's history of following its policies and paying on time.
- Lists need roughly 100 or more people before Google will use them.
- Matching is never 100%. A customer who isn't signed into Google, or who has cleared their browser history, can still see an ad.

## Rollback

- Restore the `routes/api.php` you backed up and run `php artisan optimize:clear`. The new controller file can stay; nothing calls it without the route.
- Re-extract `../release-2026-09-21-seo/customer-website.zip` into `public_html`.
- Re-extract `../release-2026-09-12/dashboard.zip` into the dashboard root.
- Purge the CDN.

## Local validation before packaging

- Backend: 33 tests passed (166 assertions), including 2 new export tests. The new tests check the CSV's content, that duplicates are removed, that cancelled bookings are left out, and that non-admins get 403.
- Customer site: production build prerendered 14 pages. All 24 tests passed and `tsc --noEmit` found no errors. The built JS contains `booking_completed` and points at `https://api.alisbarbershop.com`.
- Dashboard: the production build succeeded, using `https://api.alisbarbershop.com` with no localhost URL. It shows the existing React hook warnings in `AvailabilityPage.jsx` and `BarberForm.jsx`.
- Archives have their files at the top level, with no source, `.env` or `node_modules`. Checksums are in `SHA256SUMS.txt`.
