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
