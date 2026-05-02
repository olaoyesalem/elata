"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Wordmark, Brackets } from "@/components/Primitives";
import { FlowField } from "@/components/FlowField";

type MintStep = 1 | 2 | 3;

export default function MintPage() {
  const { id } = useParams<{ id: string }>();
  const [step, setStep] = useState<MintStep>(2);
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [txHash] = useState("0x7f2a…b8c3");

  const sessionName = "drizzle.sept"; // In production, fetch from DB

  const handleMint = async () => {
    setMinting(true);
    // Stub: in production, connect wallet and call contract
    await new Promise(r => setTimeout(r, 2000));
    setMinting(false);
    setMinted(true);
    setStep(3);
  };

  return (
    <div
      style={{
        background: "var(--mc-bone-050)",
        minHeight: "100vh",
        color: "var(--mc-bone-900)",
        padding: "40px 56px",
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Wordmark size={18} color="var(--mc-bone-900)" sub={false} />
        <span className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>
          // mint flow · step {step < 10 ? `0${step}` : step} of 03
        </span>
      </div>

      {/* Step 3: Success */}
      {step === 3 && (
        <div
          style={{
            marginTop: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            textAlign: "center",
          }}
        >
          <span className="mc-data mc-glow" style={{ fontSize: 72, color: "var(--mc-phos)" }}>✺</span>
          <h2 className="mc-display" style={{ fontSize: 64, color: "var(--mc-bone-900)", lineHeight: 1 }}>
            {sessionName} is<br />
            <span style={{ color: "var(--mc-phos-dim)" }}>on-chain.</span>
          </h2>
          <p className="mc-display" style={{ fontSize: 18, color: "var(--mc-bone-500)", maxWidth: 480, lineHeight: 1.5 }}>
            Your nervous system is now a provable artefact. The chain remembers the moment it held this shape.
          </p>
          <div style={{ fontFamily: "var(--mc-mono)", fontSize: 11, color: "var(--mc-bone-400)" }}>
            tx · {txHash}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href={`/sessions/${id}`} style={{ textDecoration: "none" }}>
              <button className="mc-btn mc-btn-bone">← back to session</button>
            </Link>
            <Link href="/gallery" style={{ textDecoration: "none" }}>
              <button className="mc-btn" style={{ background: "var(--mc-bone-900)", color: "var(--mc-phos)", borderColor: "var(--mc-bone-900)" }}>
                view in gallery →
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Step 1–2: Mint flow */}
      {step < 3 && (
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}>
          <div>
            <div
              style={{
                aspectRatio: "1",
                position: "relative",
                overflow: "hidden",
                background: "var(--mc-ink-000)",
                border: "1px solid var(--mc-bone-300)",
              }}
            >
              <FlowField width={520} height={520} bpm={68} calmness={75} particleCount={400} />
              <Brackets color="var(--mc-bone-100)" opacity={0.6} />
              <div style={{ position: "absolute", left: 16, bottom: 16, color: "var(--mc-bone-100)" }}>
                <span className="mc-display" style={{ fontSize: 20, fontStyle: "italic" }}>{sessionName}</span>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
              <span className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>edition 01 · 1 of 1</span>
              <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-bone-500)" }}>sha · {txHash}</span>
            </div>
          </div>

          <div>
            <span className="mc-eyebrow" style={{ color: "var(--mc-phos-dim)" }}>
              preserve as state-provable NFT
            </span>
            <h2 className="mc-display" style={{ fontSize: 52, lineHeight: 0.95, margin: "16px 0 14px" }}>
              {sessionName},<br />
              <span style={{ color: "var(--mc-bone-400)" }}>signed by your physiology.</span>
            </h2>
            <p
              className="mc-display"
              style={{ fontSize: 15, color: "var(--mc-bone-500)", lineHeight: 1.5, fontStyle: "italic", maxWidth: 440 }}
            >
              The painting is hashed alongside the biosignal trace that produced it. The chain remembers
              the moment your nervous system held this shape.
            </p>

            {/* Metadata table */}
            <div style={{ marginTop: 28, border: "1px solid var(--mc-bone-200)", background: "var(--mc-bone-000)" }}>
              {[
                { l: "title",        v: sessionName,              editable: true  },
                { l: "edition",      v: "1 / 1",                   editable: false },
                { l: "metadata uri", v: "ipfs://QmZ9…f2c1",        editable: false },
                { l: "chain",        v: "Polygon · 137",           editable: false },
                { l: "royalty",      v: "5%",                      editable: true  },
                { l: "gas (est.)",   v: "≈ $0.04",                 editable: false },
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom: i < 5 ? "1px solid var(--mc-bone-200)" : "none",
                  }}
                >
                  <span className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>{r.l}</span>
                  <span className="mc-data" style={{ fontSize: 12, color: "var(--mc-bone-900)" }}>
                    {r.v}{" "}
                    {r.editable && (
                      <span style={{ color: "var(--mc-bone-400)", marginLeft: 6, cursor: "pointer" }}>edit</span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Wallet notice */}
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                border: "1px dashed var(--mc-bone-300)",
                fontFamily: "var(--mc-mono)",
                fontSize: 11,
                color: "var(--mc-bone-500)",
              }}
            >
              ⚠ Connect a wallet to sign & mint. MetaMask, WalletConnect, and Coinbase Wallet supported.
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <Link href={`/sessions/${id}`} style={{ textDecoration: "none" }}>
                <button className="mc-btn mc-btn-bone" style={{ fontSize: 10, padding: "10px 16px" }}>
                  ← back
                </button>
              </Link>
              <button
                className="mc-btn"
                onClick={handleMint}
                disabled={minting}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  background: "var(--mc-bone-900)",
                  color: "var(--mc-phos)",
                  borderColor: "var(--mc-bone-900)",
                  opacity: minting ? 0.7 : 1,
                }}
              >
                {minting ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        border: "1.5px solid var(--mc-phos)",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "mc-spin 0.8s linear infinite",
                      }}
                    />
                    signing…
                  </>
                ) : (
                  "✺ sign & mint"
                )}
              </button>
            </div>
            <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-bone-500)", display: "block", marginTop: 10 }}>
              wallet not connected · click to connect
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
