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

declare global {
  const __BUILD_INFO__: CubytBuildInfo;

  interface Window {
    __BUILD_INFO__?: CubytBuildInfo;
  }
}
