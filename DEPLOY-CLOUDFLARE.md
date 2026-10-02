# Cloudflare Pages cutover (NOT FOR PUBLICATION)

Internal runbook. Lives at the repo root, outside `public/`, so Pages never serves it.
Only `public/` is published; `functions/` is compiled into the Worker.

1. `npx wrangler@latest login`
2. Create the Pages project from the dashboard: Workers & Pages → Create → Pages → Connect to Git →
   `xkoldxx/xkoldxx.github.io`, project name `neit-website`, production branch `main`,
   framework preset None, build command empty, build output directory `public`.
   Why Git over direct upload: every push to `main` deploys, every branch gets a preview URL, and
   `functions/` deploys with the site. Direct upload would mean running `wrangler pages deploy` by hand forever.
3. Turnstile: dashboard → Turnstile → Add widget, hostnames `www.neit.tech` and `neit.tech`
   (add `neit-website.pages.dev` too while testing), mode Managed. Copy the site key and secret.
   Put the site key in `public/index.html` in place of the test key `1x00000000000000000000AA`
   (search for `ponytail:`), and commit.
4. Fastmail: Settings → Privacy & Security → Manage API tokens → New, with scopes **Email (mail)**
   and **Email submission**. Copy the token.
5. Telegram bot token: it's in the OpenClaw config under `~/.openclaw`. Copy it from there yourself;
   don't paste it into chat or any file in this repo.
6. Set secrets on the production environment (each prompts for the value, nothing lands in a file):
   ```
   npx wrangler pages secret put TURNSTILE_SECRET --project-name neit-website
   npx wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name neit-website
   npx wrangler pages secret put FASTMAIL_API_TOKEN --project-name neit-website
   ```
   `LEAD_TO`, `TELEGRAM_CHAT_ID`, `TELEGRAM_THREAD_ID` come from `wrangler.toml` `[vars]`.
   Redeploy (Deployments → Retry) so the secrets apply.
7. Test on `https://neit-website.pages.dev`: submit the form and confirm the Telegram message in
   topic 7094 and the email in info@neit.tech. Logs: Pages project → Functions → Real-time logs.
8. Pages project → Custom domains → add `www.neit.tech`. The DNS zone is already on Cloudflare, so
   this rewrites the `www` CNAME from `xkoldxx.github.io` to `neit-website.pages.dev`.
   Add `neit.tech` too if the apex should land here (or keep a redirect rule to `www`).
9. Retest the form on `https://www.neit.tech`.
10. Turn off GitHub Pages: repo Settings → Pages → disable, then delete `.github/workflows/deploy.yml`
    and `public/CNAME` / `public/.nojekyll` (GitHub-only files) in one commit.

Rollback: in Cloudflare DNS, point the `www` CNAME back to `xkoldxx.github.io` (DNS only / grey
cloud) and remove the custom domain from the Pages project. If step 10 is done, re-enable GitHub
Pages and restore `deploy.yml` (`path: 'public'`) first. Note the form only works on Cloudflare;
on GitHub Pages `/api/contact` doesn't exist, so the form fails (shows the "email info@neit.tech" error)
until you're back on Pages.
