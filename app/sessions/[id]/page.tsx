"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Wordmark, Sparkline, Brackets } from "@/components/Primitives";
import { FlowField } from "@/components/FlowField";
import { getSession, formatDuration, type SessionMeta, type SessionRecord } from "@/lib/sessionRecorder";

const DEMO: { meta: SessionMeta; records: SessionRecord[] } = {
  meta: {
    id: "014",
    name: "drizzle.sept",
    date: Date.now() - 3600000,
    duration: 728000,
    mode: "freestyle",
    maxCalmness: 92,
    avgHR: 72,
    bumpCount: 11,
  },
  records: [],
};

export default function SessionReplayPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState(DEMO);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.38);
  const [replayBpm, setReplayBpm] = useState(68);
  const [replayCalmness, setReplayCalmness] = useState(75);

  useEffect(() => {
    getSession(id)
      .then(saved => { if (saved) setData(saved); })
      .catch(() => {});
  }, [id]);

  const { meta } = data;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  const currentMs = Math.round(progress * meta.duration);

  const calmnessOverTime = Array.from({ length: 220 }, (_, i) =>
    0.5 + Math.sin(i / 16) * 0.18 + i * 0.0008
  );
  const hrOverTime = Array.from({ length: 220 }, (_, i) =>
    0.5 + Math.sin(i / 4) * 0.06 + Math.sin(i / 40) * 0.1
  );
  const alphaOverTime = Array.from({ length: 220 }, (_, i) =>
    0.4 + Math.sin(i / 9) * 0.22
  );
  const scrubberData = Array.from({ length: 280 }, (_, i) =>
    0.5 + Math.sin(i / 14) * 0.18 + Math.sin(i / 4) * 0.05
  );

  return (
    <div
      style={{
        background: "var(--mc-bone-050)",
        minHeight: "100vh",
        color: "var(--mc-bone-900)",
        padding: "36px 56px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Wordmark size={18} color="var(--mc-bone-900)" sub={false} />
          <Link
            href="/sessions"
            style={{
              fontFamily: "var(--mc-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: 10,
              color: "var(--mc-bone-500)",
              textDecoration: "none",
            }}
          >
            ← sessions
          </Link>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="mc-btn mc-btn-bone"
            style={{ fontSize: 10, padding: "8px 14px" }}
            onClick={() => {
              const canvas = document.querySelector("canvas");
              if (!canvas) return;
              const a = document.createElement("a");
              a.download = `${meta.name}.png`;
              a.href = canvas.toDataURL();
              a.click();
            }}
          >
            ⎙ export PNG
          </button>
          <Link href="/gallery" style={{ textDecoration: "none" }}>
            <button className="mc-btn mc-btn-bone" style={{ fontSize: 10, padding: "8px 14px" }}>
              publish to gallery →
            </button>
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40 }}>
        <div>
          {/* Artwork */}
          <div
            style={{
              position: "relative",
              aspectRatio: "4/3",
              background: "var(--mc-ink-000)",
              border: "1px solid var(--mc-bone-300)",
              overflow: "hidden",
            }}
          >
            <FlowField
              width={760}
              height={570}
              bpm={replayBpm}
              calmness={replayCalmness}
              particleCount={350}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(60% 60% at 50% 50%, transparent, var(--mc-ink-000) 100%)",
                pointerEvents: "none",
              }}
            />
            <Brackets color="var(--mc-bone-100)" size={14} opacity={0.7} />
            <div style={{ position: "absolute", left: 18, bottom: 18, color: "var(--mc-bone-100)" }}>
              <span className="mc-display" style={{ fontStyle: "italic", fontSize: 24 }}>
                {meta.name}
              </span>
              <div className="mc-data" style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
                session {meta.id} · {formatDuration(meta.duration)} · {formatDate(meta.date)}
              </div>
            </div>
          </div>

          {/* Scrubber */}
          <div
            style={{
              marginTop: 14,
              padding: 14,
              border: "1px solid var(--mc-bone-300)",
              background: "var(--mc-bone-000)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="mc-btn mc-btn-bone"
                style={{ fontSize: 10, padding: "6px 12px" }}
                onClick={() => setPlaying(!playing)}
              >
                {playing ? "⏸" : "▶"}
              </button>
              <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-900)", minWidth: 40 }}>
                {formatDuration(currentMs)}
              </span>
              <div
                style={{ flex: 1, height: 28, position: "relative", cursor: "pointer" }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const p = (e.clientX - rect.left) / rect.width;
                  setProgress(Math.max(0, Math.min(1, p)));
                  setReplayBpm(60 + Math.floor(p * 20));
                  setReplayCalmness(40 + Math.floor(p * 50));
                }}
              >
                <Sparkline values={scrubberData} w={480} h={28} color="var(--mc-phos-dim)" />
                <div
                  style={{
                    position: "absolute",
                    left: `${progress * 100}%`,
                    top: 0, bottom: 0,
                    width: 1,
                    background: "var(--mc-bone-900)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: `${progress * 100}%`,
                    top: -4,
                    width: 10, height: 10,
                    borderRadius: "50%",
                    background: "var(--mc-bone-900)",
                    transform: "translateX(-5px)",
                  }}
                />
              </div>
              <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-500)" }}>
                {formatDuration(meta.duration)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <span className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>session {meta.id}</span>
            <h2 className="mc-display" style={{ fontSize: 48, lineHeight: 1, margin: "10px 0 8px", color: "var(--mc-bone-900)" }}>
              {meta.name.split(".")[0]}
              <span style={{ color: "var(--mc-phos-dim)" }}>.</span>
              {meta.name.split(".")[1]}
            </h2>
            <p
              className="mc-display"
              style={{ fontSize: 15, color: "var(--mc-bone-500)", lineHeight: 1.5, fontStyle: "italic" }}
            >
              "A long settling. Cyan flooded the canvas at minute six and held."
            </p>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              background: "var(--mc-bone-200)",
              border: "1px solid var(--mc-bone-200)",
            }}
          >
            {[
              { l: "duration",  v: formatDuration(meta.duration) },
              { l: "max calm",  v: String(meta.maxCalmness) },
              { l: "avg hr",    v: `${meta.avgHR} bpm` },
              { l: "α-bumps",   v: String(meta.bumpCount) },
              { l: "mode",      v: meta.mode },
              { l: "date",      v: formatDate(meta.date) },
            ].map((m, i) => (
              <div key={i} style={{ background: "var(--mc-bone-000)", padding: 16 }}>
                <span className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>{m.l}</span>
                <div className="mc-data" style={{ fontSize: 20, color: "var(--mc-bone-900)", marginTop: 4 }}>
                  {m.v}
                </div>
              </div>
            ))}
          </div>

          {/* Signal timeline */}
          <div>
            <span className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>signals over time</span>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { l: "calmness", c: "var(--mc-phos-dim)", v: calmnessOverTime },
                { l: "rPPG hr",  c: "var(--mc-pulse)",    v: hrOverTime },
                { l: "α power",  c: "var(--mc-wet-dim)",  v: alphaOverTime },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 0",
                    borderBottom: i < 2 ? "1px solid var(--mc-bone-200)" : "none",
                  }}
                >
                  <span className="mc-eyebrow" style={{ width: 64, color: "var(--mc-bone-500)" }}>
                    {s.l}
                  </span>
                  <Sparkline values={s.v} w={300} h={26} color={s.c} fill />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link href={`/mint/${meta.id}`} style={{ textDecoration: "none", flex: 1 }}>
              <button
                className="mc-btn"
                style={{ width: "100%", justifyContent: "center", background: "var(--mc-bone-900)", color: "var(--mc-phos)", borderColor: "var(--mc-bone-900)" }}
              >
                ✺ mint as NFT
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
