import 'dotenv/config'

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import { presence_game } from "../../config.json";
import type { CryptoDevClient } from "../Structures/CryptoDevClient";
import { Event } from "../Structures/Event";

import { BOT_TOKEN } from "../token";

export class ReadyEvent extends Event {
  constructor(client: CryptoDevClient) {
    super(client, "ready", {
      once: true,
    });
  }

  async run(): Promise<void> {
    const user = this.client.user
    if (!user) throw new Error("ready, but user is nullish")

    console.log(
      [
        `Logged in as ${user.tag}`,
        `Loaded ${this.client.events.size} events!`,
        `Loaded ${this.client.messageCommands.size} message commands!`,
        `Loaded ${this.client.slashCommands.size} slash commands!`,
      ].join("\n")
    );

    await user.setPresence({
      status: "online",
      activities: [
        {
          name: `${presence_game}`,
          type: "PLAYING",
        },
      ],
    });

    const refresh_slash_commands = async () => {
      try {
        console.log("Started refreshing application (/) commands.");
        const rest = new REST({ version: "9" }).setToken(BOT_TOKEN);
        const body = this.client.slashCommands.map((r) => r.slashcommand_builder)
        await rest.put(Routes.applicationCommands(user.id), { body });
        console.log(`Successfully reloaded ${body.length} application (/) commands.`);
      } catch (error) {
        console.error(error);
      }
    };

    await refresh_slash_commands()
  }
}
