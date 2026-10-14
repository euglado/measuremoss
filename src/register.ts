import { REST, Routes } from "discord.js";
import { command } from "./command.js";
import { config } from "./config.js";

try {
  const settings = config();
  // POST upserts this command by name, preserving other commands on the application.
  await new REST({ version: "10" })
    .setToken(settings.token)
    .post(Routes.applicationGuildCommands(settings.application, settings.guild), {
      body: command.toJSON(),
    });
  console.log("/measure registered / kaydedildi. Start the bot / Botu başlatın.");
} catch {
  console.error(
    "Registration failed. Check setup, server installation and credentials. / Komut kaydedilemedi. Kurulumu, sunucu kurulumunu ve kimlik bilgilerini kontrol edin.",
  );
  process.exitCode = 1;
}
