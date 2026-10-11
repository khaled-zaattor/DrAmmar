# Off-site SEO checklist — Ali's Barber Shop

Written for: the shop owner / whoever manages the business listings. None of
this is code — it's the work that has to happen outside the repo, and it's worth
more than anything left in the codebase.

The website has been rebuilt so every service, price, opening hour and FAQ
answer is now real HTML that Google and AI answer engines can read without
running JavaScript. That fixes the site. It doesn't fix the listings, and for a
barbershop the listings decide whether you show up in the map pack at all.

Work top to bottom. P0 items are worth more than everything below them combined.

---

## P0 — Make the business one entity, not three

Right now the same shop appears online under at least three different names:

| Name found | Where |
|---|---|
| `ALIS BARBERSHOP LLC` | business registration / some directories |
| `Ali's Barbershop` | Booksy, Google Maps |
| `Ali Zaatour` | some listings use the barber's name as the business |
| `Ali's Barber Shop` | this website |

To a human these are obviously the same place. To the systems that decide what
to show for "barber near me", they may be three different businesses, each with
a third of the authority.

- [ ] **Pick one name and write it down here:** `_________________________`
  - Recommended: `Ali's Barbershop` — it's what Google Maps and Booksy already
    show, so it's the least disruptive to change everything else to.
  - The LLC name is a legal name, not a trading name. It does not have to match.
- [ ] Update the website to match. It currently says **Ali's Barber Shop**.
      One-line change in `src/data/business.ts` → `BUSINESS.name`. Tell your
      developer the chosen name.
- [ ] Update every platform in the citations table below to the exact same
      spelling, including the apostrophe.

### Address — pick one format

The site currently says `4201 62nd North Unit 9`. The postal-standard form is
`4201 62nd Ave N, Unit 9`. Other listings use both.

- [ ] Check what USPS/Google considers correct for the building.
- [ ] Use that exact string everywhere. One-line change in
      `src/data/business.ts` → `BUSINESS.address.street`.

### Hours — resolve the conflict

The website says:

```
Tue–Fri  8:30 AM – 5:30 PM
Sat      9:00 AM – 4:00 PM
Sun, Mon Closed
```

Some public listings show substantially different hours, including evenings up
to 9 PM.

- [ ] **Confirm which is actually correct.**
- [ ] If the website is wrong: the fix is `BUSINESS_HOURS` in
      `src/data/business.ts` **and** the business-hours table in the admin
      dashboard — they're two separate places and both feed the site.
- [ ] If the listings are wrong: fix them on every platform below.

> Wrong hours are worse than missing hours. Someone drives over, finds a locked
> door, and leaves a one-star review — which costs more than the ranking did.

---

## P1 — Google Business Profile

For a barbershop this is arguably worth more than the entire website. Two
separate battles: organic search (the website) and the map pack (this).

- [ ] **Primary category:** `Barber shop`. Not "Hair salon" — the primary
      category is the single strongest relevance signal you control.
- [ ] **Secondary categories**, only where genuinely true. Based on the live
      service list, these are defensible: `Beauty salon` (threading, waxing,
      facials). Do not add categories for services you don't perform.
- [ ] **Services:** add all 12, with prices. They're on the website now:
      - Men's Haircut — $30 · Haircut & Beard — $45 · Kids' Haircut (Under 12) — $25
      - Senior Haircut (65+) — $25 · Beard Line Up & Shave — $20 · Full Edge — $20
      - Full Face Threading — $10 · Special Facial — $45
      - Add-ons: Hot Towel $5 · Eyebrow Threading $5 · Face Wax $10 · Shampoo $5
- [ ] **Booking link:** point it at `https://alisbarbershop.com/#booking`
- [ ] **Website link:** `https://alisbarbershop.com/`
- [ ] **Description:** mention Pinellas Park, fades, beard work, *and* that the
      barbers speak Arabic. Don't keyword-stuff — write it for a person.
- [ ] **Attributes:** set the language attribute if available. "Identifies as"
      and accessibility attributes if they apply.
- [ ] **Hours + holiday hours.** Set holiday hours before every holiday; Google
      demotes profiles it thinks might be inaccurate.
- [ ] **Photos:** exterior (so people can find the door), interior, and cuts.
      Add new cut photos regularly — recency is a signal, and it's free.
- [ ] **Q&A:** seed it yourself. Ask and answer the real questions — parking,
      walk-ins, Arabic, kids, card payments. The answers are already written on
      `/faq/`; reuse them.
- [ ] **Products / posts:** post occasionally. Low effort, small but real signal.

---

## P2 — Reviews

