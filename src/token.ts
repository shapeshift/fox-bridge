export const BOT_TOKEN = (() => {
  const out = process.env["BOT_TOKEN"];
  if (!out) throw new Error("BOT_TOKEN not set");
  return out
})();
