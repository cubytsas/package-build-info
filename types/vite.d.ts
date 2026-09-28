import type { Plugin } from "vite";

export interface CubytBuildInfoPluginOptions {
  /** Public product/site name. Defaults to the package name without its npm scope. */
  appName?: string;
  /** Vite app root. Defaults to the current working directory. */
  root?: string;
  /** Files and directories relative to `root` that contribute to the build hash. */
  sources?: string[];
}

export function createBuildInfoPlugin(
  options?: CubytBuildInfoPluginOptions,
): Plugin;
