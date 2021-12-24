import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

import * as config from "../../config.json";
import type { CryptoDevClient } from "../Structures/CryptoDevClient";
import { SlashCommand } from "../Structures/SlashCommand";

export class BalanceCommand extends SlashCommand {
  constructor(client: CryptoDevClient) {
    super(client, "balance", {
      aliases: [],
      description: "Check the bot balances for supported currencies.",
      category: "Utilities",
      usage: "<currency>",
      slashcommand_builder: new SlashCommandBuilder()
        .setName(`balance`)
        .setDescription(`Check the bot balances for supported currencies.`)
        .addStringOption((o) =>
          o
            .setName(`currency`)
            .setDescription(`The currency's balance`)
            .setRequired(true)
            .addChoices(config.currencies.map((r) => [r.label, r.tipcc]))
        )
        .toJSON(),
    });
  }

  async run(interaction: CommandInteraction): Promise<void> {
    interaction.reply({
      content: "Showing balance...",
      ephemeral: true,
    });
    interaction.channel?.send?.(
      interaction.options.getString("currency")
        ? "$bal " + interaction.options.getString("currency")
        : `$bal ${config.currencies[0].tipcc}`
    );
  }
}
