import type { Message } from "discord.js";

import type { CryptoDevClient } from "./CryptoDevClient";

export abstract class MessageCommand {
  readonly client: CryptoDevClient;
  readonly name: string;
  readonly aliases: string[];
  readonly description: string;
  readonly category: string;
  readonly usage: string;

  protected constructor(
    client: CryptoDevClient,
    name: string,
    options: Partial<{
      name: string;
      aliases: string[];
      description: string;
      category: string;
      usage: string;
    }> = {}
  ) {
    this.client = client;
    this.name = options.name || name;
    this.aliases = options.aliases || [];
    this.description = options.description || "No description provided.";
    this.category = options.category || "Miscellaneous";
    this.usage = `${this.client.prefix}${this.name} ${
      options.usage || ""
    }`.trim();
  }

  abstract run(message: Message, args: string[]): Promise<void>;
}
