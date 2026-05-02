"use client";

import { useCallback, useRef, useState } from "react";
import { FlowField } from "./FlowField";
import { Wordmark, Brackets, DataReadout, Sparkline, genECG } from "./Primitives";
import { useBioSignal } from "@/lib/BioSignalContext";

const MOTIFS = ["flow", "rings", "contour", "mandala"] as const;
type Motif = typeof MOTIFS[number];

export function GenerativeCanvas() {
  const {
    bpm, calmness, bumpCount, ecgBuffer,
    rppgStatus, eegStatus,
    startRPPG, stopRPPG,
    burstSignal, triggerBurst,
    sessionMode, setSessionMode,
  } = useBioSignal();

  const [motif, setMotif] = useState<Motif>("flow");
  const [sessionName] = useState(() => {
    const adj = ["drizzle", "morning", "static", "low", "fern", "moss", "amber", "dusk"];
    const noun = ["sept", "linen", "signal", "tide", "exhale", "still", "field", "bloom"];
    return `${adj[Math.floor(Math.random() * adj.length)]}.${noun[Math.floor(Math.random() * noun.length)]}`;
  });
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const startTimeRef = useRef(0);

  const isActive = rppgStatus === "streaming" || eegStatus === "streaming";

  const startSession = useCallback(() => {
    startRPPG();
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [startRPPG]);

  const endSession = useCallback(() => {
    stopRPPG();
    clearInterval(timerRef.current);
  }, [stopRPPG]);

  const snapshot = useCallback(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${sessionName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [sessionName]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const ecgTrace = ecgBuffer.length > 10 ? ecgBuffer : genECG(120, 3);
  const calmnessColor = calmness > 70 ? "var(--mc-phos)" : calmness > 40 ? "var(--mc-wet)" : "var(--mc-warn)";

  return (
    <div
      style={{
        background: "var(--mc-ink-000)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Full-screen flow field */}
      <div style={{ position: "absolute", inset: 0 }}>
        <FlowField
          width={typeof window !== "undefined" ? window.innerWidth : 1280}
          height={typeof window !== "undefined" ? window.innerHeight : 900}
          bpm={bpm || 72}
          calmness={calmness}
          particleCount={isActive ? 500 : 200}
          motif={motif}
          burst={burstSignal}
        />
      </div>
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(80% 70% at 50% 60%, transparent 30%, var(--mc-ink-000) 95%)",
          pointerEvents: "none",
        }}
      />

      {/* Top chrome */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Wordmark size={18} sub={false} />
          <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>
            // {sessionMode} · canvas
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {isActive ? (
            <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-phos)" }}>
              ● {formatTime(elapsed)}
            </span>
          ) : null}
          <button className="mc-btn mc-btn-ghost" onClick={snapshot} style={{ padding: "8px 14px", fontSize: 10 }}>
            ⎙ snapshot
          </button>
          {!isActive ? (
            <button className="mc-btn" onClick={startSession} style={{ padding: "8px 14px", fontSize: 10 }}>
              ▶ begin
            </button>
          ) : (
            <button className="mc-btn mc-btn-ghost" onClick={endSession} style={{ padding: "8px 14px", fontSize: 10 }}>
              ■ end
            </button>
          )}
        </div>
      </div>

      {/* Session name watermark */}
      <div
        style={{
          position: "absolute",
          top: "44%",
          left: 0, right: 0,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          className="mc-display"
          style={{ fontSize: 72, color: "var(--mc-ink-700)", lineHeight: 1, mixBlendMode: "screen", opacity: 0.7 }}
        >
          {sessionName.split(".")[0]}
          <span style={{ color: "var(--mc-phos)" }}>.</span>
          {sessionName.split(".")[1]}
        </div>
      </div>

      {/* Left rail — bio readouts */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: 220,
        }}
      >
        <div className="mc-glass" style={{ padding: 14, position: "relative" }}>
          <Brackets color="var(--mc-pulse)" size={8} />
          <DataReadout label="rPPG · heart" value={bpm > 0 ? Math.round(bpm) : "—"} unit="bpm" color="var(--mc-pulse)" />
          <div style={{ marginTop: 8 }}>
            <Sparkline values={ecgTrace.slice(-80)} w={192} h={32} color="var(--mc-pulse)" fill={false} />
          </div>
        </div>
        <div className="mc-glass" style={{ padding: 14, position: "relative" }}>
          <Brackets color="var(--mc-wet)" size={8} />
          <DataReadout label="calmness" value={calmness} unit="/100" color={calmnessColor} />
          <div style={{ marginTop: 10, height: 5, background: "var(--mc-ink-200)", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: `${calmness}%`,
                background: "linear-gradient(90deg, var(--mc-warn), var(--mc-wet), var(--mc-phos))",
                transition: "width 0.8s ease",
              }}
            />
          </div>
        </div>
        <div className="mc-glass" style={{ padding: 14, position: "relative" }}>
          <Brackets color="var(--mc-phos)" size={8} />
          <DataReadout
            label="α · alpha bumps"
            value={String(bumpCount).padStart(2, "0")}
            unit="total"
            color="var(--mc-phos)"
          />
          <div style={{ marginTop: 8, display: "flex", gap: 2 }}>
            {Array.from({ length: 14 }, (_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 14,
                  background: i < bumpCount ? "var(--mc-phos)" : "var(--mc-ink-200)",
                  boxShadow: i < bumpCount ? "0 0 4px var(--mc-phos)" : "none",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right rail — controls */}
      <div
        style={{
          position: "absolute",
          top: 90,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: 200,
        }}
      >
        {/* Motif selector */}
        <div className="mc-glass" style={{ padding: 14 }}>
          <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>motif</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10 }}>
            {MOTIFS.map((m) => (
              <button
                key={m}
                onClick={() => setMotif(m)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  border: "1px solid var(--mc-ink-200)",
                  background: motif === m ? "color-mix(in oklch, var(--mc-phos) 8%, transparent)" : "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--mc-mono)",
                }}
              >
                <span className="mc-eyebrow" style={{ color: motif === m ? "var(--mc-phos)" : "var(--mc-ink-600)" }}>
                  {m}
                </span>
                {motif === m && (
                  <span className="mc-data" style={{ fontSize: 9, color: "var(--mc-ink-500)" }}>● active</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Session mode */}
        <div className="mc-glass" style={{ padding: 14 }}>
          <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>mode</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10 }}>
            {(["freestyle", "focus", "breathing"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSessionMode(m)}
                style={{
                  padding: "6px 8px",
                  border: "1px solid var(--mc-ink-200)",
                  background: sessionMode === m ? "color-mix(in oklch, var(--mc-wet) 8%, transparent)" : "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--mc-mono)",
                  textAlign: "left",
                }}
              >
                <span className="mc-eyebrow" style={{ color: sessionMode === m ? "var(--mc-wet)" : "var(--mc-ink-600)" }}>
                  {m}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trigger bump */}
        <button className="mc-btn" onClick={triggerBurst} style={{ width: "100%", justifyContent: "center" }}>
          ✺ trigger α-bump
        </button>
      </div>

      {/* Bottom caption */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0, bottom: 24,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          className="mc-glass"
          style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: 20 }}
        >
          <span className="mc-display" style={{ fontSize: 13, color: "var(--mc-ink-600)", fontStyle: "italic" }}>
            {calmness > 70 ? `"Cooler now. The lines are growing longer."` : `"Still finding the frequency."`}
          </span>
          <span style={{ width: 1, height: 16, background: "var(--mc-ink-300)" }} />
          <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-ink-500)" }}>
            calm {calmness} · bpm {bpm > 0 ? Math.round(bpm) : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
