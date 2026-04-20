import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { WagmiProviderWrapper } from "./providers";
import CRTOverlay from "@/components/CRTOverlay";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Dead Man's Snitch",
  description: "The Anti-Security Vault",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-vault-black text-foreground font-mono">
        <WagmiProviderWrapper>
          {children}
        </WagmiProviderWrapper>
        <CRTOverlay />
      </body>
    </html>
  );
}
