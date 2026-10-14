import assert from "node:assert/strict";
import test from "node:test";
import { ChannelType, MessageFlags, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { MeasureBot } from "../dist/bot.js";
import { command } from "../dist/command.js";

const perms = PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages;
function fixture() {
  let time = 1000;
  const bot = new MeasureBot("guild", () => time);
  const sent = [];
  const channel = {
    type: ChannelType.GuildText,
    isSendable: () => true,
    send: async (payload) => {
      sent.push(payload);
    },
  };
  function input(button = false, overrides = {}) {
    const replies = [];
    const i = {
      guildId: "guild",
      channelId: "channel",
      applicationId: "app",
      channel,
      user: { id: "user" },
      client: { user: { id: "bot" } },
      appPermissions: new PermissionsBitField(perms),
      memberPermissions: new PermissionsBitField(perms),
      commandName: "measure",
      customId: "",
      deferred: false,
      replied: false,
      message: { id: "preview", author: { id: "bot" }, webhookId: "app" },
      inGuild: () => true,
      isChatInputCommand: () => !button,
      isButton: () => button,
      options: { getString: (name) => ({ value: "2.5", from: "in", to: "cm" })[name] },
      reply: async (payload) => {
        replies.push(payload);
        i.replied = true;
        return { resource: { message: { id: "preview" } } };
      },
      editReply: async (payload) => {
        replies.push(payload);
      },
      update: async (payload) => {
        replies.push(payload);
        i.replied = true;
      },
      deferUpdate: async () => {
        i.deferred = true;
      },
      ...overrides,
    };
    return { i, replies };
  }
  async function preview(overrides) {
    const p = input(false, overrides);
    await bot.handle(p.i);
    return { ...p, id: [...bot.drafts.keys()].at(-1) };
  }
  async function click(id, action = "share", overrides) {
    const c = input(true, { customId: `mm:${action}:${id}`, ...overrides });
    await bot.handle(c.i);
    return c;
  }
  return {
    bot,
    sent,
    channel,
    input,
    preview,
    click,
    advance: (ms) => {
      time += ms;
    },
  };
}
test("slash command uses 16 explicit units and a bounded string decimal", () => {
  const json = command.toJSON();
  assert.equal(json.name, "measure");
  assert.equal(json.options[0].max_length, 21);
  assert.equal(json.options[1].choices.length, 16);
  assert.equal(json.options[2].choices.length, 16);
});
test("result stays private until explicit share with safe payload", async () => {
  const f = fixture();
  const p = await f.preview();
  assert.equal(f.sent.length, 0);
  assert.equal(p.replies[0].flags, MessageFlags.Ephemeral);
  assert.match(p.replies[0].content, /2.5 in ≈ 6.35 cm/);
  assert.equal(p.replies[0].components[0].components.length, 2);
  await f.click(p.id);
  assert.equal(f.sent.length, 1);
  assert.deepEqual(f.sent[0].allowedMentions.parse, []);
  assert.equal(f.sent[0].flags, MessageFlags.SuppressEmbeds);
  assert.equal(f.sent[0].nonce.length, 24);
  assert.equal(f.sent[0].enforceNonce, true);
  assert.match(f.sent[0].content, /6.35 cm/);
  assert.ok(!f.sent[0].content.includes("user"));
  assert.equal(f.bot.drafts.size, 0);
});
test("cancel erases draft without sharing", async () => {
  const f = fixture();
  const p = await f.preview();
  await f.click(p.id, "cancel");
  assert.equal(f.sent.length, 0);
  assert.equal(f.bot.drafts.size, 0);
});
for (const [name, overrides] of [
  ["different owner", { user: { id: "intruder" } }],
  ["different guild", { guildId: "other" }],
  ["different channel", { channelId: "other" }],
  ["different message", { message: { id: "other", author: { id: "bot" }, webhookId: "app" } }],
  ["different author", { message: { id: "preview", author: { id: "other" }, webhookId: "app" } }],
  ["different webhook", { message: { id: "preview", author: { id: "bot" }, webhookId: "other" } }],
  [
    "missing bot send permission",
    { appPermissions: new PermissionsBitField(PermissionFlagsBits.ViewChannel) },
  ],
  [
    "missing member send permission",
    { memberPermissions: new PermissionsBitField(PermissionFlagsBits.ViewChannel) },
  ],
  ["missing permissions", { appPermissions: null }],
  ["DM", { inGuild: () => false }],
  ["thread", { channel: { type: ChannelType.PublicThread } }],
  ["missing channel", { channel: null }],
])
  test(`share refuses ${name}`, async () => {
    const f = fixture();
    const p = await f.preview();
    const c = await f.click(p.id, "share", overrides);
    assert.equal(f.sent.length, 0);
    assert.equal(c.replies[0].flags, MessageFlags.Ephemeral);
  });
test("expired preview is rejected and periodic cleanup releases IDs", async () => {
  const f = fixture();
  const p = await f.preview();
  f.advance(300_000);
  f.bot.cleanup();
  assert.equal(f.bot.drafts.size, 0);
  assert.equal(f.bot.users.size, 0);
  await f.click(p.id);
  assert.equal(f.sent.length, 0);
});
test("malformed/unknown action and forged token cannot share", async () => {
  const f = fixture();
  const p = await f.preview();
  for (const id of [
    "mm:share:no",
    `mm:delete:${p.id}`,
    `mm:share:${"a".repeat(32)}`,
    `mm:share:${p.id}:extra`,
  ])
    await f.bot.handle(f.input(true, { customId: id }).i);
  assert.equal(f.sent.length, 0);
});
test("racing and repeated share clicks produce at most one message", async () => {
  const f = fixture();
  const p = await f.preview();
  await Promise.all([f.click(p.id), f.click(p.id), f.click(p.id)]);
  assert.equal(f.sent.length, 1);
});
test("channel throttle applies across users and expires", async () => {
  const f = fixture();
  const p = await f.preview();
  await f.click(p.id);
  const q = await f.preview({ user: { id: "other" } });
  await f.click(q.id, "share", { user: { id: "other" } });
  assert.equal(f.sent.length, 1);
  assert.ok(f.bot.drafts.has(q.id));
  f.advance(60_000);
  await f.click(q.id, "share", { user: { id: "other" } });
  assert.equal(f.sent.length, 2);
});
test("five-second conversion cooldown and draft cap bound memory", async () => {
  const f = fixture();
  await f.preview();
  await f.preview();
  assert.equal(f.bot.drafts.size, 1);
  f.advance(5000);
  await f.preview();
  assert.equal(f.bot.drafts.size, 2);
  while (f.bot.drafts.size < 100) f.bot.drafts.set(`cap${f.bot.drafts.size}`, { expires: 999999 });
  f.advance(5000);
  const p = await f.preview();
  assert.match(p.replies[0].content, /Busy/);
  assert.equal(f.bot.drafts.size, 100);
});
test("cooldown and channel maps have hard limits", async () => {
  const f = fixture();
  for (let n = 0; n < 500; n++) f.bot.users.set(`u${n}`, 999999);
  const p = await f.preview();
  assert.match(p.replies[0].content, /Busy/);
  assert.equal(f.bot.drafts.size, 0);
  f.bot.users.clear();
  const q = await f.preview();
  for (let n = 0; n < 500; n++) f.bot.channels.set(`c${n}`, 999999);
  await f.click(q.id);
  assert.equal(f.sent.length, 0);
  assert.equal(f.bot.channels.size, 500);
});
test("API send failure consumes preview and never echoes exception secrets", async () => {
  const f = fixture();
  f.channel.send = async () => {
    throw new Error("PRIVATE_SENTINEL");
  };
  const p = await f.preview();
  const c = await f.click(p.id);
  assert.equal(f.bot.drafts.size, 0);
  assert.ok(!JSON.stringify(c.replies).includes("PRIVATE_SENTINEL"));
  await f.click(p.id);
  assert.equal(f.sent.length, 0);
});
test("reply transport failure leaves no pending draft", async () => {
  const f = fixture();
  await f.preview({
    reply: async () => {
      throw new Error("PRIVATE_SENTINEL");
    },
  });
  assert.equal(f.bot.drafts.size, 0);
});
test("missing reply message fails closed", async () => {
  const f = fixture();
  await f.preview({ reply: async () => ({ resource: null }) });
  assert.equal(f.bot.drafts.size, 0);
});
test("permission change during acknowledgement prevents public send", async () => {
  const f = fixture();
  const p = await f.preview();
  const c = f.input(true, { customId: `mm:share:${p.id}` });
  c.i.deferUpdate = async () => {
    c.i.deferred = true;
    c.i.appPermissions = new PermissionsBitField(0n);
  };
  await f.bot.handle(c.i);
  assert.equal(f.sent.length, 0);
  assert.equal(f.bot.drafts.size, 0);
});
test("defer failure cannot replay publication", async () => {
  const f = fixture();
  const p = await f.preview();
  await f.click(p.id, "share", {
    deferUpdate: async () => {
      throw new Error("fail");
    },
  });
  await f.click(p.id);
  assert.equal(f.sent.length, 0);
});
test("confirmation edit failure cannot duplicate already sent result", async () => {
  const f = fixture();
  const p = await f.preview();
  await f.click(p.id, "share", {
    editReply: async () => {
      throw new Error("fail");
    },
  });
  await f.click(p.id);
  assert.equal(f.sent.length, 1);
});
test("invalid conversions create no drafts and never share", async () => {
  const f = fixture();
  const p = await f.preview({
    options: { getString: (name) => ({ value: "<@everyone>", from: "m", to: "g" })[name] },
  });
  assert.equal(f.bot.drafts.size, 0);
  assert.equal(f.sent.length, 0);
  assert.match(p.replies[0].content, /same kind/);
});
test("unrelated interactions are ignored", async () => {
  const f = fixture();
  const p = f.input(false, { commandName: "other" });
  await f.bot.handle(p.i);
  const q = f.input(true, { customId: "other" });
  await f.bot.handle(q.i);
  await f.bot.handle({ isChatInputCommand: () => false, isButton: () => false });
  assert.equal(p.replies.length + q.replies.length, 0);
});
test("restart cannot revive an old preview", async () => {
  const f = fixture();
  const p = await f.preview();
  const c = f.input(true, { customId: `mm:share:${p.id}` });
  await new MeasureBot("guild").handle(c.i);
  assert.equal(f.sent.length, 0);
});
