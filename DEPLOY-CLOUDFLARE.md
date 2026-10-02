# Cloudflare Pages (NOT FOR PUBLICATION)

Live since 2026-10-02. Internal runbook; lives outside `public/`, so Pages never serves it.

## Current setup
- Pages project `neit-website` (account 02535d2bf59615d94efca0c0c9668bbf), **Direct Upload**. Pushing to `main` does NOT deploy.
- Custom domains: `www.neit.tech` (canonical), `neit.tech` (301 → www). DNS on Cloudflare, both proxied CNAMEs to `neit-website.pages.dev`.
- `public/` = static site. `functions/api/contact.js` = form back end (Turnstile + honeypot → Telegram biz topic 7094; Fastmail email when `FASTMAIL_API_TOKEN` is set).
- Secrets (set per environment in the project): `TURNSTILE_SECRET`, `TELEGRAM_BOT_TOKEN`; preview env uses Turnstile's always-pass test secret. Non-secret vars in `wrangler.toml`.

## Deploy
```
CLOUDFLARE_API_TOKEN=<token with Pages:Edit> CLOUDFLARE_ACCOUNT_ID=02535d2bf59615d94efca0c0c9668bbf \
  npx wrangler@latest pages deploy --branch main          # production
  # --branch <name> for a preview at <name>.neit-website.pages.dev
```
Direct Upload projects can't be switched to Git integration; push-to-deploy needs a GitHub Action with a Pages-only token.

## Add lead emails
Fastmail → Settings → Privacy & Security → API tokens (Email + Email submission), then set `FASTMAIL_API_TOKEN` as a production secret and redeploy.

## Rollback
Cloudflare DNS: set `www` CNAME back to `xkoldxx.github.io` (DNS only) and remove the custom domains from the Pages project. GitHub Pages was retired 2026-10-01 (deploy.yml, CNAME, .nojekyll removed); to roll back there, restore them from git history and re-enable Pages in repo settings first. The form only works on Cloudflare.
