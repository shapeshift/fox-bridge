import type { Message } from "discord.js";
import { owners } from "../../config.json";
import type { CryptoDevClient } from "../Structures/CryptoDevClient";
import { MessageCommand } from "../Structures/MessageCommand";

export class SendCommand extends MessageCommand {
  constructor(client: CryptoDevClient) {
    super(client, "send", {
      aliases: [],
      description: "Makes the bot send a particular message.",
      category: "Utilities",
    });
  }

  async run(message: Message, args: string[]) {
    if (!owners.includes(message.author.id)) return;
    message.channel.send({
      content:
        args.join(" ").length === 0
          ? `Please provide a text, ${message.author.toString()}!`
          : args.join(" "),
    });
  }
}
