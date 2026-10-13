# MindMystery launch starter

A responsive timed puzzle challenge with 18 questions, per-question timers, progress feedback, a results preview, and a certificate/report flow scaffold.

## Important launch status

This is a **starter project, not a finished public launch**. The payment flow is scaffolded for Stripe Checkout but remains disabled until you configure real keys and a webhook. It does not calculate a validated IQ score. The report and certificate describe completion of a reasoning challenge only. Do not advertise this as an actual or scientifically valid IQ test unless you replace the puzzle scoring with an appropriately validated and normed assessment.

The activity feed only displays genuine report-purchase events. It intentionally does not generate fake people, profile photos, countries, IQ scores, or fake purchases.

## Run locally

1. Install Node.js 20 or newer.
2. Extract this folder.
3. In this folder, run `npm install`.
4. Copy `.env.example` to `.env`.
5. Run `npm start`.
6. Open `http://localhost:4242`.

Without Stripe keys, the challenge works but checkout returns a clear setup message.

## Configure Stripe test mode

1. Create a Stripe account and use test-mode credentials first.
2. Put the test secret key in `STRIPE_SECRET_KEY`.
3. Set `BASE_URL` to your local or deployed HTTPS origin.
4. Configure a Stripe webhook endpoint at `https://YOUR-DOMAIN/webhook` for `checkout.session.completed`.
5. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
6. Test successful, cancelled, failed and repeated webhook events before enabling live mode.

Use HTTPS in production. Keep `.env` private and never put secret keys in browser JavaScript. For production, consider a managed database, webhook idempotency, monitoring, rate limiting, backups, a support contact and stronger report-access controls.

## Publish checklist

- Buy/configure a domain and choose a hosting provider that supports Node.js and persistent storage.
- Set production environment variables and HTTPS.
- Configure Stripe live mode only after all test transactions work.
- Complete real privacy, terms, refund and customer-support pages.
- Verify local consumer law, payment disclosures and privacy requirements for your target markets.
- Replace the sample questions with original, quality-reviewed content.
- If claiming IQ results, obtain appropriate psychometric expertise and use a validated, normed assessment; otherwise keep all wording limited to challenge performance.
- Add a secure customer report access flow and certificate verification page before issuing certificates as credentials.
- Test on mobile, keyboard navigation, screen readers and major browsers.

## Certificate number

A five-digit number is allocated server-side after a paid checkout webhook and checked for uniqueness in the SQLite database. The current sample certificate is explicitly a completion certificate, not an accredited IQ certificate.
