import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { config } from "../dist/config.js";

test("configuration rejects missing/malformed fields without echoing values", () => {
  for (const env of [
    {},
    { DISCORD_TOKEN: "PRIVATE_SENTINEL" },
    { DISCORD_TOKEN: "x y", DISCORD_APPLICATION_ID: "1" },
  ])
    assert.throws(
      () => config(env),
      (error) => !error.message.includes("PRIVATE_SENTINEL"),
    );
  assert.equal(
    config({
      DISCORD_TOKEN: "fake-test-token",
      DISCORD_APPLICATION_ID: "12345678901234567",
      DISCORD_GUILD_ID: "23456789012345678",
    }).guild,
    "23456789012345678",
  );
});
test("unconfigured startup/register and noninteractive setup exit safely without file writes", () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const tempRoot = resolve(tmpdir());
  const dir = mkdtempSync(join(tempRoot, "measuremoss-test-"));
  const env = { ...process.env };
  delete env.DISCORD_TOKEN;
  delete env.DISCORD_APPLICATION_ID;
  delete env.DISCORD_GUILD_ID;
  try {
    for (const file of ["dist/main.js", "dist/register.js", "scripts/setup.mjs"]) {
      const run = spawnSync(process.execPath, [join(root, file)], {
        cwd: dir,
        env,
        encoding: "utf8",
        timeout: 10000,
      });
      assert.equal(run.status, 1, `${file}: ${run.stderr}`);
      assert.equal(existsSync(join(dir, ".env")), false);
      assert.ok(!run.stderr.includes("https://discord.com/api"));
    }
  } finally {
    assert.equal(dirname(resolve(dir)), tempRoot);
    assert.ok(resolve(dir).startsWith(join(tempRoot, "measuremoss-test-")));
    rmSync(dir, { recursive: true, force: true });
  }
});
