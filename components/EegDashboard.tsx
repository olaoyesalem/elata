"use client";

import { Wordmark, Brackets, Sparkline, BandBars, genEEG } from "./Primitives";
import { useBioSignal } from "@/lib/BioSignalContext";

const CHANNEL_COLORS = [
  "var(--mc-phos)",
  "var(--mc-wet)",
  "oklch(0.78 0.16 320)",
  "oklch(0.82 0.17 80)",
];

const BAND_LABELS = ["δ delta", "θ theta", "α alpha", "β beta", "γ gamma"] as const;

export function EegDashboard() {
  const {
    eegStatus, eegDeviceName, eegBattery, eegSignalQuality,
    eegError, connectEeg, disconnectEeg,
    bandPowers, channelBuffers, alphaThetaRatio, dominantBand,
  } = useBioSignal();

  const isStreaming = eegStatus === "streaming";
  const channelNames = ["TP9", "AF7", "AF8", "TP10"];

  const bands = [
    { label: "δ delta", value: bandPowers.delta },
    { label: "θ theta", value: bandPowers.theta },
    { label: "α alpha", value: bandPowers.alpha },
    { label: "β beta",  value: bandPowers.beta },
    { label: "γ gamma", value: bandPowers.gamma },
  ];

  return (
    <div
      style={{
        background: "var(--mc-ink-000)",
        color: "var(--mc-ink-700)",
        minHeight: "100vh",
        padding: 24,
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Wordmark size={18} sub={false} />
          <div style={{ display: "flex", gap: 4 }}>
            {["heart", "eeg", "canvas", "breath"].map((t) => (
              <span
                key={t}
                className="mc-eyebrow"
                style={{
                  padding: "8px 14px",
                  border: "1px solid var(--mc-ink-200)",
                  color: t === "eeg" ? "var(--mc-phos)" : "var(--mc-ink-500)",
                  background: t === "eeg" ? "color-mix(in oklch, var(--mc-phos) 8%, transparent)" : "transparent",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {isStreaming && (
            <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-phos)" }}>
              ● {eegDeviceName || "Muse"} · 256Hz · ch.4 · {eegBattery}%
            </span>
          )}
          {!isStreaming && eegStatus !== "connecting" && (
            <button className="mc-btn" onClick={connectEeg}>⊕ Connect Headband</button>
          )}
          {eegStatus === "connecting" && (
            <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-wet)" }}>◌ connecting…</span>
          )}
          {isStreaming && (
            <button className="mc-btn mc-btn-ghost" onClick={disconnectEeg}>■ disconnect</button>
          )}
        </div>
      </div>

      {eegError && (
        <div style={{ marginTop: 16, padding: "10px 14px", border: "1px solid var(--mc-warn)", color: "var(--mc-warn)" }}>
          <span className="mc-eyebrow">{eegError}</span>
        </div>
      )}

      {!isStreaming && eegStatus !== "connecting" && (
        <div
          style={{
            marginTop: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            padding: 60,
          }}
        >
          <span className="mc-display" style={{ fontSize: 32, color: "var(--mc-ink-500)", textAlign: "center" }}>
            Connect a Muse headband to begin EEG streaming.
          </span>
          <p className="mc-display" style={{ fontSize: 16, color: "var(--mc-ink-400)", maxWidth: 480, textAlign: "center", lineHeight: 1.5 }}>
            Turn on your Muse 2 or Muse S, then click Connect. Requires Chrome or Edge with Web Bluetooth.
          </p>
          <button className="mc-btn" onClick={connectEeg} style={{ padding: "14px 28px", fontSize: 13 }}>
            ⊕ Connect Headband
          </button>
        </div>
      )}

      {isStreaming && (
        <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1fr", gap: 20, marginTop: 24 }}>
          {/* Oscilloscope */}
          <div
            className="mc-grid"
            style={{ border: "1px solid var(--mc-ink-200)", position: "relative" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid var(--mc-ink-200)",
              }}
            >
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>
                oscilloscope · 4ch · 5s window
              </span>
              <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-ink-500)" }}>
                ±100μV · notch 50Hz · bp 1–45Hz
              </span>
            </div>
            <div style={{ padding: "0 16px" }}>
              {channelNames.map((name, i) => {
                const buf = channelBuffers[i];
                const trace = buf && buf.length > 10 ? buf : genEEG(420, [1.2, 3.1, 5.7, 7.4][i]);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderBottom: i < 3 ? "1px dashed var(--mc-ink-200)" : "none",
                      padding: "8px 0",
                    }}
                  >
                    <div style={{ width: 52, display: "flex", flexDirection: "column" }}>
                      <span className="mc-eyebrow" style={{ color: CHANNEL_COLORS[i] }}>{name}</span>
                      <span className="mc-data" style={{ fontSize: 9, color: "var(--mc-ink-500)" }}>
                        {(10 + Math.abs(Math.sin(i * 37)) * 40).toFixed(1)}μV
                      </span>
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <Sparkline
                        values={trace.slice(-200)}
                        w={600}
                        h={64}
                        color={CHANNEL_COLORS[i]}
                        fill={false}
                        strokeWidth={1}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Brackets />
          </div>

          {/* Right rail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Band powers */}
            <div style={{ border: "1px solid var(--mc-ink-200)", padding: 16 }}>
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>band powers · live</span>
              <div style={{ marginTop: 14 }}>
                <BandBars bands={bands} />
              </div>
              <div style={{ marginTop: 12, fontFamily: "var(--mc-mono)", fontSize: 10, color: "var(--mc-ink-500)" }}>
                dominant:{" "}
                <span style={{ color: "var(--mc-phos)" }}>
                  {dominantBand} {(bandPowers as Record<string, number>)[dominantBand]?.toFixed(2)}
                </span>{" "}
                · α/θ {alphaThetaRatio.toFixed(2)}
              </div>
            </div>

            {/* Signal quality */}
            <div style={{ border: "1px solid var(--mc-ink-200)", padding: 16 }}>
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>signal quality</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                {channelNames.map((name, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
                    <span className="mc-eyebrow" style={{ color: CHANNEL_COLORS[i] }}>{name}</span>
                    <div style={{ flex: 1, height: 4, background: "var(--mc-ink-200)", margin: "0 6px", position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: `${eegSignalQuality[i]}%`,
                          background: CHANNEL_COLORS[i],
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                    <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-ink-600)" }}>
                      {eegSignalQuality[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Topography SVG */}
            <div style={{ border: "1px solid var(--mc-ink-200)", padding: 16 }}>
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>topography</span>
              <svg viewBox="0 0 200 140" style={{ width: "100%", marginTop: 10 }}>
                <ellipse cx="100" cy="70" rx="80" ry="58" fill="none" stroke="var(--mc-ink-300)" strokeWidth="0.8" />
                <path d="M60 22 L100 8 L140 22" stroke="var(--mc-ink-300)" strokeWidth="0.8" fill="none" />
                {[
                  { cx: 60, cy: 50, c: "oklch(0.86 0.20 145 / 0.5)" },
                  { cx: 140, cy: 50, c: "oklch(0.78 0.13 200 / 0.5)" },
                  { cx: 60, cy: 100, c: "oklch(0.86 0.20 145 / 0.4)" },
                  { cx: 140, cy: 100, c: "oklch(0.78 0.13 200 / 0.45)" },
                ].map((b, i) => (
                  <circle key={i} cx={b.cx} cy={b.cy} r={24} fill={b.c} style={{ filter: "blur(8px)" }} />
                ))}
                {[
                  { cx: 60, cy: 50, l: "TP9" },
                  { cx: 140, cy: 50, l: "AF7/8" },
                  { cx: 60, cy: 100, l: "" },
                  { cx: 140, cy: 100, l: "TP10" },
                ].map((p, i) => (
                  <g key={i}>
                    <circle cx={p.cx} cy={p.cy} r="3" fill="var(--mc-ink-700)" />
                    {p.l && (
                      <text x={p.cx + 6} y={p.cy + 3} fontSize="7" fill="var(--mc-ink-500)" fontFamily="ui-monospace">
                        {p.l}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
