# Upload the current uncommitted changes

Git commits are not required for a File Manager/SFTP deployment. These archives contain the current local runtime changes, including add-on services and the home-screen app. The backend archive is a patch for the existing application, not a fresh installation.

## Files and destinations

| Archive | Extract into |
| --- | --- |
| `customer-website.zip` | The existing document root for `alisbarbershop.com`, beside its current `index.html` (often `public_html`, but check your panel's Domains page). |
| `dashboard.zip` | The dashboard's existing document root, beside its current `index.html`. |
| `backend-changes.zip` | The existing Laravel application root: the folder containing `artisan`, `app/`, and `database/`. Do not extract into Laravel's `public/` folder. |

Each ZIP has its deployable files directly at the top level. Do not add a surrounding `dist/`, `build/`, or project-name directory. The public frontend archives contain built JavaScript; do not upload `src/` or `node_modules/`.

The backend patch includes 10 changed PHP application files and the new migration. It assumes the existing deployment already has the committed backend and its earlier migrations. No dependency files changed, so this patch does not require a Composer install. `backend-file-list.txt` lists its contents.

## Deployment order

1. Download a backup of the affected live files and export the live database with the hosting backup tool or phpMyAdmin. The migration adds `services.is_addon`, marks existing zero-duration services as add-ons, and changes the appointment start-time unique index to a normal index.
2. In the hosting Terminal/SSH, change to the actual Laravel application root and run:

   ```sh
   php artisan down
   ```

3. Upload `backend-changes.zip` using the hosting File Manager. Extract it into the Laravel root and allow replacement of the matching files. Preserve the live `.env`, `APP_KEY`, `vendor/`, `storage/`, uploaded pictures, and all other existing files.
4. From that same Laravel directory, run:

   ```sh
   php artisan migrate --force --path=database/migrations/2026_09_11_000001_add_is_addon_to_services_table.php
   php artisan optimize:clear
   php artisan queue:restart
   ```

   Run commands one at a time and stop if any fails. Do not run `migrate:fresh` or `migrate:refresh` on the live database. This deployment needs PHP 8.2+; use the host's PHP CLI path if the default `php` is older. The migration was tested locally on SQLite; production database execution still needs checking on the host. If it fails, keep the API in maintenance mode and resolve the reported error before continuing.
5. Upload and extract `dashboard.zip` into the dashboard document root, replacing matching files. Upload and extract `customer-website.zip` into the customer site's document root. Preserve unrelated folders, uploads and existing old hashed asset files while current visitor tabs may still use them. If using SFTP, upload new `static/` or `assets/` files first and `index.html` last.
6. The customer archive includes `.htaccess` for SPA routing. If your live `.htaccess` has custom hosting rules, preserve and merge those rules rather than discarding them. The dashboard archive leaves its existing hosting rewrite configuration in place.
7. Bring the backend online:

   ```sh
   php artisan up
   ```

8. Remove the uploaded ZIP files from the server after extraction, especially the backend source archive. Purge any hosting/CDN page cache if enabled, then reload the website and dashboard.

## If Terminal/SSH is unavailable

Ask hosting support to run the commands in the deployment order above, from the directory containing Laravel's `artisan`, using PHP 8.2+. Coordinate this before replacing the backend files. Uploading files alone cannot apply the database migration. Do not publish a web-accessible migration runner.

## Verify

- Check the dashboard loads and existing services/appointments are visible.
- Confirm a service can be marked as an add-on and its appointment behavior is correct.
- Check `https://alisbarbershop.com/manifest.webmanifest` returns JSON and `/icons/pwa-192.png`, `/icons/pwa-512.png`, and `/icons/apple-touch-icon.png` load as images, not HTML.
- With a planned test appointment, verify that installation messaging appears only after booking succeeds. Android Chrome shows Install app only when the browser offers installation. iPhone Safari shows home-screen instructions. Check the home-screen icon opens the booking section.
- Appointment submission still needs an internet connection; no offline booking or service-worker cache is introduced.

Local validation before packaging: customer production build and installability check; 14 frontend tests; 10 backend add-on tests (90 assertions); dashboard production build passed with existing React hook dependency warnings in `AvailabilityPage.jsx` and `BarberForm.jsx`. Archive contents were checked for required files, correct paths and exclusion of environment/dependency files. `SHA256SUMS.txt` contains package checksums.

References: [cPanel upload/extract](https://support.cpanel.net/hc/en-us/articles/360055141854-Using-File-Manager-To-Extract-Files), [Laravel deployment](https://laravel.com/docs/11.x/deployment), [Laravel queue deployment](https://laravel.com/docs/11.x/queues).
