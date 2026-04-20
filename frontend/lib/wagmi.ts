import { createConfig, http } from "wagmi";
import { avalanche } from "wagmi/chains";

// Avalanche C-Chain configuration
export const config = createConfig({
  chains: [avalanche],
  transports: {
    [avalanche.id]: http("https://api.avax.network/ext/bc/C/rpc"),
  },
});
