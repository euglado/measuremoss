import { Client, Events, GatewayIntentBits, Options } from "discord.js";
import { MeasureBot } from "./bot.js";
import { config } from "./config.js";

try {
  const settings = config();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    makeCache: Options.cacheWithLimits({
      MessageManager: 0,
      UserManager: 0,
      GuildMemberManager: 0,
    }),
    allowedMentions: { parse: [] },
  });
  const bot = new MeasureBot(settings.guild);
  const cleanup = setInterval(() => bot.cleanup(), 60_000);
  cleanup.unref();
  client.on(Events.InteractionCreate, (i) => {
    void bot.handle(i);
  });
  client.once(Events.ClientReady, () => console.log("MeasureMoss ready / hazır. Use /measure."));
  client.on(Events.Error, () =>
    console.error("Discord connection error. / Discord bağlantı hatası."),
  );
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      clearInterval(cleanup);
      client.destroy();
      process.exit(0);
    });
  await client.login(settings.token);
} catch {
  console.error(
    "Startup failed. Check setup, token, internet and Node 24. / Başlatılamadı. Kurulumu, tokenı, interneti ve Node 24'ü kontrol edin.",
  );
  process.exitCode = 1;
}
