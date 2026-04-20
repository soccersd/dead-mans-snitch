"use client";

import { useEffect, useState } from "react";

export default function CRTOverlay() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    // Trigger boot animation
    const timer = setTimeout(() => setBooted(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* CRT Boot flash */}
      {!booted && (
        <div
          className="fixed inset-0 z-[10000] bg-white pointer-events-none"
          style={{
            animation: "crt-boot-flash 1s ease-out forwards",
          }}
        />
      )}

      {/* Scan Lines */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 9999,
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15) 0px,
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 3px
          )`,
        }}
      />

      {/* Noise Grain */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 9998,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          animation: "noise-shift 0.5s steps(10) infinite",
        }}
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 9997,
          background: `radial-gradient(
            ellipse at center,
            transparent 50%,
            rgba(0, 0, 0, 0.5) 100%
          )`,
        }}
      />

      {/* Flicker */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 9996,
          animation: "crt-flicker 0.15s infinite",
        }}
      />
    </>
  );
}
