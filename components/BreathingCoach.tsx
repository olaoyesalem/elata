"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Wordmark, Sparkline, genECG } from "./Primitives";
import { useBioSignal } from "@/lib/BioSignalContext";

type Phase = "idle" | "inhale" | "hold1" | "exhale" | "hold2";
type Pattern = "478" | "box" | "deep";

const PATTERNS: Record<Pattern, { name: string; phases: { phase: Phase; dur: number; label: string }[] }> = {
  "478": {
    name: "4·7·8",
    phases: [
      { phase: "inhale", dur: 4, label: "breathe in" },
      { phase: "hold1",  dur: 7, label: "hold" },
      { phase: "exhale", dur: 8, label: "breathe out" },
    ],
  },
  box: {
    name: "box breathing",
    phases: [
      { phase: "inhale", dur: 4, label: "breathe in" },
      { phase: "hold1",  dur: 4, label: "hold" },
      { phase: "exhale", dur: 4, label: "breathe out" },
      { phase: "hold2",  dur: 4, label: "hold" },
    ],
  },
  deep: {
    name: "deep breathing",
    phases: [
      { phase: "inhale", dur: 5, label: "breathe in" },
      { phase: "hold1",  dur: 2, label: "hold" },
      { phase: "exhale", dur: 7, label: "breathe out" },
    ],
  },
};

