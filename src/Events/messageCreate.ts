import {
  Message,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  MessageComponentInteraction,
} from "discord.js";

import * as config from "../../config.json";
import { Tip, parseTip } from "../Core/Tip";
import type { CryptoDevClient } from "../Structures/CryptoDevClient";
import { Event } from "../Structures/Event";

class TipTimeoutError extends Error {}

export class MessageCreateEvent extends Event {
  constructor(client: CryptoDevClient) {
    super(client, "messageCreate");
  }

  async returnTip(tip: Tip, channel: Message["channel"]): Promise<void> {
    const m = await channel.send(
      `\$tip <@${tip.sender}> ${tip.amount} ${tip.currency}`
    );
    await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
    m.delete();
  }

  async run(message: Message): Promise<void> {
    if (message.author.id === config.tipcc_bot_id) {
      await this.processTipccBotMsg(message)
    } else if (message.content.startsWith(this.client.prefix)) {
      const [ rawCmd, ...args ] = message.content.split(' ');
      const cmd = rawCmd.slice(this.client.prefix.length)
      const command =
        this.client.messageCommands.get(cmd) ||
        this.client.messageCommands.get(this.client.messageAliases.get(cmd) ?? '');
      if (command) command.run(message, args);
    }
  }

  async processTipccBotMsg(message: Message): Promise<void> {
    if (!message.content.includes("sent")) return;
    if (message.content.includes("donate")) return;

    const tip = await parseTip(message.content);

    if (!tip.valid) return;
    if (tip.receiver !== this.client.user?.id) return;
    if (tip.sender === tip.receiver) return;

    const outputCurrencies = config.currencies.filter(
      (r) => r.tipcc.toUpperCase() !== tip.currency.toUpperCase()
    );

    if (outputCurrencies.length === config.currencies.length) {
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle(`🚫 Tip error`)
            .setDescription(
              `<@${tip.sender}>, sorry but you can only use ${config.currencies
                .map((r) => {
                  return `**\`${r.label}\`**`;
                })
                .join(", ")} with this bot!`
            )
            .setColor("DARK_RED"),
        ],
      });
      return this.returnTip(tip, message.channel);
    }

    const buttons = outputCurrencies
      .map((otherCurrency) =>
        new MessageButton()
          .setLabel(`${otherCurrency.label}`)
          .setEmoji(`${otherCurrency.emote}`)
          .setStyle("PRIMARY")
          .setCustomId(`${otherCurrency.label}`)
      )
      .concat(
        (config.owners.includes(tip.sender) ? [
          new MessageButton()
              .setLabel("Donate")
              .setStyle("SECONDARY")
              .setCustomId("donate")
        ] : []), [
        new MessageButton()
          .setLabel("Cancel")
          .setStyle("DANGER")
          .setCustomId("cancel"),
      ]);

    const humanTimeout = `${config.swap_timeout / 1000} seconds`;
    const reply = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`Deposit confirmed`)
          .setDescription(
            `Which currency would you like to convert to? (If you cancel or don't choose within the next ${humanTimeout}, the funds will be tipped back as-is.)`
          )
          .addField(`Your Tip`, `${tip.amount} ${tip.currency}`)
          .setColor("BLUE"),
      ],
      components: [new MessageActionRow().addComponents(buttons)],
    });

    const collector = await reply.createMessageComponentCollector({
      filter: (interaction) =>
        interaction.user.id === tip.sender &&
        (outputCurrencies.some((r) => r.label === interaction.customId) ||
          ["cancel", "donate"].includes(interaction.customId)),
      max: 1,
      time: config.swap_timeout,
    });

    try {
      const response = await new Promise<MessageComponentInteraction>((resolve, reject) => {
        collector.once("collect", (x) => resolve(x));
        collector.once("end", () => reject(new TipTimeoutError()));
      });
      switch (response.customId) {
        case "donate": {
          reply.edit({
            embeds: [
              new MessageEmbed()
                .setTitle(`💸 Tip Donated`)
                .setDescription(`<@${tip.sender}>, thanks for the donation!`)
                .setColor("GREEN"),
            ],
            components: [],
          });
          break;
        }
        case "cancel": {
          reply.edit({
            embeds: [
              new MessageEmbed()
                .setTitle(`🚫 Tip error`)
                .setDescription(`<@${tip.sender}>, you've cancelled the swap!`)
                .setColor("DARK_RED"),
            ],
            components: [],
          });
          return this.returnTip(tip, message.channel);
        }
        default: {
          const outputCurrency = outputCurrencies.find(
            (r) => r.label === response.customId
          );
          if (!outputCurrency) return;

          reply.edit({
            embeds: [
              new MessageEmbed()
                .setTitle(`Swap confirmed`)
                .setDescription(`Your swap was successful!`)
                .addField(`Your Tip`, `${tip.amount} ${tip.currency}`)
                .addField(`Your Pick`, `${tip.amount} ${outputCurrency.tipcc}`)
                .setColor("GREEN"),
            ],
            components: [],
          });

          const outputTipMsg = await message.channel.send({
            content: `\$tip <@${tip.sender}> ${tip.amount} ${outputCurrency.tipcc}`,
          });

          const insufficentFundsMsgCollector =
            await message.channel.createMessageCollector({
              filter: (reply) => {
                if (!reply.embeds[0]?.title?.includes?.("Insufficient balance")) return false
                if (reply.author.id !== config.tipcc_bot_id) return false
                if (!reply.embeds[0]?.description?.includes?.(this.client.user?.id ?? '')) return false
                if (reply.reference?.messageId !== outputTipMsg.id) return false
                return true
              },
              max: 1,
              time: config.swap_timeout + 5 * 1000,
            });

          insufficentFundsMsgCollector.on("collect", () =>
            this.returnTip(tip, message.channel)
          );
        }
      }
    } catch (e) {
      if (!(e instanceof TipTimeoutError)) throw e;
      reply.edit({
        embeds: [
          new MessageEmbed()
            .setTitle(`🚫 Tip error`)
            .setDescription(`<@${tip.sender}>, sorry but the swap timed out!`)
            .setColor("DARK_RED"),
        ],
        components: [],
      });
      await this.returnTip(tip, message.channel);
    }
  }
}
