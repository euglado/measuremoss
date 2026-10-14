import { randomBytes } from "node:crypto";
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ChannelType,
  type ChatInputCommandInteraction,
  type Interaction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { convert, UserError } from "./convert.js";

type Input = ChatInputCommandInteraction | ButtonInteraction;
type Draft = {
  owner: string;
  guild: string;
  channel: string;
  message: string;
  result: string;
  expires: number;
};
export const footer =
  "Rounded to 10 significant digits; not measurement precision. Decimal point, e±n means powers of ten. / 10 anlamlı basamağa yuvarlanır; ölçüm hassasiyeti değildir. Nokta ondalıktır, e±n on kuvvetidir.";
export const safe = {
  allowedMentions: { parse: [] as never[], repliedUser: false },
  flags: MessageFlags.SuppressEmbeds as const,
};
export class MeasureBot {
  readonly drafts = new Map<string, Draft>();
  readonly users = new Map<string, number>();
  readonly channels = new Map<string, number>();
  constructor(
    readonly guild: string,
    readonly now: () => number = Date.now,
  ) {}
  cleanup() {
    const now = this.now();
    for (const [key, d] of this.drafts) if (d.expires <= now) this.drafts.delete(key);
    for (const map of [this.users, this.channels])
      for (const [key, until] of map) if (until <= now) map.delete(key);
  }
  private context(i: Input) {
    if (
      !i.inGuild() ||
      i.guildId !== this.guild ||
      !i.channelId ||
      !i.channel ||
      ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(i.channel.type)
    ) {
      throw new UserError(
        "Use a normal text or announcement channel in the configured server. / Ayarlanan sunucunun metin veya duyuru kanalında kullanın.",
      );
    }
    const permissions = PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages;
    if (!i.appPermissions?.has(permissions) || !i.memberPermissions?.has(permissions)) {
      throw new UserError(
        "Both you and the bot need View Channel + Send Messages here. / Bu kanalda siz ve bot Kanalı Görüntüle + Mesaj Gönder izinlerine sahip olmalısınız.",
      );
    }
  }
  private async reply(i: Input, content: string) {
    if (i.deferred || i.replied)
      await i.editReply({ content, components: [], allowedMentions: safe.allowedMentions });
    else
      await i.reply({
        content,
        flags: MessageFlags.Ephemeral,
        allowedMentions: safe.allowedMentions,
      });
  }
  async handle(interaction: Interaction) {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;
    const i = interaction;
    if (i.isChatInputCommand() ? i.commandName !== "measure" : !i.customId.startsWith("mm:"))
      return;
    this.cleanup();
    try {
      this.context(i);
      if (i.isChatInputCommand()) await this.preview(i);
      else await this.click(i);
    } catch (error) {
      const message =
        error instanceof UserError
          ? error.message
          : "Discord could not finish this request. Check the channel before retrying: a share may have succeeded. / Discord isteği tamamlayamadı. Tekrar denemeden kanalı kontrol edin; paylaşım gerçekleşmiş olabilir.";
      try {
        await this.reply(i, message);
      } catch {
        /* Interaction may have expired; never log payloads or tokens. */
      }
    }
  }
  private async preview(i: ChatInputCommandInteraction) {
    const now = this.now();
    if (this.users.has(i.user.id))
      throw new UserError(
        "Wait 5 seconds between conversions. / Dönüşümler arasında 5 saniye bekleyin.",
      );
    if (this.drafts.size >= 100 || this.users.size >= 500)
      throw new UserError("Busy; try again shortly. / Yoğun; kısa süre sonra tekrar deneyin.");
    const result = convert(
      i.options.getString("value", true),
      i.options.getString("from", true),
      i.options.getString("to", true),
    );
    const id = randomBytes(16).toString("hex");
    const draft: Draft = {
      owner: i.user.id,
      guild: i.guildId as string,
      channel: i.channelId,
      message: "",
      result,
      expires: now + 300_000,
    };
    this.drafts.set(id, draft);
    this.users.set(i.user.id, now + 5000);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`mm:share:${id}`)
        .setLabel("Share here / Burada paylaş")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`mm:cancel:${id}`)
        .setLabel("Discard / Vazgeç")
        .setStyle(ButtonStyle.Secondary),
    );
    try {
      const response = await i.reply({
        content: `${result}\n${footer}\n\nPrivate preview, expires in 5 minutes. Share posts this result to everyone who can see this channel. / Özel önizleme 5 dakika geçerlidir. Paylaş düğmesi sonucu bu kanalı gören herkese gönderir.`,
        flags: MessageFlags.Ephemeral,
        components: [row],
        allowedMentions: safe.allowedMentions,
        withResponse: true,
      });
      const message = response.resource?.message;
      if (!message?.id) throw new Error("No preview message");
      draft.message = message.id;
    } catch (error) {
      this.drafts.delete(id);
      throw error;
    }
  }
  private async click(i: ButtonInteraction) {
    const match = /^mm:(share|cancel):([a-f0-9]{32})$/.exec(i.customId);
    const action = match?.[1];
    const id = match?.[2];
    const draft = id ? this.drafts.get(id) : undefined;
    if (
      !id ||
      !draft ||
      draft.owner !== i.user.id ||
      draft.guild !== i.guildId ||
      draft.channel !== i.channelId ||
      draft.message !== i.message.id ||
      i.message.author.id !== i.client.user?.id ||
      i.message.webhookId !== i.applicationId
    ) {
      throw new UserError(
        "Preview expired or belongs to another context. Run /measure again. / Önizleme dolmuş veya başka bağlama ait. /measure komutunu tekrar kullanın.",
      );
    }
    if (action === "cancel") {
      this.drafts.delete(id);
      await i.update({
        content: "Discarded; nothing shared. / Vazgeçildi; paylaşım yapılmadı.",
        components: [],
        allowedMentions: safe.allowedMentions,
      });
      return;
    }
    if (this.channels.has(draft.channel))
      throw new UserError(
        "This channel can receive one shared result per minute. / Bu kanala dakikada bir sonuç paylaşılabilir.",
      );
    if (this.channels.size >= 500)
      throw new UserError(
        "Sharing is busy. Try again in a minute. / Paylaşım yoğun. Bir dakika sonra deneyin.",
      );
    // Consume and reserve synchronously before the first await: racing clicks cannot duplicate shares.
    this.drafts.delete(id);
    this.channels.set(draft.channel, this.now() + 60_000);
    await i.deferUpdate();
    // Recheck permissions after acknowledgement, immediately before the public write.
    this.context(i);
    if (!i.channel?.isSendable())
      throw new UserError("Channel unavailable. / Kanala erişilemiyor.");
    await i.channel.send({
      content: `MeasureMoss\n${draft.result}\n${footer}`,
      nonce: id.slice(0, 24),
      enforceNonce: true,
      ...safe,
    });
    await i.editReply({
      content: "Shared here. / Burada paylaşıldı.",
      components: [],
      allowedMentions: safe.allowedMentions,
    });
  }
}
