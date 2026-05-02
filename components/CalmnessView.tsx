"use client";

import { useEffect, useRef } from "react";
import { Wordmark, Sparkline } from "./Primitives";
import { useBioSignal } from "@/lib/BioSignalContext";

export function CalmnessView() {
  const { calmness, bumpCount, calmnessTrind, lastBump, eegStatus } = useBioSignal();

  const score = calmness;
  const isConnected = eegStatus === "streaming";

  // Gradient bg based on score: 0 = warm red/orange, 100 = cool blue/purple
  const bgGradient = `linear-gradient(180deg, oklch(${0.18 + (score / 100) * 0.04} ${0.08 - (score / 100) * 0.04} ${30 + (score / 100) * 210}), oklch(${0.10 + (score / 100) * 0.03} 0.03 220))`;

  // Arc path calculation
  const arcLength = (score / 100) * 502;

  return (
    <div
      style={{
        background: bgGradient,
        minHeight: "100vh",
        padding: 40,
        color: "var(--mc-ink-700)",
        position: "relative",
        overflow: "hidden",
        transition: "background 1.5s ease",
      }}
    >
      {/* Bump rings */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 1280 900"
        preserveAspectRatio="none"
      >
        {[180, 320, 460, 600].map((r, i) => (
          <circle
            key={i}
            cx="900"
            cy="500"
            r={r}
            fill="none"
            stroke="var(--mc-phos)"
            strokeOpacity={0.15 - i * 0.03}
            strokeWidth="1"
            strokeDasharray="3 8"
          />
        ))}
      </svg>

      {/* Header */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
        <Wordmark size={18} sub={false} />
        <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>// calmness model · v1.2</span>
      </div>

      {!isConnected && (
        <div
          style={{
            position: "relative",
            marginTop: 80,
            textAlign: "center",
          }}
        >
          <span className="mc-display" style={{ fontSize: 24, color: "var(--mc-ink-500)" }}>
            Connect EEG headband to enable calmness model.
          </span>
        </div>
      )}

      {isConnected && (
        <div style={{ position: "relative", marginTop: 56, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48 }}>
          <div>
            <span className="mc-eyebrow" style={{ color: "var(--mc-phos)" }}>
              state · {score > 70 ? "settled" : score > 40 ? "transitioning" : "agitated"}
            </span>
            <h2 className="mc-display" style={{ fontSize: 72, lineHeight: 0.95, margin: "16px 0 12px" }}>
              {score > 70 ? (
                <>deep<br /><span style={{ color: "var(--mc-wet)" }}>stillness</span></>
              ) : score > 40 ? (
                <>settling<br /><span style={{ color: "var(--mc-wet)" }}>into stillness</span></>
              ) : (
                <>mind<br /><span style={{ color: "var(--mc-warn)" }}>in motion</span></>
              )}
            </h2>
            <p className="mc-display" style={{ fontSize: 16, color: "var(--mc-ink-600)", maxWidth: 480, lineHeight: 1.5 }}>
              {score > 70
                ? "Your alpha is holding long waves. The canvas grows quieter."
                : score > 40
                ? "Your alpha is climbing in soft waves. The room is learning your weather."
                : "High beta activity. Take a breath — the painting holds your current state."}
            </p>

            {/* Score arc */}
            <div style={{ marginTop: 48, position: "relative", width: 320, height: 180 }}>
              <svg viewBox="0 0 320 180" style={{ width: "100%", height: "100%" }}>
                <defs>
                  <linearGradient id="calmgrad" x1="0" x2="1">
                    <stop offset="0" stopColor="var(--mc-warn)" />
                    <stop offset="0.5" stopColor="var(--mc-wet)" />
                    <stop offset="1" stopColor="var(--mc-phos)" />
                  </linearGradient>
                </defs>
                <path d="M 20 160 A 140 140 0 0 1 300 160" fill="none" stroke="var(--mc-ink-300)" strokeWidth="2" />
                <path
                  d="M 20 160 A 140 140 0 0 1 300 160"
                  fill="none"
                  stroke="url(#calmgrad)"
                  strokeWidth="3"
                  strokeDasharray={`${arcLength} 502`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.8s ease" }}
                />
                {[0, 25, 50, 75, 100].map((m, i) => {
                  const a = Math.PI - (i / 4) * Math.PI;
                  const x = 160 + Math.cos(a) * 140;
                  const y = 160 - Math.sin(a) * 140;
                  return (
                    <g key={i}>
                      <line
                        x1={x} y1={y}
                        x2={160 + Math.cos(a) * 130}
                        y2={160 - Math.sin(a) * 130}
                        stroke="var(--mc-ink-500)"
                        strokeWidth="0.8"
                      />
                      <text
                        x={160 + Math.cos(a) * 118}
                        y={160 - Math.sin(a) * 118 + 4}
                        fontFamily="ui-monospace"
                        fontSize="8"
                        fill="var(--mc-ink-500)"
                        textAnchor="middle"
                      >
                        {m}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div
                style={{
                  position: "absolute",
                  left: 0, right: 0, top: 80,
                  textAlign: "center",
                }}
              >
                <span
                  className="mc-data mc-glow"
                  style={{ fontSize: 64, color: "var(--mc-phos)", transition: "color 1s" }}
                >
                  {score}
                </span>
                <div className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>calmness · 0–100</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Trend */}
            <div className="mc-glass" style={{ padding: 20 }}>
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>last 5 minutes</span>
              <div style={{ marginTop: 12 }}>
                <Sparkline
                  values={calmnessTrind.slice(-200)}
                  w={380}
                  h={100}
                  color="var(--mc-phos)"
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span className="mc-data" style={{ fontSize: 9, color: "var(--mc-ink-500)" }}>−5m</span>
                <span className="mc-data" style={{ fontSize: 9, color: "var(--mc-ink-500)" }}>now</span>
              </div>
            </div>

            {/* Bump log */}
            <div className="mc-glass" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>α-bump log</span>
                <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-phos)" }}>
                  {bumpCount} total
                </span>
              </div>
              {bumpCount === 0 ? (
                <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-ink-400)" }}>
                  No bumps yet. Deepen your relaxation.
                </span>
              ) : (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {Array.from({ length: Math.min(bumpCount, 20) }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 10,
                        height: 10,
                        background: "var(--mc-phos)",
                        boxShadow: "0 0 6px var(--mc-phos)",
                      }}
                    />
                  ))}
                </div>
              )}
              {lastBump && (
                <div style={{ marginTop: 10 }}>
                  <span className="mc-data mc-glow" style={{ fontSize: 11, color: "var(--mc-phos)" }}>
                    ✺ last bump{" "}
                    {Math.round((Date.now() - lastBump) / 1000)}s ago
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
