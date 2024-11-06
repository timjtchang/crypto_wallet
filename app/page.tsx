"use client";

import {
  createConfig,
  WagmiProvider,
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useSwitchChain,
  useConfig,
} from "wagmi";

import { mainnet, sepolia } from "wagmi/chains";
import { http } from "viem";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { formatEther } from "viem";

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const url: string = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;

console.log(`https://eth-sepolia.g.alchemy.com/v2/${apiKey}`);
console.log(
  "https://eth-sepolia.g.alchemy.com/v2/nct9HluWchOoLlVjvG0T0iWwZ2B19wZL"
);

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(url),
  },
  connectors: [injected()],
});

const chains = config.chains;

const queryClient = new QueryClient();

function Profile() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const {
    data: balance,
    isLoading,
    isError,
  } = useBalance({ address: address });

  if (isConnected) {
    if (isLoading) return <div>Loading balance...</div>;
    if (isError) return <div>Error fetching balance</div>;
    return (
      <div>
        <div>Connected to {address}</div>
        <div>
          Balance:{" "}
          {balance ? `${formatEther(balance.value)}${balance.symbol}` : "N/A"}
        </div>
        {chain && <div>Connected to {chain.name}</div>}
        {[mainnet, sepolia].map((x) => (
          <div key={x.id}>
            <button
              disabled={!switchChain || x.id === chain?.id}
              onClick={() => switchChain({ chainId: x.id })}
            >
              {x.name} {x.id === chain?.id && "(current)"}
            </button>
          </div>
        ))}
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }
  return (
    <button onClick={() => connect({ connector: connectors[0] })}>
      Connect Wallet
    </button>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          <Profile />
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
