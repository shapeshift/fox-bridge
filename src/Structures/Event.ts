import type { CryptoDevClient } from "./CryptoDevClient";

type EventHandlerRegistrationHandler = (
  name: string,
  handler: (...args: any) => void
) => void;

export abstract class Event {
  readonly name: string;
  readonly client: CryptoDevClient;
  readonly once: boolean;

  protected constructor(
    client: CryptoDevClient,
    name: string,
    options: Partial<{
      once: boolean;
    }> = {}
  ) {
    this.name = name;
    this.client = client;
    this.once = !!options.once;

    if (this.once) {
      this.client.once(this.name, (...args: any) => this.run(...args));
    } else {
      this.client.on(this.name, (...args: any) => this.run(...args));
    }
  }

  abstract run(...args: any): Promise<void>;
}
