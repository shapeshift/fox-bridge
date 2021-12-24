const { CryptoDevClient } = require("./Structures/CryptoDevClient");
const config = require("../config.json");

const client = new CryptoDevClient(config);
client.start()
