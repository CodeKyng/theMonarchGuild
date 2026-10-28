import { createThirdwebClient, getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";

export const thirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID ?? "5386229533495b8a7d71b04a5ba1fa67",
});

/** Base Sepolia TMG token created via thirdweb */
export const TMG_TOKEN_ADDRESS = "0x2fFb9f9A31aF5b29000Edaed215bc29290DdCe5b" as const;

export const tmgTokenContract = getContract({
  client: thirdwebClient,
  chain: baseSepolia,
  address: TMG_TOKEN_ADDRESS,
});

export const TASK_CHAIN = baseSepolia;
