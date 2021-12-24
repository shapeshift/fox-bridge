import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

import type { CryptoDevClient } from "../Structures/CryptoDevClient";
import { SlashCommand } from "../Structures/SlashCommand";
import { removeDuplicates } from "../Structures/Util";

export class HelpCommand extends SlashCommand {
  constructor(client: CryptoDevClient) {
    super(client, "help", {
      aliases: [],
      description: "Displays all the commands in the bot",
      category: "Utilities",
      usage: "[command]",
      slashcommand_builder: new SlashCommandBuilder()
        .setName(`help`)
        .setDescription(`Displays the bot commands`)
        .addStringOption((o) =>
          o
            .setName(`command`)
            .setDescription(`Further information about a specific command`)
            .setRequired(false)
        )
        .toJSON(),
    });
  }

  async run(interaction: CommandInteraction): Promise<void> {
    const embed = new MessageEmbed()
      .setColor("BLUE")
      .setAuthor(
        `${interaction.guild?.name ?? ''} Help Menu`,
        interaction.guild?.iconURL?.({ dynamic: true }) ?? ''
      )
      .setThumbnail(this.client.user!.displayAvatarURL())
      .setFooter(
        `Requested by ${interaction.user.username}`,
        interaction.user.displayAvatarURL({ dynamic: true })
      )
      .setTimestamp()
      .setDescription(
        [
          `These are the available commands for ${interaction.guild?.name}`,
          `The bot's prefix is: ${this.client.prefix}`,
          `Command Parameters: \`<>\` is strict & \`[]\` is optional`,
        ].join("\n")
      );

    let categories;
    if (!this.client.owners.includes(interaction.user.id)) {
      categories = removeDuplicates(
        this.client.slashCommands
          .filter((cmd) => cmd.category !== "Owner")
          .map((cmd) => cmd.category)
      );
    } else {
      categories = removeDuplicates(
        this.client.slashCommands.map((cmd) => cmd.category)
      );
    }

    for (const category of categories) {
      embed.addField(
        `**${category}**`,
        this.client.slashCommands
          .filter((cmd) => cmd.category === category)
          .map((cmd) => `\`${cmd.name}\``)
          .join(" ")
      );
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}
