# LoveSync structure

The app remains a no-build static web app. JavaScript files are loaded as classic scripts in the order listed in `index.html`, so they share the state declared in `js/core.js`.

## File ownership

- `index.html` — document shell, SVG symbols, and ordered asset loading only.
- `css/styles.css` — shared theme, layout, and component styles.
- `js/core.js` — translations, Supabase configuration, shared state, and common helpers.
- `js/pages/auth.js` — sign-in and registration page.
- `js/pages/calendar.js` — calendar and days-together card.
- `js/pages/details.js` — date details and todo rendering.
- `js/pages/notes.js` — sticky-note board.
- `js/pages/trash.js` — 30-day recycle bin and restore controls.
- `js/pages/settings.js` — settings and shared modal renderers.
- `js/pages/album.js` — album, upload, and photo viewer pages.
- `js/render.js` — root render routing.
- `js/letter.js` — invitation-letter flow.
- `js/actions.js` — button action dispatcher.
- `js/interactions.js` — delegated DOM event handlers and note drag/resize behavior.
- `js/data.js` — Supabase mapping, reads, writes, authentication, and realtime setup.
- `js/push.js` — web-push subscription behavior.
- `js/app.js` — startup and service-worker registration.

Keep `js/app.js` last in the script list because it starts the application after every dependency has loaded.

## Background push deployment

`supabase/functions/send-push/index.ts` handles date activity, reminders, sticky-note activity, and release notifications. Deploy it with gateway JWT verification disabled because reminder and release calls authenticate with `x-push-secret`; the function validates signed-in note senders itself.

```sh
supabase functions deploy send-push --no-verify-jwt
```

Set `PUSH_SECRET`, `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, and `VAPID_PRIVATE_KEY` as Edge Function secrets. After deploying a new web-app version, notify closed clients with:

```sh
curl -X POST "https://PROJECT_REF.supabase.co/functions/v1/send-push" \
  -H "Content-Type: application/json" \
  -H "x-push-secret: PUSH_SECRET" \
  -d '{"type":"app_update","version":"v36"}'
```

Use a unique `version` for each release. New-note and changed-text pushes are invoked automatically by the authenticated sender after the database save succeeds.
