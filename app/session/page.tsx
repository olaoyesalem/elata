"use client";

import { useState } from "react";
import { HeartGlow } from "@/components/HeartGlow";
import { EegDashboard } from "@/components/EegDashboard";
import { CalmnessView } from "@/components/CalmnessView";
import { GenerativeCanvas } from "@/components/GenerativeCanvas";
import { BreathingCoach } from "@/components/BreathingCoach";

type Tab = "heart" | "eeg" | "calmness" | "canvas" | "breathing";

const TABS: { id: Tab; label: string; day: string }[] = [
  { id: "heart",     label: "Heart Glow",   day: "Day 1" },
  { id: "eeg",       label: "EEG",          day: "Day 2" },
  { id: "calmness",  label: "Calmness",     day: "Day 3" },
  { id: "canvas",    label: "Bio-Canvas",   day: "Day 4" },
  { id: "breathing", label: "Breathing",    day: "Day 6" },
];

export default function SessionPage() {
  const [tab, setTab] = useState<Tab>("canvas");

  return (
    <div style={{ minHeight: "100vh", background: "var(--mc-ink-000)" }}>
      {/* Tab bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          borderBottom: "1px solid var(--mc-ink-200)",
          background: "color-mix(in oklch, var(--mc-ink-000) 90%, transparent)",
          backdropFilter: "blur(12px)",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "12px 0",
              border: "none",
              borderBottom: tab === t.id ? "2px solid var(--mc-phos)" : "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              transition: "background 0.15s",
            }}
          >
            <span
              className="mc-eyebrow"
              style={{
                color: tab === t.id ? "var(--mc-phos)" : "var(--mc-ink-500)",
                transition: "color 0.15s",
              }}
            >
              {t.label}
            </span>
            <span
              className="mc-data"
              style={{
                fontSize: 9,
                color: tab === t.id ? "var(--mc-phos-dim)" : "var(--mc-ink-400)",
              }}
            >
              {t.day}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content — offset for fixed tab bar */}
      <div style={{ paddingTop: 56 }}>
        {tab === "heart"     && <HeartGlow />}
        {tab === "eeg"       && <EegDashboard />}
        {tab === "calmness"  && <CalmnessView />}
        {tab === "canvas"    && <GenerativeCanvas />}
        {tab === "breathing" && <BreathingCoach />}
      </div>
    </div>
  );
}