export function BreathingCoach() {
  const { bpm, hrv, calmness, bandPowers, ecgBuffer, rppgStatus, startRPPG } = useBioSignal();

  const [pattern, setPattern] = useState<Pattern>("478");
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [totalCycles] = useState(12);
  const [score, setScore] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const baselineHrv = useRef(hrv || 30);
  const baselineAlpha = useRef(bandPowers.alpha);

  const start = useCallback(() => {
    baselineHrv.current = hrv || 30;
    baselineAlpha.current = bandPowers.alpha;
    setActive(true);
    setPhase("idle");
    setCycle(0);
    setPhaseIndex(0);
    if (rppgStatus === "idle") startRPPG();
  }, [hrv, bandPowers.alpha, rppgStatus, startRPPG]);

  const stop = useCallback(() => {
    setActive(false);
    setPhase("idle");
    clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!active) return;
    const pat = PATTERNS[pattern];

    const runPhase = (idx: number, c: number) => {
      if (c >= totalCycles) { stop(); return; }
      const p = pat.phases[idx % pat.phases.length];
      setPhase(p.phase);
      setCountdown(p.dur);
      setPhaseIndex(idx % pat.phases.length);
      if (idx % pat.phases.length === 0 && idx > 0) {
        setCycle(c + 1);
      }

      let remaining = p.dur;
      const tick = () => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          const nextIdx = idx + 1;
          const nextCycle = nextIdx % pat.phases.length === 0 ? c + 1 : c;
          timerRef.current = setTimeout(() => runPhase(nextIdx, nextCycle), 200);
        } else {
          timerRef.current = setTimeout(tick, 1000);
        }
      };
      timerRef.current = setTimeout(tick, 1000);
    };

    runPhase(0, 0);
    return () => clearTimeout(timerRef.current);
  }, [active, pattern]);

  // Update score based on HRV and alpha improvements
  useEffect(() => {
    if (!active) return;
    const hrvImprovement = Math.max(0, (hrv - baselineHrv.current) / baselineHrv.current);
    const alphaImprovement = Math.max(0, (bandPowers.alpha - baselineAlpha.current) / 0.5);
    const s = Math.min(100, Math.round(50 + hrvImprovement * 100 + alphaImprovement * 50));
    setScore(s);
  }, [hrv, bandPowers.alpha, active]);

  // Breathing ring scale: inhale = expand, exhale = contract
  const ringScale = phase === "inhale" ? 1.08 : phase === "exhale" ? 0.92 : 1.0;
  const ringAnimDur = phase === "inhale" || phase === "exhale" ? `${PATTERNS[pattern].phases.find(p => p.phase === phase)?.dur || 4}s` : "0.3s";

  const ecgTrace = ecgBuffer.length > 10 ? ecgBuffer : genECG(220, 6);
  const alphaEnvelope = Array.from({ length: 220 }, (_, i) =>
    Math.sin(i / 19) * 0.4 + Math.sin(i / 6) * 0.1 + 0.5 + (bandPowers.alpha - 0.5) * 0.3
  );

  return (
    <div
      style={{
        background: "var(--mc-ink-000)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        color: "var(--mc-ink-700)",
      }}
    >
      {/* Header */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: 24 }}>
        <Wordmark size={18} sub={false} />
        <div style={{ display: "flex", gap: 4 }}>
          {(["freestyle", "focus", "breathing"] as const).map((m) => (
            <span
              key={m}
              className="mc-eyebrow"
              style={{
                padding: "8px 14px",
                border: "1px solid var(--mc-ink-200)",
                color: m === "breathing" ? "var(--mc-phos)" : "var(--mc-ink-500)",
                background: m === "breathing" ? "color-mix(in oklch, var(--mc-phos) 8%, transparent)" : "transparent",
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Pattern selector (when idle) */}
      {!active && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
          }}
        >
          <span className="mc-display" style={{ fontSize: 32, color: "var(--mc-ink-600)" }}>
            Choose a breathing pattern
          </span>
          <div style={{ display: "flex", gap: 16 }}>
            {(Object.entries(PATTERNS) as [Pattern, typeof PATTERNS[Pattern]][]).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setPattern(key)}
                style={{
                  padding: "18px 28px",
                  border: `1px solid ${pattern === key ? "var(--mc-phos)" : "var(--mc-ink-300)"}`,
                  background: pattern === key ? "color-mix(in oklch, var(--mc-phos) 8%, transparent)" : "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--mc-mono)",
                }}
              >
                <div className="mc-data" style={{ fontSize: 18, color: pattern === key ? "var(--mc-phos)" : "var(--mc-ink-600)" }}>
                  {p.name}
                </div>
                <div className="mc-eyebrow" style={{ color: "var(--mc-ink-500)", marginTop: 6 }}>
                  {p.phases.map(ph => ph.dur).join("·")} sec
                </div>
              </button>
            ))}
          </div>
          <button className="mc-btn" onClick={start} style={{ padding: "14px 32px", fontSize: 13 }}>
            ▶ begin breathing
          </button>
        </div>
      )}

      {active && (
        <>
          {/* Breathing ring */}
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
            <span className="mc-eyebrow" style={{ color: "var(--mc-phos)", marginBottom: 12 }}>
              cycle {String(cycle + 1).padStart(2, "0")} of {totalCycles} · {PATTERNS[pattern].name}
            </span>
            <div style={{ position: "relative", width: 380, height: 380 }}>
              {[1, 0.85, 0.7].map((s, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: `${i * 8}%`,
                    border: "1px solid var(--mc-phos)",
                    borderRadius: "50%",
                    opacity: 0.25 - i * 0.05,
                    transform: `scale(${ringScale})`,
                    transition: `transform ${ringAnimDur} ease-in-out`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  inset: "20%",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, color-mix(in oklch, var(--mc-phos) 30%, transparent), transparent 70%)",
                  transform: `scale(${ringScale})`,
                  transition: `transform ${ringAnimDur} ease-in-out`,
                  boxShadow: "0 0 80px color-mix(in oklch, var(--mc-phos) 40%, transparent)",
                }}
              />
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
                <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>
                  {PATTERNS[pattern].phases[phaseIndex]?.label || "—"}
                </span>
                <span
                  className="mc-display mc-glow"
                  style={{ fontSize: 96, color: "var(--mc-phos)", lineHeight: 1 }}
                >
                  {countdown}
                </span>
                <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-ink-500)", marginTop: 4 }}>
                  {PATTERNS[pattern].phases.map(p => p.dur).join("·")}
                </span>
              </div>
            </div>
            <button
              className="mc-btn mc-btn-ghost"
              onClick={stop}
              style={{ marginTop: 24, padding: "8px 20px", fontSize: 10 }}
            >
              ■ stop
            </button>
          </div>

          {/* Left score */}
          <div style={{ position: "absolute", top: 100, left: 24, width: 210 }}>
            <div className="mc-glass" style={{ padding: 16 }}>
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>breath alignment</span>
              <span
                className="mc-data mc-glow"
                style={{ display: "block", fontSize: 48, color: "var(--mc-phos)", marginTop: 4 }}
              >
                {score}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10 }}>
                {[
                  { l: "HRV Δ", v: `+${Math.max(0, Math.round(hrv - baselineHrv.current))}ms`, ok: hrv >= baselineHrv.current },
                  { l: "α power", v: `${bandPowers.alpha > baselineAlpha.current ? "+" : ""}${Math.round((bandPowers.alpha - baselineAlpha.current) * 100)}%`, ok: bandPowers.alpha >= baselineAlpha.current },
                  { l: "calmness", v: `${calmness}/100`, ok: calmness > 50 },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>{s.l}</span>
                    <span className="mc-data" style={{ fontSize: 11, color: s.ok ? "var(--mc-phos)" : "var(--mc-warn)" }}>
                      {s.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right cycles grid */}
          <div style={{ position: "absolute", top: 100, right: 24, width: 210 }}>
            <div className="mc-glass" style={{ padding: 16 }}>
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>cycles</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, marginTop: 10 }}>
                {Array.from({ length: totalCycles }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: "1",
                      border: "1px solid var(--mc-ink-300)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        i < cycle
                          ? "color-mix(in oklch, var(--mc-phos) 14%, transparent)"
                          : i === cycle
                          ? "color-mix(in oklch, var(--mc-phos) 6%, transparent)"
                          : "transparent",
                      borderColor: i <= cycle ? "var(--mc-phos)" : "var(--mc-ink-300)",
                    }}
                  >
                    <span
                      className="mc-data"
                      style={{
                        fontSize: 9,
                        color: i < cycle ? "var(--mc-phos)" : i === cycle ? "var(--mc-wet)" : "var(--mc-ink-400)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom strips */}
          <div
            style={{
              position: "absolute",
              left: 24, right: 24, bottom: 24,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <div className="mc-glass" style={{ padding: 12 }}>
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>rPPG · sync</span>
              <Sparkline values={ecgTrace.slice(-160)} w={460} h={44} color="var(--mc-pulse)" fill={false} />
            </div>
            <div className="mc-glass" style={{ padding: 12 }}>
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>EEG · α envelope</span>
              <Sparkline values={alphaEnvelope.slice(-160)} w={460} h={44} color="var(--mc-phos)" fill />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