Review quality is already excellent. Quantity is the problem: local competitors
in Pinellas Park have 100–200+ reviews.

Target: **30 → 50 → 100 genuine Google reviews.** Steadily. A sudden burst looks
like exactly what it would be.

- [ ] Print a QR code at the counter linking to your Google review form.
- [ ] Ask after the cut, while the client is still happy with it:
      *"If you're happy with it, a Google review really helps us."*
- [ ] **Do not give people a script.** You want them writing "skin fade",
      "beard trim", "best fade in Pinellas Park" in their own words — that
      language is what makes the review useful for search. Scripted reviews all
      say the same thing and help nothing.
- [ ] Reply to every review, good and bad. Replies are visible to Google and to
      the next customer reading them.
- [ ] Never buy reviews. It is the one mistake that can remove the listing
      entirely.

---

## P3 — Citations (NAP consistency)

Ten to fifteen accurate, consistent listings beat 300 spam directories. The only
thing that matters is that Name, Address and Phone are **identical everywhere**.

| Platform | Claimed? | NAP matches? | Notes |
|---|---|---|---|
| Google Business Profile | ☐ | ☐ | The important one |
| Booksy | ☐ | ☐ | Already live — check name + hours |
| Apple Business Connect | ☐ | ☐ | Drives Apple Maps + Siri |
| Bing Places | ☐ | ☐ | Feeds Bing, which feeds ChatGPT search |
| Yelp | ☐ | ☐ | |
| Facebook page | ☐ | ☐ | Already linked from the site |
| Instagram bio | ☐ | ☐ | Put the website link in the bio |
| TikTok bio | ☐ | ☐ | |
| Nextdoor | ☐ | ☐ | Genuinely strong for neighbourhood services |
| Apple/Google "suggest an edit" duplicates | ☐ | — | Look for duplicate pins and request removal |

- [ ] Search Google Maps for the address and look for **duplicate listings**.
      Duplicates split your reviews and your authority. Report them.

---

## P4 — Search Console and Bing Webmaster Tools

Do this **after** the new site is uploaded.

- [ ] Verify `alisbarbershop.com` in [Google Search Console](https://search.google.com/search-console)
- [ ] Submit the sitemap: `https://alisbarbershop.com/sitemap.xml` (now 14 URLs,
      was 1)
- [ ] URL Inspection → **Request indexing** on each of the 14 URLs, once.
- [ ] URL Inspection → **Test live URL → View crawled page** on a service page.
      Confirm the service names and prices are in the HTML Google receives.
      This is the specific thing that was broken.
- [ ] Verify in [Bing Webmaster Tools](https://www.bing.com/webmasters) and
      submit the same sitemap.
- [ ] Run `npm run seo:ping` after each upload — pings IndexNow for Bing.
      (Google does not participate in IndexNow; the sitemap covers Google.)
- [ ] Two weeks later: check **Coverage** for a spike in 404s. The site no
      longer serves the homepage for unknown URLs, so any old link someone
      published will now correctly 404. If a real page shows up there, add a
      redirect.

---

## P5 — Later, once the English pages are indexed

- [ ] **Arabic page at `/ar/`.** The Arabic-speaking angle is a real
      differentiator and has almost no local competition. It needs to be a
      genuinely useful page — services, prices, hours, address, booking,
      directions — not machine-translated English. Add `hreflang` when it ships.
- [ ] **Review schema.** Not added deliberately: Google's structured data policy
      makes reviews a business collects about itself, on its own site,
      ineligible for review rich results, and marking them up can trigger a
      manual action. Revisit only with a verifiable third-party rating count.
- [ ] **Content from real data.** After ~6 weeks, Search Console will show which
      queries you're already appearing for. Write for those, rather than
      guessing. That beats any keyword tool.

---

## What NOT to spend time on

- **`llms.txt` beyond what's already generated.** The site generates one
  automatically. Google's own guidance is explicit that AI visibility follows
  normal SEO — there's no special AI file or AI schema that shortcuts it.
- **Mass directory submissions.** 300 spam listings with slightly different
  addresses actively hurt; they're the opposite of NAP consistency.
- **A redesign.** The design, photography, booking flow and reviews are all
  genuinely good. The problem was never how the site looked.

---

## Maintenance

- Changed a price in the admin dashboard? Run `npm run check:services` — it
  compares the website's static prices against the live database and fails if
  they've drifted. Then update `src/data/services.ts` and redeploy.
- Changed anything on a page? Bump that route's `lastmod` in `src/routes.tsx`.
  Don't automate it — a `lastmod` that changes on every build teaches Google to
  ignore the field.
