"use client";

export default function ThreatWarning() {
  return (
    <div className="flex-1 flex flex-col justify-center bg-[#111] border border-red-900/50 rounded-sm p-4 relative overflow-hidden min-h-0">
      {/* Subtle red gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />
      
      {/* Faint horizontal lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.3) 2px, rgba(255,0,0,0.3) 3px)'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Skull with pulse animation */}
        <div className="text-red-600 text-3xl mb-3 animate-pulse" style={{
          textShadow: '0 0 20px rgba(220, 38, 38, 0.5), 0 0 40px rgba(220, 38, 38, 0.3)'
        }}>
          ☠
        </div>

        {/* Title */}
        <h3 className="text-red-500/80 font-mono text-xs uppercase tracking-widest mb-3">
          THE RULES ARE SIMPLE
        </h3>

        {/* Rules list */}
        <ol className="text-gray-500 font-mono text-xs space-y-1.5 mb-4 text-left w-full max-w-[200px]">
          <li className="flex gap-2">
            <span className="text-red-700/60">1.</span>
            <span>Confess your darkest secret</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-700/60">2.</span>
            <span>Lock your LP in the vault</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-700/60">3.</span>
            <span>Stay loyal — or face exposure</span>
          </li>
        </ol>

        {/* Warning text */}
        <p className="text-gray-600 font-mono text-xs mb-2">
          Withdraw your LP...
        </p>
        <p className="text-red-400/70 font-mono text-xs mb-4">
          and the whole world knows.
        </p>

        {/* Final threat lines - brighter red with glow */}
        <div className="space-y-1">
          <p className="text-red-500 font-mono text-sm tracking-wide" style={{
            textShadow: '0 0 10px rgba(220, 38, 38, 0.4)'
          }}>
            The Snitch never sleeps.
          </p>
          <p className="text-red-500 font-mono text-sm tracking-wide" style={{
            textShadow: '0 0 10px rgba(220, 38, 38, 0.4)'
          }}>
            There is no escape.
          </p>
        </div>
      </div>
    </div>
  );
}
