import type { CommandInteraction } from "discord.js";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types";

import type { CryptoDevClient } from "./CryptoDevClient";

export abstract class SlashCommand {
  readonly client: CryptoDevClient;
  readonly name: string;
  readonly aliases: string[];
  readonly description: string;
  readonly category: string;
  readonly usage: string;
  readonly slashcommand_builder: RESTPostAPIApplicationCommandsJSONBody;

  protected constructor(
    client: CryptoDevClient,
    name: string,
    options: {
      name?: string;
      aliases?: string[];
      description?: string;
      category?: string;
      usage?: string;
      slashcommand_builder: RESTPostAPIApplicationCommandsJSONBody;
    }
  ) {
    this.client = client;
    this.name = options.name || name;
    this.aliases = options.aliases || [];
    this.description = options.description || "No description provided.";
    this.category = options.category || "Miscellaneous";
    this.usage = `/${this.name} ${options.usage ?? ""}`.trim();
    this.slashcommand_builder = options.slashcommand_builder;
  }

  abstract run(interaction: CommandInteraction): Promise<void>;
}
