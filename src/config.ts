import { UserError } from "./convert.js";
export function config(env: NodeJS.ProcessEnv = process.env) {
  const token = env.DISCORD_TOKEN?.trim();
  const application = env.DISCORD_APPLICATION_ID?.trim();
  const guild = env.DISCORD_GUILD_ID?.trim();
  if (
    !token ||
    /\s/.test(token) ||
    !/^\d{17,20}$/.test(application ?? "") ||
    !/^\d{17,20}$/.test(guild ?? "")
  ) {
    throw new UserError(
      "Configuration missing or invalid. Run setup.cmd or ./setup.sh. / Ayarlar eksik veya geçersiz; kurulum yardımcısını çalıştırın.",
    );
  }
  return { token, application: application as string, guild: guild as string };
}
