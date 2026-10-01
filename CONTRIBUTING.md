# Contributing

## Repository layout

- `src/` contains framework-independent browser helpers and the Vite plugin.
- `types/` contains the public TypeScript declarations.
- `tests/` covers browser metadata and Vite plugin behavior.
- `.github/actions/notify-discord/` contains the reusable deployment notification action.
- `README.md` documents consumer setup; `CHANGELOG.md` records package changes.

## Conventions

- Keep `/build-info.json` public and limited to non-secret build metadata.
- Keep Vite-only Node APIs in the `./vite` export and browser-safe helpers in `./browser`.
- Keep the exported types and README examples in sync with the JavaScript API.
- Never expose webhook URLs or secrets in logs, metadata, or package contents.
