# Changelog

## 1.1.0 — 2026-10-01

- Add `fetchBuildInfo()` and `hasBuildUpdate()` helpers for detecting when an open tab is behind the deployed build.

## 1.0.1 — 2026-09-28

- Publish from GitHub Actions with npm provenance attestations linking the package to its source commit and workflow.

## 1.0.0 — 2026-09-28

- Add a Vite plugin that creates a versioned build ID and `/build-info.json` route.
- Add browser helpers that expose build metadata and log the active app, version, and environment.
- Add a reusable GitHub composite action for reporting build/deploy results to Discord.
