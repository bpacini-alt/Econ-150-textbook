# Private prose editor

The Econ 150 pages include an **Edit** link for content pages listed in `etb-live/manifest.json`. The editor is served at `/editor/`.

Configure one Cloudflare Access self-hosted application for `econ.benjaminpacini.com`, covering both `/editor` and `/editor/*`. Use Google sign-in and an Allow policy restricted to the three email accounts you supplied. The Worker applies the same email check from the `EDITOR_EMAILS` variable.

For this Worker, set these Cloudflare values:

- Text variable `ACCESS_TEAM_DOMAIN`: the full Access team origin, such as `https://your-team.cloudflareaccess.com`.
- Text variable `ACCESS_AUD`: the Application Audience tag for this book's Access application.
- Text variable `EDITOR_EMAILS`: the three allowed email addresses, comma-separated.
- Secret `EDITOR_GITHUB_TOKEN`: a fine-grained token with Contents: Read and write for this textbook repository only.

The two repositories use the same `feedback/worker.js` and `editor/index.html`, but each has its own Access application audience and a repository-scoped GitHub token. The token is never stored in Git or sent to the browser.

When Benjamin selects **Save and publish**, the editor commits directly to `main`. Econ 150's source page is also its published page, so one file is committed. Cloudflare deploys the commit through the repository's existing deployment connection.
