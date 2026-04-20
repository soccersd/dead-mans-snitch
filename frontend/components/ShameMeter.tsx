"use client";

interface ShameMeterProps {
  score: number;
  loading: boolean;
}

function getScoreColor(score: number): string {
  if (score <= 30) return "#22c55e"; // green
  if (score <= 50) return "#eab308"; // yellow
  if (score <= 60) return "#f97316"; // orange
  return "#DC2626"; // red
}

function getScoreLabel(score: number): string {
  if (score <= 30) return "INNOCENT";
  if (score <= 50) return "MILD SHAME";
  if (score <= 60) return "DARK SECRET";
  return "WORTHY OF THE VAULT";
}

export function ShameMeter({ score, loading }: ShameMeterProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const isHighScore = score >= 60;

  return (
    <div className="w-full shrink-0">
      {/* Label */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-vault-gray-light font-mono text-xs uppercase tracking-widest">
          SHAME-O-METER
        </span>
        <span
          className="font-mono text-xs uppercase tracking-wider"
          style={{ color }}
        >
          {label}
        </span>
      </div>

      {/* Bar container */}
      <div
        className={`
          relative h-4 bg-vault-black-light border border-vault-gray overflow-hidden
          ${loading ? "animate-pulse" : ""}
          ${isHighScore ? "animate-pulse-red" : ""}
        `}
      >
        {/* Fill bar */}
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${score}%`,
            backgroundColor: color,
            boxShadow: isHighScore
              ? `0 0 10px ${color}, 0 0 20px ${color}80`
              : "none",
          }}
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-vault-red/20 animate-pulse" />
        )}
      </div>

      {/* Score display */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-vault-gray-light font-mono text-xs">0</span>
        <span
          className={`
            font-mono text-xl font-bold
            ${isHighScore ? "glow-red-text" : ""}
          `}
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-vault-gray-light font-mono text-xs">100</span>
      </div>

      {/* High score indicator */}
      {isHighScore && (
        <div className="mt-1 text-center">
          <span className="text-vault-red font-mono text-xs uppercase tracking-widest animate-glow">
            ⚠ THRESHOLD EXCEEDED ⚠
          </span>
        </div>
      )}
    </div>
  );
}
