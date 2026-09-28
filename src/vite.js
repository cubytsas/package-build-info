import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

const DEFAULT_SOURCES = ["src", "index.html", "package.json", "vite.config.ts"];

function collectFiles(path, files) {
  const entry = statSync(path);
  if (!entry.isDirectory()) {
    files.push(path);
    return;
  }

  for (const name of readdirSync(path).sort()) {
    if (name === ".git" || name === "node_modules" || name === "dist") continue;
    collectFiles(resolve(path, name), files);
  }
}

function createMetadata({ root, sources, appName, mode }) {
  const manifest = JSON.parse(
    readFileSync(resolve(root, "package.json"), "utf8"),
  );
  const files = [];

  for (const source of sources) {
    const path = resolve(root, source);
    try {
      collectFiles(path, files);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  const hash = createHash("sha256");
  for (const path of files.sort()) {
    hash.update(relative(root, path).split(sep).join("/"));
    hash.update("\0");
    hash.update(readFileSync(path));
  }

  const buildHash = hash.digest("hex").slice(0, 16);
  const version = manifest.version ?? "0.0.0";

  return {
    app: appName ?? manifest.name?.replace(/^@[^/]+\//, "") ?? "site",
    version,
    buildHash,
    buildId: `${version}-${buildHash}`,
    environment:
      process.env.VITE_APP_ENV ?? process.env.NODE_ENV ?? mode ?? "production",
    builtAt: new Date().toISOString(),
  };
}

function jsonResponse(metadata, response) {
  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(`${JSON.stringify(metadata, null, 2)}\n`);
}

/**
 * Add deterministic build metadata to a Vite app. It is available in the
 * browser as `__BUILD_INFO__` and at `/build-info.json` in dev and production.
 */
export function createBuildInfoPlugin({
  appName,
  root = process.cwd(),
  sources = DEFAULT_SOURCES,
} = {}) {
  let metadata;

  return {
    name: "@cubyt/build-info",
    config(_config, { mode }) {
      metadata = createMetadata({
        root: resolve(root),
        sources,
        appName,
        mode,
      });
      return { define: { __BUILD_INFO__: JSON.stringify(metadata) } };
    },
    configureServer(server) {
      server.middlewares.use("/build-info.json", (request, response, next) => {
        if (request.method !== "GET" && request.method !== "HEAD")
          return next();
        jsonResponse(metadata, response);
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "build-info.json",
        source: `${JSON.stringify(metadata, null, 2)}\n`,
      });
    },
  };
}
