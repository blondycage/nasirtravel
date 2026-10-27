# Google Search Console Setup

## What Is Already Implemented

- `https://naasirtravel.com/robots.txt` allows public pages and blocks private admin, account, payment, and API routes.
- `https://naasirtravel.com/sitemap.xml` lists the homepage, packages, Hajj guidance, contact page, and all published packages.
- Public pages define titles, descriptions, canonical URLs, Open Graph metadata, and structured data.
- Package detail content is rendered on the server so crawlers receive the package content without waiting for browser-side API calls.
- Missing or unpublished packages return a real 404 response.

## 1. Add The Domain Property

1. Open https://search.google.com/search-console.
2. Open the property selector and choose **Add property**.
3. Select **Domain**.
4. Enter `naasirtravel.com` without `https://` or `www`.
5. Copy the TXT record supplied by Google.
6. In the DNS provider for `naasirtravel.com`, create a TXT record:
   - Host/name: `@`
   - Value: the complete `google-site-verification=...` value supplied by Google
   - TTL: automatic or the provider default
7. Return to Search Console and select **Verify**. DNS changes can take time to propagate.

The Domain property is preferred because it includes HTTPS, HTTP, `www`, and any subdomains.

## 2. Optional HTML Tag Verification

DNS verification is sufficient. If a URL-prefix property is also needed:

1. Add `https://naasirtravel.com/` as a URL-prefix property.
2. Choose the HTML tag verification method.
3. Copy only the `content` value from Google's meta tag.
4. Add it in Netlify under **Site configuration > Environment variables**:
   - Key: `GOOGLE_SITE_VERIFICATION`
   - Value: the copied content value
5. Redeploy the site, confirm the tag appears in the homepage source, and select **Verify**.

## 3. Submit The Sitemap

1. In Search Console, select the `naasirtravel.com` property.
2. Open **Indexing > Sitemaps**.
3. Under **Add a new sitemap**, enter `sitemap.xml`.
4. Select **Submit**.
5. Confirm the sitemap status becomes **Success**.

Do not submit admin, dashboard, login, API, payment, or other private URLs.

## 4. Request Priority Pages

Use **URL inspection** for these URLs, select **Test live URL**, then **Request indexing**:

- `https://naasirtravel.com/`
- `https://naasirtravel.com/packages`
- `https://naasirtravel.com/hajj-2027`
- `https://naasirtravel.com/contact`
- Important published package URLs

Use the sitemap for the full package catalog. Google limits individual indexing requests and does not guarantee immediate indexing.

## 5. Monitor Results

1. Check **Indexing > Pages** weekly for excluded pages and crawl errors.
2. Open each reason and verify whether the affected URLs should be indexed.
3. Check **Performance > Search results** for impressions, clicks, search terms, countries, and pages.
4. Check **Enhancements** and URL Inspection for structured-data errors.
5. Review **Security & Manual Actions** if traffic or indexed pages drop unexpectedly.

Allow at least one to two weeks after submission before treating a missing page as an indexing problem.

## Publishing Checklist

- Set `NEXT_PUBLIC_SITE_URL=https://naasirtravel.com` in Netlify.
- Keep one preferred domain and permanently redirect the other version (`www` or non-`www`) to it.
- Make the business name, address, postal code, phone numbers, and opening hours identical on the homepage, contact page, Google Business Profile, and external directories.
- Publish only complete package pages with useful unique descriptions.
- Link important packages from the packages page and relevant homepage sections.
- Update package titles, descriptions, images, and dates when offerings change.
- Confirm every published URL returns HTTP 200 and every removed URL returns 404 or redirects to a relevant replacement.
