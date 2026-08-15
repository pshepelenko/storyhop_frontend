# StoryHop Frontend

Next.js frontend for StoryHop.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3001`. The UI Kit is available at `http://localhost:3001/ui-kit`; its documentation is in `../docs/ui-kit.md`.

The user owns the long-running dev process. `npm run build` writes production output to `.next`, while the project dev script uses `.next-dev`, preventing stale chunk errors when build and dev checks happen near each other.

## Railway

`railway.toml` builds with `npm ci && npm run build` and starts Next through `npm run start:railway` on `0.0.0.0:$PORT`.

Build-time variables:

```text
NEXT_PUBLIC_API_URL=https://api.story-hop.com
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

These values are embedded in the browser bundle. Redeploy frontend after changing them. Analytics stays disabled when the project token is empty. StoryHop masks all replay text and form inputs; PostHog receives interaction structure and explicit safe events without story, child, exercise or speech content.

Run `npm run release:check` before deployment. The complete Railway procedure is in `../docs/alpha-release-runbook.md`.
