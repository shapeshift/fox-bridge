import type { Interaction } from "discord.js";

import type { CryptoDevClient } from "../Structures/CryptoDevClient";
import { Event } from "../Structures/Event";

export class InteractionCreateEvent extends Event {
  constructor(client: CryptoDevClient) {
    super(client, "interactionCreate");
  }

  async run(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand()) return;

    const cmd = interaction.commandName.toLowerCase();
    const command =
      this.client.slashCommands.get(cmd) ||
      this.client.slashCommands.get(this.client.slashAliases.get(cmd) ?? '');
    if (command) command.run(interaction);
  }
}
