export type Tip = {
  sender: string;
  receiver: string;
  amount: string;
  currency: string;
  valid: boolean;
};

export async function parseTip(tipMsg: string): Promise<Tip> {
  const users = tipMsg
    .split("<@")
    ?.slice(1)
    ?.map((r) => {
      return r.split(">")[0].replaceAll(/[^0-9]/g, "");
    });

  const sender = users[0];
  const receiver = users[1];
  const amount = tipMsg
    .split("**")[1]
    .split(" ")[0]
    .replaceAll(/[^0-9.]/g, "");
  const currency = tipMsg.split("**")[1].split(" ").slice(1).join(" ");
  return {
    sender,
    receiver,
    amount,
    currency,
    valid: ![
      typeof sender,
      typeof receiver,
      typeof amount,
      typeof currency,
    ].includes("undefined"),
  };
}
