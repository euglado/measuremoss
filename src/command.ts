import { SlashCommandBuilder } from "discord.js";
import { units } from "./convert.js";

const choices = Object.entries(units).map(([value, unit]) => ({ name: unit.label, value }));
export const command = new SlashCommandBuilder()
  .setName("measure")
  .setDescription("Convert units privately, then choose whether to share")
  .setDescriptionLocalizations({
    tr: "Birimleri özel olarak dönüştürün, ardından paylaşmayı seçin",
  })
  .addStringOption((o) =>
    o
      .setName("value")
      .setDescription("Decimal; dot/comma is decimal, never grouping (12.5 or 12,5)")
      .setDescriptionLocalizations({
        tr: "Ondalık; nokta/virgül ondalıktır, binlik değildir (12.5 veya 12,5)",
      })
      .setRequired(true)
      .setMaxLength(21),
  )
  .addStringOption((o) =>
    o
      .setName("from")
      .setDescription("Source unit")
      .setDescriptionLocalizations({ tr: "Kaynak birim" })
      .setRequired(true)
      .addChoices(...choices),
  )
  .addStringOption((o) =>
    o
      .setName("to")
      .setDescription("Target unit of the same kind")
      .setDescriptionLocalizations({ tr: "Aynı türden hedef birim" })
      .setRequired(true)
      .addChoices(...choices),
  );
