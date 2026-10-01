# @cubyt/build-info

Shared build identity and deployment reporting for Cubyt Sas websites.

## Install

```sh
npm install @cubyt/build-info
```

## Vite build metadata

Register the Vite plugin in the app's Vite config:

```js
import { createBuildInfoPlugin } from "@cubyt/build-info/vite";

export default defineConfig({
  plugins: [createBuildInfoPlugin({ appName: "landing" })],
});
```

The plugin injects a typed `__BUILD_INFO__` constant and publishes the same
metadata at `/build-info.json` in dev and production. It includes app name,
package version, source hash, build ID, environment, and build time. It never
includes environment secrets or full repository/commit data.

Register it once from the app entry point:

```ts
import { registerBuildInfo } from "@cubyt/build-info/browser";

registerBuildInfo();
```

The browser console then identifies the running app/version/environment.
`window.__BUILD_INFO__` and `getBuildInfo()` are available for diagnostics.

To check whether a long-lived tab is running a superseded deployment, fetch the
current public metadata and compare its build ID:

```ts
import { fetchBuildInfo, getBuildInfo, hasBuildUpdate } from "@cubyt/build-info/browser";

const latest = await fetchBuildInfo();
if (hasBuildUpdate(latest, getBuildInfo())) {
  // Show a reload notice or prompt the user to refresh.
}
```

`fetchBuildInfo()` uses `cache: "no-store"`, accepts an optional URL and
`AbortSignal`, and throws if the request fails or the response is malformed.

Set `VITE_APP_ENV` in CI to a human-readable environment such as `staging` or
`production`. The route contains public build metadata only; do not add secrets.

## Discord deployment notifications

The GitHub composite action is included in this repository:

```yaml
- name: Report build and deployment
  if: always()
  uses: cubytsas/package-build-info/.github/actions/notify-discord@v1
  with:
    webhook-url: ${{ secrets.CUBYT_DEPLOY_WEBHOOK }}
    app: Cubyt Landing
    environment: ${{ github.ref_name }}
    build-status: ${{ steps.build.outcome }}
    deploy-status: ${{ steps.deploy.outcome }}
    deployment-url: https://staging.example.com
```

Store the Discord webhook URL in GitHub Actions secrets (never in source,
package metadata, build output, or a `VITE_*` variable). The action reports
build/deploy outcomes, workflow, environment, and the public build ID when
`dist/build-info.json` exists. Notification failures do not replace the result
of the build/deploy job; use `continue-on-error: true` on the calling step.

## License

MIT. See [LICENSE](./LICENSE).
