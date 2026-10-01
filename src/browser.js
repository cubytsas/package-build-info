/** Register the compile-time build information and print a concise browser diagnostic. */
export function registerBuildInfo(info) {
  const metadata =
    info ??
    (typeof __BUILD_INFO__ === "undefined" ? undefined : __BUILD_INFO__);
  if (typeof window === "undefined" || !metadata) return undefined;

  window.__BUILD_INFO__ = metadata;
  const metadataUrl = new URL("/build-info.json", window.location.origin).href;
  console.info(
    `%cCubyt%c ${metadata.app} ${metadata.version} · ${metadata.environment} · ${metadata.buildId}`,
    "color:#55c69a;font-weight:700",
    "color:inherit;font-weight:400",
  );
  console.info("Build metadata:", { ...metadata, url: metadataUrl });

  return metadata;
}

export function getBuildInfo() {
  return typeof window === "undefined" ? undefined : window.__BUILD_INFO__;
}

/** Fetch the public metadata served by the Vite plugin without using a cached copy. */
export async function fetchBuildInfo({
  url = "/build-info.json",
  signal,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("This environment does not provide fetch().");
  }

  const response = await fetchImpl(url, {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Build metadata request failed with HTTP ${response.status}.`);
  }

  const info = await response.json();
  const requiredFields = [
    "app",
    "version",
    "buildHash",
    "buildId",
    "environment",
    "builtAt",
  ];
  if (
    !info ||
    typeof info !== "object" ||
    !requiredFields.every((field) => typeof info[field] === "string")
  ) {
    throw new Error("The build metadata response is invalid.");
  }
  return info;
}

/** Return true when the deployed build differs from the build running in this tab. */
export function hasBuildUpdate(latest, current = getBuildInfo()) {
  return Boolean(latest?.buildId && current?.buildId && latest.buildId !== current.buildId);
}
