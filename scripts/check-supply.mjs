import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const licenses = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "0BSD",
  "CC0-1.0",
  "(MIT OR Apache-2.0)",
  "MIT OR Apache-2.0",
  "Python-2.0",
]);
let packages = 0;
for (const [name, pkg] of Object.entries(lock.packages)) {
  if (!name) continue;
  if (
    !licenses.has(pkg.license) ||
    pkg.hasInstallScript ||
    !/^https:\/\/registry\.npmjs\.org\//.test(pkg.resolved ?? "") ||
    !/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(pkg.integrity ?? "")
  )
    throw new Error(`Unreviewed dependency metadata: ${name}`);
  packages++;
}
const rules = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}\b/,
  /\bmfa\.[A-Za-z0-9_-]{20,}\b/,
  /\b[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}\b/,
  /(?:DISCORD_TOKEN|DISCORD_CLIENT_SECRET)[ \t]*=[ \t]*["']?[A-Za-z0-9._-]{20,}/,
];
let files = 0;
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", ".env"].includes(entry.name)) continue;
    const file = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${file}`);
    if (entry.isDirectory()) scan(file);
    else {
      if (entry.name.startsWith(".env") && entry.name !== ".env.example")
        throw new Error(`Unexpected credential file: ${file}`);
      const text = readFileSync(file, "utf8");
      if (rules.some((rule) => rule.test(text)))
        throw new Error(`Possible credential in ${file}; value withheld`);
      files++;
    }
  }
}
scan(".");
console.log(
  `Supply check passed: ${packages} license/registry/SHA-512/no-install-script records; ${files} source credential-pattern scans.`,
);
