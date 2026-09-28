import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createBuildInfoPlugin } from "../src/vite.js";

test("creates stable, public build metadata and emits its route", () => {
  const root = mkdtempSync(join(tmpdir(), "cubyt-build-info-"));
  try {
    mkdirSync(join(root, "src"));
    writeFileSync(
      join(root, "package.json"),
      '{"name":"@cubyt/demo","version":"2.3.4"}',
    );
    writeFileSync(join(root, "src", "main.js"), "export const value = 1;\n");

    const plugin = createBuildInfoPlugin({
      root,
      sources: ["src", "package.json"],
    });
    const config = plugin.config({}, { mode: "staging" });
    const info = JSON.parse(config.define.__BUILD_INFO__);
    let emitted;

    assert.equal(info.app, "demo");
    assert.equal(info.version, "2.3.4");
    assert.equal(info.environment, "staging");
    assert.match(info.buildHash, /^[a-f0-9]{16}$/);
    assert.match(info.buildId, /^2\.3\.4-[a-f0-9]{16}$/);

    plugin.generateBundle.call({ emitFile: (asset) => (emitted = asset) });
    assert.equal(emitted.fileName, "build-info.json");
    assert.deepEqual(JSON.parse(emitted.source), info);
    assert.equal(JSON.stringify(info).includes("commit"), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
