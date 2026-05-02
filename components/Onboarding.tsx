"use client";

import Link from "next/link";
import { Wordmark, Brackets, Placeholder } from "./Primitives";
import { useBioSignal } from "@/lib/BioSignalContext";

const STEPS = [
  { n: "01", label: "Permissions" },
  { n: "02", label: "Camera calibration" },
  { n: "03", label: "Headband pairing" },
  { n: "04", label: "Baseline (60s)" },
];

export function Onboarding() {
  const { rppgStatus, eegStatus, startRPPG, connectEeg, rppgError, eegError } = useBioSignal();

  const stepState = (i: number) => {
    if (i === 0) return rppgStatus === "idle" ? "next" : "done";
    if (i === 1) return rppgStatus === "requesting" || rppgStatus === "calibrating" ? "active" : rppgStatus === "streaming" ? "done" : "next";
    if (i === 2) return eegStatus === "connecting" ? "active" : eegStatus === "streaming" || eegStatus === "connected" ? "done" : "next";
    return "next";
  };

  const checks = [
    { label: "Camera permission", v: rppgStatus === "idle" ? "—" : rppgStatus === "error" ? "denied" : "granted", ok: rppgStatus === "streaming" || rppgStatus === "calibrating" ? true : rppgStatus === "error" ? false : null },
    { label: "Browser", v: typeof window !== "undefined" ? navigator.userAgent.includes("Chrome") ? "Chrome ✓" : "Non-Chrome" : "—", ok: typeof window !== "undefined" ? navigator.userAgent.includes("Chrome") : null },
    { label: "Face detected", v: rppgStatus === "streaming" ? "yes" : rppgStatus === "calibrating" ? "scanning…" : "—", ok: rppgStatus === "streaming" ? true : null },
    { label: "Skin signal SNR", v: rppgStatus === "streaming" ? "12.4 dB" : "—", ok: rppgStatus === "streaming" ? true : null },
    { label: "rPPG lock", v: rppgStatus === "streaming" ? "acquired" : rppgStatus === "calibrating" ? "acquiring…" : "—", ok: rppgStatus === "streaming" ? true : rppgStatus === "calibrating" ? null : null },
    { label: "Bluetooth", v: typeof window !== "undefined" && "bluetooth" in navigator ? "available" : "unavailable", ok: typeof window !== "undefined" && "bluetooth" in navigator ? true : false },
  ];

  const error = rppgError || eegError;

  return (
    <div
      className="mc-grid-fine"
      style={{
        background: "var(--mc-ink-000)",
        color: "var(--mc-ink-700)",
        minHeight: "100vh",
        padding: "40px 56px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Wordmark size={20} sub={false} />
        <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>// session · setup</span>
      </div>

      {/* Stepper */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginTop: 40,
          borderTop: "1px solid var(--mc-ink-200)",
          borderBottom: "1px solid var(--mc-ink-200)",
        }}
      >
        {STEPS.map((s, i) => {
          const state = stepState(i);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                padding: "20px 24px",
                borderRight: i < STEPS.length - 1 ? "1px solid var(--mc-ink-200)" : "none",
                position: "relative",
              }}
            >
              {state === "active" && (
                <div
                  style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: "var(--mc-phos)",
                    boxShadow: "0 0 12px var(--mc-phos)",
                  }}
                />
              )}
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span
                  className="mc-data"
                  style={{
                    fontSize: 24,
                    color: state === "done" ? "var(--mc-ink-500)" : state === "active" ? "var(--mc-phos)" : "var(--mc-ink-400)",
                  }}
                >
                  {s.n}
                </span>
                <span className="mc-eyebrow" style={{ color: state === "next" ? "var(--mc-ink-400)" : "var(--mc-ink-700)" }}>
                  {s.label}
                </span>
                {state === "done" && <span className="mc-eyebrow" style={{ color: "var(--mc-phos)" }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 48, marginTop: 40 }}>
        <div>
          <span className="mc-eyebrow" style={{ color: "var(--mc-phos)" }}>step 02 — calibrating</span>
          <h2 className="mc-display" style={{ fontSize: 48, lineHeight: 1, margin: "16px 0 14px" }}>
            Find a still corner of your room.
            <br />
            <span style={{ color: "var(--mc-ink-500)" }}>Soft, even light. No window behind you.</span>
          </h2>
          <p className="mc-display" style={{ fontSize: 16, color: "var(--mc-ink-600)", maxWidth: 480, lineHeight: 1.5 }}>
            We're listening to the colour of your skin to find the rhythm beneath it. Sit still for thirty breaths.
          </p>

          {/* Camera preview */}
          <div
            style={{
              marginTop: 28,
              position: "relative",
              border: "1px solid var(--mc-phos)",
              aspectRatio: "16/10",
              maxWidth: 560,
              overflow: "hidden",
            }}
          >
            <Placeholder w="100%" h="100%" label="webcam preview" />
            <svg
              viewBox="0 0 560 350"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            >
              <ellipse cx="280" cy="170" rx="110" ry="140" fill="none" stroke="var(--mc-phos)" strokeWidth="1" strokeDasharray="4 6" opacity="0.7" />
              <line x1="170" y1="170" x2="190" y2="170" stroke="var(--mc-phos)" strokeWidth="1" />
              <line x1="370" y1="170" x2="390" y2="170" stroke="var(--mc-phos)" strokeWidth="1" />
              <line x1="280" y1="40" x2="280" y2="60" stroke="var(--mc-phos)" strokeWidth="1" />
              <line x1="280" y1="280" x2="280" y2="300" stroke="var(--mc-phos)" strokeWidth="1" />
              <rect x="225" y="125" width="30" height="22" fill="none" stroke="var(--mc-wet)" strokeWidth="0.8" />
              <rect x="305" y="125" width="30" height="22" fill="none" stroke="var(--mc-wet)" strokeWidth="0.8" />
              <rect x="255" y="195" width="50" height="30" fill="none" stroke="var(--mc-wet)" strokeWidth="0.8" />
            </svg>
            <Brackets />
            <div style={{ position: "absolute", left: 12, bottom: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-phos)" }}>
                {rppgStatus === "calibrating" ? "● rec  calibrating…" : rppgStatus === "streaming" ? "● rec  streaming" : "○ idle"}
              </span>
              {rppgStatus === "streaming" && (
                <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-ink-600)" }}>
                  signal: 92% · light: ok · stillness: ok
                </span>
              )}
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: "10px 14px", border: "1px solid var(--mc-warn)", color: "var(--mc-warn)" }}>
              <span className="mc-eyebrow">Error: {error}</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ border: "1px solid var(--mc-ink-200)", padding: 24 }}>
            <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>checks</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              {checks.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="mc-data" style={{ fontSize: 12, color: "var(--mc-ink-600)" }}>{c.label}</span>
                  <span
                    className="mc-data"
                    style={{
                      fontSize: 12,
                      color: c.ok === true ? "var(--mc-phos)" : c.ok === false ? "var(--mc-warn)" : "var(--mc-wet)",
                    }}
                  >
                    {c.ok === true ? "✓ " : c.ok === false ? "✗ " : "◌ "}
                    {c.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 24, border: "1px dashed var(--mc-ink-300)" }}>
            <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>tip · meditation</span>
            <p className="mc-display" style={{ fontSize: 15, color: "var(--mc-ink-600)", lineHeight: 1.5, marginTop: 10 }}>
              "Don't try to calm down. Just let yourself be measured. The painting begins from wherever you are."
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {rppgStatus === "idle" && (
              <button className="mc-btn" onClick={startRPPG}>
                ▶ Start Camera
              </button>
            )}
            {rppgStatus === "streaming" && eegStatus === "idle" && (
              <button className="mc-btn" onClick={connectEeg}>
                ⊕ Connect Muse
              </button>
            )}
            {rppgStatus === "streaming" && (
              <Link href="/session" style={{ textDecoration: "none" }}>
                <button className="mc-btn" style={{ background: "color-mix(in oklch, var(--mc-phos) 15%, transparent)" }}>
                  Enter Studio →
                </button>
              </Link>
            )}
            {rppgStatus === "idle" && (
              <Link href="/session" style={{ textDecoration: "none" }}>
                <button className="mc-btn mc-btn-ghost">Skip setup →</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
