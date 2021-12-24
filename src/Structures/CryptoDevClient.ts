import { Client, Collection, Intents } from "discord.js";

import { Event } from "./Event";
import { MessageCommand } from "./MessageCommand";
import { SlashCommand } from "./SlashCommand";

import * as Events from "../Events";
import * as MessageCommands from "../MessageCommands";
import * as SlashCommands from "../SlashCommands";

export class CryptoDevClient extends Client {
  readonly token: string
  readonly messageCommands = new Collection<string, MessageCommand>();
  readonly slashCommands = new Collection<string, SlashCommand>();
  readonly messageAliases = new Collection<string, string>();
  readonly slashAliases = new Collection<string, string>();
  readonly events = new Collection<string, Event>();
  readonly prefix: string;
  readonly owners: string[];

  constructor(options: { token: string; prefix: string; owners: string[] }) {
    super({
      // disableMentions: ['everyone'],
      intents: [
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      allowedMentions: {
        repliedUser: false,
      },
    });

    this.token = options.token;
    this.prefix = options.prefix;
    this.owners = options.owners;
  }

  async start(): Promise<void> {
    for (const messageCommand of Object.values(MessageCommands)) {
      const instance = new messageCommand(this);
      this.messageCommands.set(instance.name, instance);
      for (const alias of instance.aliases) {
        this.messageAliases.set(alias, instance.name);
      }
    }

    for (const slashCommand of Object.values(SlashCommands)) {
      const instance = new slashCommand(this);
      this.slashCommands.set(instance.name, instance);
      for (const alias of instance.aliases) {
        this.slashAliases.set(alias, instance.name);
      }
    }

    for (const event of Object.values(Events)) {
      const instance = new event(this);
      this.events.set(instance.name, instance);
    }

    await super.login(this.token);
  }
}
