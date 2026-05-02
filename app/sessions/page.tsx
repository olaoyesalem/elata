"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wordmark, Sparkline } from "@/components/Primitives";
import { listSessions, formatDuration, type SessionMeta } from "@/lib/sessionRecorder";

function sparkPath(values: number[], w: number, h: number, pad = 8): string {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  return values
    .map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const DEMO_SESSIONS: SessionMeta[] = [
  { id: "014", name: "drizzle.sept",  date: Date.now() - 3600000,      duration: 728000,  mode: "freestyle",  maxCalmness: 92, avgHR: 72,  bumpCount: 11 },
  { id: "013", name: "morning.linen", date: Date.now() - 90000000,     duration: 512000,  mode: "breathing",  maxCalmness: 81, avgHR: 64,  bumpCount: 18 },
  { id: "012", name: "static.bloom",  date: Date.now() - 180000000,    duration: 1366000, mode: "freestyle",  maxCalmness: 58, avgHR: 78,  bumpCount: 4  },
  { id: "011", name: "low.tide",      date: Date.now() - 270000000,    duration: 360000,  mode: "breathing",  maxCalmness: 90, avgHR: 60,  bumpCount: 22 },
  { id: "010", name: "fern.exhale",   date: Date.now() - 360000000,    duration: 912000,  mode: "focus",      maxCalmness: 67, avgHR: 70,  bumpCount: 8  },
  { id: "009", name: "moss.signal",   date: Date.now() - 450000000,    duration: 588000,  mode: "freestyle",  maxCalmness: 75, avgHR: 68,  bumpCount: 12 },
];

const FILTERS = ["all", "freestyle", "breathing", "focus"] as const;
type Filter = typeof FILTERS[number];

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionMeta[]>(DEMO_SESSIONS);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    listSessions()
      .then(saved => { if (saved.length) setSessions([...saved, ...DEMO_SESSIONS]); })
      .catch(() => {});
  }, []);

  const filtered = filter === "all" ? sessions : sessions.filter(s => s.mode === filter);

  const driftData = Array.from({ length: 30 }, (_, i) =>
    50 + Math.sin(i / 4) * 20 + i * 0.6
  );
  const driftPath = sparkPath(driftData, 1100, 160);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleString("en-US", { month: "short", day: "numeric" })} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        background: "var(--mc-bone-050)",
        minHeight: "100vh",
        color: "var(--mc-bone-900)",
        padding: "40px 56px",
      }}
    >
      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Wordmark size={20} color="var(--mc-bone-900)" sub={false} />
        <div style={{ display: "flex", gap: 24 }}>
          {["Sessions", "Gallery", "Studio", "Account"].map((l, i) => (
            <Link
              key={l}
              href={l === "Gallery" ? "/gallery" : l === "Studio" ? "/session" : "/"}
              style={{
                textDecoration: "none",
                fontFamily: "var(--mc-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: 10,
                color: i === 0 ? "var(--mc-bone-900)" : "var(--mc-bone-500)",
                borderBottom: i === 0 ? "1px solid var(--mc-bone-900)" : "none",
                paddingBottom: 4,
              }}
            >
              {l}
            </Link>
          ))}
        </div>
      </div>

      {/* Header */}
      <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <span className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>
            // archive · {sessions.length} sessions
          </span>
          <h1 className="mc-display" style={{ fontSize: 72, lineHeight: 1, margin: "12px 0 0", color: "var(--mc-bone-900)" }}>
            Your weather, <span style={{ color: "var(--mc-phos-dim)" }}>charted</span>.
          </h1>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="mc-eyebrow"
              style={{
                padding: "8px 12px",
                border: "1px solid var(--mc-bone-300)",
                color: filter === f ? "var(--mc-bone-900)" : "var(--mc-bone-500)",
                background: filter === f ? "var(--mc-bone-100)" : "transparent",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Drift chart */}
      <div
        style={{
          marginTop: 36,
          padding: 28,
          border: "1px solid var(--mc-bone-200)",
          background: "var(--mc-bone-000)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>30-day calmness drift</span>
          <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-bone-500)" }}>
            baseline 64 · trend +8.2
          </span>
        </div>
        <svg viewBox="0 0 1100 160" style={{ width: "100%", marginTop: 14 }}>
          {[20, 60, 100, 140].map((y) => (
            <line key={y} x1="0" x2="1100" y1={y} y2={y} stroke="var(--mc-bone-200)" strokeDasharray="2 4" />
          ))}
          <path d={driftPath} fill="none" stroke="var(--mc-phos-dim)" strokeWidth="1.5" />
          {driftData.map((v, i) => {
            const y = 160 - 8 - ((v - 30) / 60) * 144;
            return (
              <circle
                key={i}
                cx={8 + i * 36.6}
                cy={y}
                r="3"
                fill="var(--mc-bone-000)"
                stroke="var(--mc-phos-dim)"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Sessions table */}
      <div style={{ marginTop: 28, border: "1px solid var(--mc-bone-200)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1.5fr 1fr 0.8fr 1fr 1fr 0.8fr 0.6fr",
            padding: "10px 20px",
            borderBottom: "1px solid var(--mc-bone-200)",
            background: "var(--mc-bone-100)",
          }}
        >
          {["#", "session", "date", "duration", "calmness", "avg hr", "α-bumps", "mode"].map((h) => (
            <span key={h} className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>
              {h}
            </span>
          ))}
        </div>
        {filtered.map((s, i) => (
          <Link
            key={s.id}
            href={`/sessions/${s.id}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1.5fr 1fr 0.8fr 1fr 1fr 0.8fr 0.6fr",
                padding: "16px 20px",
                borderBottom: i < filtered.length - 1 ? "1px solid var(--mc-bone-200)" : "none",
                alignItems: "center",
                background: "var(--mc-bone-000)",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--mc-bone-050)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--mc-bone-000)")}
            >
              <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-400)" }}>
                {s.id}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid var(--mc-bone-200)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(circle at ${30 + i * 8}% 50%, oklch(0.78 0.13 200), oklch(0.86 0.20 145) 60%, oklch(0.18 0.05 240))`,
                    }}
                  />
                </div>
                <span className="mc-display" style={{ fontSize: 17, fontStyle: "italic", color: "var(--mc-bone-900)" }}>
                  {s.name}
                </span>
              </div>
              <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-500)" }}>
                {formatDate(s.date)}
              </span>
              <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-900)" }}>
                {formatDuration(s.duration)}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 56, height: 4, background: "var(--mc-bone-200)" }}>
                  <div style={{ width: `${s.maxCalmness}%`, height: "100%", background: "var(--mc-phos-dim)" }} />
                </div>
                <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-900)" }}>
                  {s.maxCalmness}
                </span>
              </div>
              <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-900)" }}>
                {s.avgHR} <span style={{ color: "var(--mc-bone-400)" }}>bpm</span>
              </span>
              <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-900)" }}>
                ✺ {s.bumpCount}
              </span>
              <span className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>
                {s.mode}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
