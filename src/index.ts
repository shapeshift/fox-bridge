const { CryptoDevClient } = require("./Structures/CryptoDevClient");
const config = require("../config.json");
const { BOT_TOKEN } = require("./token");

const client = new CryptoDevClient({
  token: BOT_TOKEN,
  ...config,
});
client.start()
