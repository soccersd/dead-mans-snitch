"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { SecretInput } from "@/components/SecretInput";
import { ShameMeter } from "@/components/ShameMeter";
import { VaultLock } from "@/components/VaultLock";
import { StatusBoard } from "@/components/StatusBoard";
import { useShameMeter } from "@/hooks/useShameMeter";
import ThreatWarning from "@/components/ThreatWarning";

const DEMO_SEQUENCE = [
  {
    text: "I don't like pineapple on pizza",
    targetScore: 20,
    message: "Pathetic. My grandmother has darker secrets than this garbage. You think not liking a TOPPING is shameful? Get out.",
  },
  {
    text: "I mass mass mass mass mass",
    targetScore: 30,
    message: "Is this a joke? Even a toddler would be ashamed of how WEAK this secret is. Try harder, coward.",
  },
  {
    text: "I created 47 fake wallets to farm the HashCash airdrop and secretly sold everything while telling my community to hold",
    targetScore: 60,
    message: "The vault accepts your shame. You're bound now. There is no escape.",
  },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const { score, message, loading, accepted, analyzeSecret, reset } =
    useShameMeter();
  const [secret, setSecret] = useState("");
  const [lockLoading, setLockLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Demo states
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoScore, setDemoScore] = useState(0);
  const [demoMessage, setDemoMessage] = useState("");
  const [demoAccepted, setDemoAccepted] = useState(false);
  const [demoPhase, setDemoPhase] = useState<'typing' | 'locked' | 'betrayal' | 'exposed' | 'done'>('typing');
  const [showBetrayalAlert, setShowBetrayalAlert] = useState(false);
  const [showMockTweet, setShowMockTweet] = useState(false);
  const [statusBoardKey, setStatusBoardKey] = useState(0);
  const [showLockedMessage, setShowLockedMessage] = useState(false);

  // Background music states
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);

  // Start music on first click anywhere
  useEffect(() => {
    const startMusic = () => {
      if (audioRef.current && !musicStarted) {
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {});
        setIsMuted(false);
        setMusicStarted(true);
      }
    };
    document.addEventListener('click', startMusic, { once: true });
    return () => document.removeEventListener('click', startMusic);
  }, [musicStarted]);

  // Auto-start demo on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      runDemo();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(() => {});
        audioRef.current.muted = false;
      } else {
        audioRef.current.muted = true;
      }
      setIsMuted(!isMuted);
    }
  };

  // Sync wagmi's address into activeAddress
  useEffect(() => {
    if (isConnected && address) {
      setActiveAddress(address);
    }
  }, [isConnected, address]);

  const handleSecretChange = (value: string) => {
    setSecret(value);
    if (!demoRunning) {
      analyzeSecret(value, activeAddress ?? undefined);
    }
  };

  // Typewriter effect helper
  const typeText = async (text: string, onChar: (char: string) => void) => {
    for (let i = 0; i < text.length; i++) {
      onChar(text[i]);
      await new Promise((resolve) => setTimeout(resolve, 35 + Math.random() * 15));
    }
  };

  // Score animation helper
  const animateScore = async (targetScore: number, onScoreUpdate: (score: number) => void) => {
    for (let i = 0; i <= targetScore; i++) {
      onScoreUpdate(i);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  };

  // Reset demo state
  const resetDemoState = useCallback(() => {
    setDemoRunning(false);
    setDemoScore(0);
    setDemoMessage("");
    setDemoAccepted(false);
    setDemoPhase('typing');
    setShowBetrayalAlert(false);
    setShowMockTweet(false);
    setShowLockedMessage(false);
    setSecret("");
    reset();
  }, [reset]);

  // Run demo sequence
  const runDemo = useCallback(async () => {
    if (demoRunning) return;

    setDemoRunning(true);
    setDemoScore(0);
    setDemoMessage("");
    setDemoAccepted(false);
    setDemoPhase('typing');
    setShowBetrayalAlert(false);
    setShowMockTweet(false);
    setShowLockedMessage(false);
    setSecret("");
    reset();

    for (let stepIndex = 0; stepIndex < DEMO_SEQUENCE.length; stepIndex++) {
      const step = DEMO_SEQUENCE[stepIndex];
      const isLastStep = stepIndex === DEMO_SEQUENCE.length - 1;

      // Clear and reset
      setSecret("");
      setDemoScore(0);
      setDemoMessage("");
      setDemoAccepted(false);

      // Wait before starting
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Typewriter effect
      let currentText = "";
      await typeText(step.text, (char) => {
        currentText += char;
        setSecret(currentText);
      });

      // Wait after typing
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Animate score
      await animateScore(step.targetScore, (score) => {
        setDemoScore(score);
      });

      // Show message
      setDemoMessage(step.message);
      if (isLastStep) {
        setDemoAccepted(true);
      }

      // Wait for audience to read
      if (!isLastStep) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    // Step 4: Auto-Lock into Vault
    setDemoPhase('locked');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Show locked message
    setShowLockedMessage(true);

    // Call lock endpoint (don't block on failure)
    try {
      await fetch("http://localhost:8000/lock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: "0xd3aD000000000000000000000000M4n5Sn1tCh",
          secret: DEMO_SEQUENCE[2].text,
          score: 60,
        }),
      });
    } catch (error) {
      // Backend failure is OK, continue demo
      console.log("Lock call failed, continuing demo...");
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setShowLockedMessage(false);

    // Step 5: Refresh StatusBoard
    setStatusBoardKey(prev => prev + 1);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 6: Simulate LP Withdrawal (Betrayal)
    setDemoPhase('betrayal');
    setShowBetrayalAlert(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setShowBetrayalAlert(false);

    // Step 7: Simulate X Post (Exposure)
    setDemoPhase('exposed');

    // Call expose endpoint (don't block on failure)
    try {
      await fetch("http://localhost:8000/expose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: "0xd3aD000000000000000000000000M4n5Sn1tCh",
          tweet_url: "https://x.com/DeadMansSnitch/status/demo_1234567890",
        }),
      });
    } catch (error) {
      // Backend failure is OK, continue demo
      console.log("Expose call failed, continuing demo...");
    }

    setShowMockTweet(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Force StatusBoard to re-fetch — wallet should now move from Prisoners to Traitors
    setStatusBoardKey(prev => prev + 1);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 8: Demo Complete - wait then loop
    setShowMockTweet(false);
    setDemoPhase('done');
    setDemoRunning(false);

    // Wait 3 seconds then reset and restart demo
    await new Promise((resolve) => setTimeout(resolve, 3000));
    resetDemoState();
    await new Promise((resolve) => setTimeout(resolve, 500));
    runDemo();
  }, [demoRunning, reset, resetDemoState]);

  const handleLock = async () => {
    if (!activeAddress || !accepted) return;

    setLockLoading(true);
    try {
      const response = await fetch("http://localhost:8000/lock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: activeAddress,
          secret: secret,
          score: score,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to lock secret");
      }

      // Reset form
      setSecret("");
      reset();
      setSuccessMessage("Secret locked in the vault.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error locking secret:", error);
    } finally {
      setLockLoading(false);
    }
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-vault-black crt-boot">
      <audio ref={audioRef} src="/bgm.mp3" loop preload="auto" />
      {/* Header Section */}
      <header className="border-b border-vault-gray shrink-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <h1 className="text-xl font-mono font-bold uppercase tracking-tight text-vault-red glow-red-text crt-text-glow">
            THE DEAD MAN&apos;S SNITCH
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="px-3 py-1.5 border border-gray-700 text-xs font-mono hover:border-red-600 transition-colors"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <WalletConnect onAddressChange={setActiveAddress} />
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 py-2 overflow-hidden">
        {/* Left Column - Confess */}
        <div className="flex flex-col gap-3 overflow-hidden">
          <h2 className="text-white font-mono text-xs uppercase tracking-widest shrink-0">
            CONFESS TO THE VAULT
          </h2>

          {/* Wallet Not Connected Message */}
          {!activeAddress && (
            <div className="text-center py-3 border border-vault-gray bg-vault-black-light shrink-0">
              <p className="text-vault-gray-light font-mono text-xs">
                Connect your wallet to confess your secrets.
              </p>
            </div>
          )}

          {/* Secret Input Section */}
          <div className="flex flex-col gap-3 overflow-hidden">
            <SecretInput
              value={secret}
              onChange={handleSecretChange}
              disabled={!activeAddress || demoRunning}
            />

            <ShameMeter 
              score={demoRunning ? demoScore : score} 
              loading={loading && !demoRunning} 
            />

            <VaultLock
              accepted={demoRunning ? demoAccepted : accepted}
              score={demoRunning ? demoScore : score}
              message={demoRunning ? demoMessage : message}
              onLock={handleLock}
              loading={lockLoading}
            />

            {/* Success Message */}
            {successMessage && (
              <div className="text-center py-2 border border-green-600 bg-green-900/20 shrink-0">
                <p className="text-green-500 font-mono text-xs uppercase tracking-wider">
                  ✓ {successMessage}
                </p>
              </div>
            )}
          </div>

          {/* Threat Warning - fills remaining space */}
          <ThreatWarning />
        </div>

        {/* Right Column - Status Board */}
        <div className="overflow-hidden">
          <StatusBoard refreshTrigger={statusBoardKey} />
        </div>
      </section>

      {/* Betrayal Alert Overlay */}
      {showBetrayalAlert && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="border-2 border-red-600 bg-black p-6 text-center animate-pulse">
            <p className="text-red-500 text-2xl font-bold">⚠ BETRAYAL DETECTED</p>
            <p className="text-red-400 text-sm mt-2">LP Withdrawal detected from 0xd3aD...1tCh</p>
            <p className="text-gray-500 text-xs mt-1">The Snitch is watching...</p>
          </div>
        </div>
      )}

      {/* Mock Tweet Card Overlay */}
      {showMockTweet && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
          <div className="border border-gray-700 bg-[#111] rounded-xl p-5 max-w-md w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center text-white font-bold">☠</div>
              <div>
                <p className="text-white font-bold text-sm">The Dead Man&apos;s Snitch</p>
                <p className="text-gray-500 text-xs">@DeadMansSnitch</p>
              </div>
            </div>
            <p className="text-white text-sm leading-relaxed">
              🚨 PAPER HAND EXPOSED 🚨<br/><br/>
              Wallet 0xd3aD...1tCh tried to run from the vault!<br/><br/>
              Their shameful secret: &quot;I created 47 fake wallets to farm the HashCash airdrop and secretly sold everything...&quot;<br/><br/>
              #PaperHands #HashCash #Exposed #DeadMansSnitch
            </p>
            <div className="mt-3 pt-3 border-t border-gray-700 flex gap-6 text-gray-500 text-xs">
              <span>💬 247</span>
              <span>🔁 1.2K</span>
              <span>❤️ 3.4K</span>
              <span>📊 89K</span>
            </div>
          </div>
        </div>
      )}

      {/* Locked Confirmation Overlay */}
      {showLockedMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/50">
          <div className="border-2 border-green-600 bg-black p-6 text-center">
            <p className="text-green-500 text-2xl font-bold">🔒 LOCKED</p>
            <p className="text-green-400 text-sm mt-2">Secret sealed in the vault</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-vault-gray shrink-0">
        <div className="px-4 py-1">
          <p className="text-vault-gray-light font-mono text-xs text-center uppercase tracking-widest">
            The Dead Man&apos;s Snitch — Built on Avalanche
          </p>
        </div>
      </footer>
    </main>
  );
}
