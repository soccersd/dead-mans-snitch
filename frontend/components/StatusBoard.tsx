"use client";

import { useState, useEffect } from "react";

interface Prisoner {
  wallet: string;
  score: number;
  locked_at: string;
}

interface Traitor {
  wallet: string;
  secret_preview: string;
  exposed_at: string;
  tweet_url: string;
}

interface StatusData {
  prisoners: Prisoner[];
  traitors: Traitor[];
}

const FALLBACK_DATA: StatusData = {
  prisoners: [
    { wallet: "0x7a250d...488D", score: 89, locked_at: new Date(Date.now() - 12*3600000).toISOString() },
    { wallet: "0x3fC91A...7FAD", score: 95, locked_at: new Date(Date.now() - 48*3600000).toISOString() },
    { wallet: "0xdAC17F...1ec7", score: 92, locked_at: new Date(Date.now() - 5*3600000).toISOString() },
  ],
  traitors: [
    { wallet: "0x1f9840...F984", secret_preview: "I rugged my own community by dumping tokens righ...", exposed_at: new Date(Date.now() - 5*86400000).toISOString(), tweet_url: "#" },
    { wallet: "0x514910...86CA", secret_preview: "I copied another project's entire codebase and cl...", exposed_at: new Date(Date.now() - 86400000).toISOString(), tweet_url: "#" },
  ]
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface StatusBoardProps {
  refreshTrigger?: number;
}

export function StatusBoard({ refreshTrigger }: StatusBoardProps = {}) {
  const [data, setData] = useState<StatusData>({ prisoners: [], traitors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("http://localhost:8000/status");
        if (!response.ok) {
          throw new Error("Failed to fetch status");
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        // Use fallback demo data when backend is unavailable
        setData(FALLBACK_DATA);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);

    return () => clearInterval(interval);
  }, [refreshTrigger]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Section Title - Inline */}
      <h2 className="text-vault-red font-mono text-xs uppercase tracking-widest mb-2 shrink-0">
        THE VAULT LEDGER
      </h2>

      {/* Error State */}
      {error && (
        <div className="text-center py-4 border border-vault-red bg-vault-red/10 mb-2 shrink-0">
          <p className="text-vault-red font-mono text-xs uppercase tracking-wider">
            ⚠ {error} ⚠
          </p>
        </div>
      )}

      {/* Two Panel Layout - Vertical Stack */}
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        {/* Top Panel - Current Prisoners */}
        <div className="border border-vault-gray bg-[#111] flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center gap-3 p-2 border-b border-vault-gray bg-vault-black-light shrink-0">
            <span className="text-vault-red text-sm">☠</span>
            <h3 className="text-white font-mono text-xs uppercase tracking-wider">
              PRISONERS
            </h3>
            <span className="ml-auto text-vault-gray-light font-mono text-xs">
              {data.prisoners.length}
            </span>
          </div>

          {/* Content */}
          <div className="p-2 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full py-4">
                <div className="w-4 h-4 border-2 border-vault-red border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data.prisoners.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-vault-gray-light font-mono text-xs italic">
                  No prisoners yet... The vault awaits.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.prisoners.map((prisoner, index) => (
                  <div
                    key={index}
                    className="p-2 border border-vault-gray bg-vault-black hover:border-vault-red-dark transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-mono text-xs">
                        {truncateAddress(prisoner.wallet)}
                      </span>
                      <span className="text-vault-red font-mono text-xs">
                        [{prisoner.score}]
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 h-1 bg-vault-gray-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-vault-red transition-all duration-500"
                          style={{ width: `${prisoner.score}%` }}
                        />
                      </div>
                      <span className="text-vault-gray-light font-mono text-xs ml-2">
                        {formatRelativeTime(prisoner.locked_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Panel - Traitors */}
        <div className="border border-vault-gray bg-[#111] flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center gap-3 p-2 border-b border-vault-gray bg-vault-black-light shrink-0">
            <span className="text-vault-red text-sm">⚠</span>
            <h3 className="text-white font-mono text-xs uppercase tracking-wider">
              TRAITORS
            </h3>
            <span className="ml-auto text-vault-gray-light font-mono text-xs">
              {data.traitors.length}
            </span>
          </div>

          {/* Content */}
          <div className="p-2 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full py-4">
                <div className="w-4 h-4 border-2 border-vault-red border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data.traitors.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-vault-gray-light font-mono text-xs italic">
                  No traitors... yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.traitors.map((traitor, index) => (
                  <div
                    key={index}
                    className="p-2 border border-vault-red-dark bg-vault-red/5 hover:border-vault-red transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-mono text-xs">
                        {truncateAddress(traitor.wallet)}
                      </span>
                      <span className="text-vault-red font-mono text-xs">
                        {formatDate(traitor.exposed_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
