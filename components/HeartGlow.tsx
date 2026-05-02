"use client";

import { useEffect, useRef } from "react";
import { Wordmark, Brackets, Sparkline, genECG } from "./Primitives";
import { useBioSignal } from "@/lib/BioSignalContext";

export function HeartGlow() {
  const { bpm, ibi, hrv, snr, rppgStatus, ecgBuffer, startRPPG, stopRPPG } = useBioSignal();

  const animDur = bpm > 0 ? `${(60 / bpm).toFixed(2)}s` : "0.83s";
  const isActive = rppgStatus === "streaming" || rppgStatus === "calibrating";

  const displayBpm = bpm > 0 ? Math.round(bpm) : "—";
  const trace = ecgBuffer.length > 10 ? ecgBuffer : genECG(360, 8);

  return (
    <div
      style={{
        background: "var(--mc-ink-000)",
        minHeight: "100vh",
        color: "var(--mc-ink-700)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Pulsing orb */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", width: 420, height: 420 }}>
          {/* Outer pulse rings */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                border: `1px solid color-mix(in oklch, var(--mc-pulse) ${30 - i * 8}%, transparent)`,
                borderRadius: "50%",
                transform: `scale(${1 + i * 0.08})`,
                animation: isActive ? `mc-pulse ${animDur} ease-in-out infinite` : "none",
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
          {/* Core glow */}
          <div
            style={{
              position: "absolute",
              inset: "20%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, oklch(0.72 0.21 25 / 0.5), oklch(0.72 0.21 25 / 0.05) 70%, transparent 100%)",
              boxShadow: isActive
                ? "0 0 80px 20px oklch(0.72 0.21 25 / 0.35), inset 0 0 60px oklch(0.72 0.21 25 / 0.2)"
                : "0 0 40px 10px oklch(0.72 0.21 25 / 0.15)",
              animation: isActive ? `mc-pulse ${animDur} ease-in-out infinite` : "none",
              backdropFilter: "blur(4px)",
              transition: "box-shadow 0.5s",
            }}
          />
          {/* BPM display */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <span
              className="mc-display"
              style={{ fontSize: 11, color: "var(--mc-ink-500)", letterSpacing: "0.3em", textTransform: "uppercase" }}
            >
              heart
            </span>
            <span
              className="mc-data mc-glow-pulse"
              style={{
                fontSize: 140,
                lineHeight: 0.9,
                color: "var(--mc-ink-700)",
                fontVariantNumeric: "tabular-nums",
                textShadow: "0 0 24px oklch(0.72 0.21 25 / 0.6)",
              }}
            >
              {displayBpm}
            </span>
            <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)", marginTop: 12 }}>
              beats per minute
            </span>
          </div>
        </div>
      </div>

      {/* Top chrome */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: 28 }}>
        <Wordmark size={18} sub={false} />
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {isActive && (
            <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-phos)" }}>
              ● streaming
            </span>
          )}
          {rppgStatus === "idle" && (
            <button className="mc-btn" onClick={startRPPG} style={{ padding: "8px 14px", fontSize: 10 }}>
              ▶ start
            </button>
          )}
          {isActive && (
            <button className="mc-btn mc-btn-ghost" onClick={stopRPPG} style={{ padding: "8px 14px", fontSize: 10 }}>
              ■ stop
            </button>
          )}
        </div>
      </div>

      {/* Stats strip (top-right) */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div className="mc-glass" style={{ padding: 16 }}>
          {[
            { l: "IBI", v: ibi ? `${ibi}ms` : "—" },
            { l: "HRV", v: hrv ? `${Math.round(hrv)}ms` : "—" },
            { l: "SNR", v: snr ? `${snr.toFixed(1)}dB` : "—" },
          ].map((s, i) => (
            <div
              key={i}
              style={{ display: "flex", justifyContent: "space-between", gap: 24, padding: "4px 0" }}
            >
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>{s.l}</span>
              <span className="mc-data" style={{ fontSize: 12, color: "var(--mc-ink-700)" }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Camera preview thumbnail */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 28,
          width: 160,
          height: 106,
          border: "1px solid var(--mc-ink-200)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "repeating-linear-gradient(-45deg, var(--mc-ink-100) 0 6px, var(--mc-ink-050) 6px 12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)", fontSize: 9 }}>
            [ cam ]
          </span>
        </div>
        <Brackets color="var(--mc-pulse)" size={8} />
        <div style={{ position: "absolute", left: 6, bottom: 4 }}>
          <span className="mc-data" style={{ fontSize: 9, color: "var(--mc-phos)" }}>
            {isActive ? "● locked" : "○ idle"}
          </span>
        </div>
      </div>

      {/* ECG strip */}
      <div
        className="mc-grid-fine"
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          bottom: 28,
          padding: 18,
          border: "1px solid var(--mc-ink-200)",
          background: "color-mix(in oklch, var(--mc-ink-000) 70%, transparent)",
          backdropFilter: "blur(8px)",
          overflow: "hidden",
        }}
      >
        <Brackets />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>rPPG · 30s window · ch.0</span>
          <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-ink-500)" }}>
            HRV: {hrv ? `${Math.round(hrv)}ms` : "—"} · IBI: {ibi ? `${ibi}ms` : "—"} · SNR{" "}
            {snr ? `${snr.toFixed(1)}dB` : "—"}
          </span>
        </div>
        <div style={{ width: "100%", overflow: "hidden" }}>
          <Sparkline
            values={trace}
            w={Math.min(1200, typeof window !== "undefined" ? window.innerWidth - 80 : 1200)}
            h={70}
            color="var(--mc-pulse)"
            fill={false}
            strokeWidth={1.4}
          />
        </div>
      </div>
    </div>
  );
}
