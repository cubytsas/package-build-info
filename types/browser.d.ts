export interface CubytBuildInfo {
  app: string;
  version: string;
  buildHash: string;
  buildId: string;
  environment: string;
  builtAt: string;
}

export function registerBuildInfo(
  info?: CubytBuildInfo,
): CubytBuildInfo | undefined;
export function getBuildInfo(): CubytBuildInfo | undefined;
export function fetchBuildInfo(options?: {
  url?: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}): Promise<CubytBuildInfo>;
export function hasBuildUpdate(
  latest: Pick<CubytBuildInfo, "buildId"> | undefined,
  current?: Pick<CubytBuildInfo, "buildId">,
): boolean;

declare global {
  const __BUILD_INFO__: CubytBuildInfo;

  interface Window {
    __BUILD_INFO__?: CubytBuildInfo;
  }
}
