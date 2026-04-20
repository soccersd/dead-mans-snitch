"use client";

interface VaultLockProps {
  accepted: boolean;
  score: number;
  message: string;
  onLock: () => void;
  loading?: boolean;
}

export function VaultLock({
  accepted,
  score,
  message,
  onLock,
  loading,
}: VaultLockProps) {
  const isEnabled = accepted && score >= 60;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Vault Lock Button */}
      <button
        onClick={onLock}
        disabled={!isEnabled || loading}
        className={`
          relative w-full max-w-md py-3 px-6
          font-mono text-sm uppercase tracking-widest
          border-2 transition-all duration-300
          ${
            isEnabled && !loading
              ? `
                bg-vault-red/10 border-vault-red text-vault-red
                hover:bg-vault-red hover:text-white
                animate-pulse-red cursor-pointer
                glow-red
              `
              : `
                bg-vault-black-light border-vault-gray text-vault-gray
                cursor-not-allowed
              `
          }
        `}
      >
        {/* Vault mechanism styling */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-current opacity-50" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-current opacity-50" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-current opacity-50" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-current opacity-50" />

        {/* Center bolt decoration */}
        <div className="flex items-center justify-center gap-4">
          <div
            className={`
              w-2 h-2 rounded-full
              ${isEnabled && !loading ? "bg-vault-red animate-pulse" : "bg-vault-gray"}
            `}
          />
          <span>
            {loading
              ? "PROCESSING..."
              : isEnabled
              ? "LOCK IN THE VAULT"
              : "SECRET TOO WEAK"}
          </span>
          <div
            className={`
              w-2 h-2 rounded-full
              ${isEnabled && !loading ? "bg-vault-red animate-pulse" : "bg-vault-gray"}
            `}
          />
        </div>

        {/* Loading spinner overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-vault-black/50">
            <div className="w-6 h-6 border-2 border-vault-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {/* Judge's message */}
      {message && (
        <div className="max-w-md text-center">
          <p
            className={`
              font-mono text-xs italic
              ${isEnabled ? "text-vault-red" : "text-vault-gray-light"}
            `}
          >
            &ldquo;{message}&rdquo;
          </p>
          <p className="text-vault-gray text-xs font-mono mt-1">
            — The Judge
          </p>
        </div>
      )}

      {/* Score requirement hint */}
      {!isEnabled && !loading && score > 0 && (
        <p className="text-vault-gray-light font-mono text-xs">
          Score must be at least 60 to lock
        </p>
      )}
    </div>
  );
}
