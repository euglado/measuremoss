import { existsSync, writeFileSync } from "node:fs";
import { stdin, stdout } from "node:process";
import { createInterface, emitKeypressEvents } from "node:readline";

function hiddenToken() {
  return new Promise((resolve, reject) => {
    let value = "";
    stdout.write("Bot token (hidden / gizli): ");
    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();
    const finish = (error) => {
      stdin.off("keypress", onKey);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const onKey = (text, key = {}) => {
      if (key.ctrl && key.name === "c") return finish(new Error("Cancelled"));
      if (key.name === "return") return finish();
      if (key.name === "backspace") {
        value = value.slice(0, -1);
        return;
      }
      if (
        !key.ctrl &&
        !key.meta &&
        /^[A-Za-z0-9._-]+$/.test(text ?? "") &&
        value.length + text.length <= 200
      )
        value += text;
    };
    stdin.on("keypress", onKey);
  });
}
try {
  if (existsSync(".env"))
    throw new Error(
      "A .env already exists; move it privately before setup. / .env zaten var; yeniden kurmadan önce güvenli bir yere taşıyın.",
    );
  if (!stdin.isTTY || !stdout.isTTY)
    throw new Error(
      "Interactive terminal required; .env was not written. / Etkileşimli terminal gerekli; .env yazılmadı.",
    );
  const rl = createInterface({ input: stdin, output: stdout });
  const ask = (question) => new Promise((resolve) => rl.question(question, resolve));
  const application = (await ask("Application ID / Uygulama kimliği: ")).trim();
  const guild = (await ask("Server ID / Sunucu kimliği: ")).trim();
  rl.close();
  if (!/^\d{17,20}$/.test(application) || !/^\d{17,20}$/.test(guild))
    throw new Error("IDs must be 17–20 digits. / Kimlikler 17–20 rakam olmalı.");
  const token = await hiddenToken();
  if (!/^[A-Za-z0-9._-]{20,200}$/.test(token))
    throw new Error("Invalid token format; nothing saved. / Token biçimi geçersiz; kaydedilmedi.");
  const settings = {
    DISCORD_TOKEN: token,
    DISCORD_APPLICATION_ID: application,
    DISCORD_GUILD_ID: guild,
  };
  writeFileSync(
    ".env",
    `${Object.entries(settings)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")}\n`,
    { flag: "wx", mode: 0o600 },
  );
  const invite = new URL("https://discord.com/oauth2/authorize");
  invite.search = new URLSearchParams({
    client_id: application,
    scope: "bot applications.commands",
    permissions: "3072",
    guild_id: guild,
    disable_guild_select: "true",
    integration_type: "0",
  }).toString();
  console.log(
    `Saved locally / Yerel kaydedildi. Keep .env private / .env dosyasını gizli tutun.\nInstall / Sunucuya ekle: ${invite}\nThen run npm run register / Sonra npm run register çalıştırın.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : "Setup failed / Kurulum başarısız.");
  process.exitCode = 1;
}
