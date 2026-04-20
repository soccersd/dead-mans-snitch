"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

interface WalletConnectProps {
  onAddressChange?: (address: string | null) => void;
}

const DEMO_ADDRESS = "0xd3aD000000000000000000000000M4n5Sn1tCh";
const DEMO_DISPLAY = "0xd3aD...M4n5Sn1tCh";

export function WalletConnect({ onAddressChange }: WalletConnectProps) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [demoWallet, setDemoWallet] = useState<string | null>(null);

  // If real wallet connects while demo is active, deactivate demo
  useEffect(() => {
    if (isConnected && address && demoWallet) {
      setDemoWallet(null);
    }
  }, [isConnected, address, demoWallet]);

  // Notify parent of address changes
  useEffect(() => {
    if (isConnected && address) {
      onAddressChange?.(address);
    } else if (demoWallet) {
      onAddressChange?.(demoWallet);
    } else {
      onAddressChange?.(null);
    }
  }, [isConnected, address, demoWallet, onAddressChange]);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleDemoConnect = () => {
    setDemoWallet(DEMO_ADDRESS);
  };

  const handleDemoDisconnect = () => {
    setDemoWallet(null);
  };

  // Real wallet connected state
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-vault-gray-light text-xs font-mono">
          {truncateAddress(address)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 bg-vault-black-light border border-vault-gray text-vault-red font-mono text-xs uppercase tracking-wider hover:border-vault-red hover:glow-red-subtle transition-all duration-200"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Demo wallet connected state
  if (demoWallet) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-vault-gray-light text-xs font-mono">
          {DEMO_DISPLAY}
        </span>
        <button
          onClick={handleDemoDisconnect}
          className="px-3 py-1.5 bg-vault-black-light border border-dashed border-vault-gray text-vault-gray-light font-mono text-xs uppercase tracking-wider hover:border-vault-red hover:text-vault-red transition-all duration-200"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // No wallet connected - show both options
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => connect({ connector: injected() })}
        className="px-4 py-1.5 bg-vault-red border border-vault-red-dark text-white font-mono text-xs uppercase tracking-wider hover:bg-vault-red-light hover:glow-red transition-all duration-200"
      >
        Connect
      </button>
    </div>
  );
}
