"use client";

import Link from "next/link";
import { Wordmark, MindGlyph, Sparkline, Brackets, genECG, genEEG } from "@/components/Primitives";
import { FlowField } from "@/components/FlowField";

function ReadoutTile({
  label, value, unit, trace, color,
}: {
  label: string; value: string; unit: string; trace: number[]; color: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--mc-ink-200)",
        padding: 16,
        background: "color-mix(in oklch, var(--mc-ink-000) 80%, transparent)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Brackets color={color} size={8} />
      <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
        <span className="mc-data" style={{ fontSize: 36, color, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </span>
        <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-ink-500)" }}>{unit}</span>
      </div>
      <div style={{ marginTop: 8, overflow: "hidden" }}>
        <Sparkline values={trace} w={240} h={32} color={color} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const ecgTrace  = genECG(80, 2);
  const eegTrace  = genEEG(80, 2);
  const calmTrace = genEEG(80, 5).map((v, i) => Math.sin(i / 12) * 0.5 + v * 0.3);
  const bumpTrace = Array.from({ length: 80 }, (_, i) => i % 18 < 2 ? 1 : Math.sin(i * 37) * 0.1 + 0.1);

  return (
    <div
      style={{
        background: "var(--mc-ink-000)",
        color: "var(--mc-ink-700)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient flow field */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.45, pointerEvents: "none" }}>
        <FlowField
          width={typeof window !== "undefined" ? window.innerWidth : 1280}
          height={typeof window !== "undefined" ? window.innerHeight : 900}
          bpm={64}
          calmness={78}
          particleCount={380}
        />
      </div>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(60% 50% at 50% 40%, transparent, var(--mc-ink-000) 90%)",
          pointerEvents: "none",
        }}
      />

      {/* Nav */}
      <nav
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 56px",
          borderBottom: "1px solid var(--mc-ink-200)",
        }}
      >
        <Wordmark size={22} sub={false} />
        <div style={{ display: "flex", gap: 28 }}>
          {(["Studio", "Sessions", "Gallery"] as const).map((l) => (
            <Link
              key={l}
              href={l === "Sessions" ? "/sessions" : l === "Gallery" ? "/gallery" : "/session"}
              style={{
                fontFamily: "var(--mc-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: 10,
                color: "var(--mc-ink-600)",
                textDecoration: "none",
              }}
            >
              {l}
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="mc-data mc-glow" style={{ fontSize: 11, color: "var(--mc-phos)" }}>
            ● live · 1,284 minds
          </span>
          <Link href="/session" style={{ textDecoration: "none" }}>
            <button className="mc-btn" style={{ padding: "8px 14px", fontSize: 11 }}>Begin</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", padding: "100px 56px 64px", maxWidth: 1100 }}>
        <span className="mc-eyebrow" style={{ color: "var(--mc-phos)" }}>// 0.1.0 — biofeedback art studio</span>
        <h1
          className="mc-display"
          style={{ fontSize: "clamp(60px, 8.5vw, 118px)", lineHeight: 0.95, margin: "20px 0 28px", maxWidth: 960 }}
        >
          Your nervous system,
          <br />
          <span className="mc-glow" style={{ color: "var(--mc-phos)" }}>painting itself</span>{" "}
          in real time.
        </h1>
        <p
          className="mc-display"
          style={{ fontSize: 20, color: "var(--mc-ink-600)", maxWidth: 580, lineHeight: 1.4, margin: 0 }}
        >
          MindCanvas reads your heart through a webcam and your brain through a Muse headband, then renders
          the conversation between them as a living, mintable painting.
        </p>
        <div style={{ marginTop: 40, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/session" style={{ textDecoration: "none" }}>
            <button className="mc-btn" style={{ padding: "14px 22px", fontSize: 12 }}>▶ Begin a session</button>
          </Link>
          <Link href="/gallery" style={{ textDecoration: "none" }}>
            <button className="mc-btn mc-btn-ghost" style={{ padding: "14px 22px", fontSize: 12 }}>View gallery</button>
          </Link>
          <span className="mc-data" style={{ fontSize: 10, color: "var(--mc-ink-500)", marginLeft: 8 }}>
            Chrome / Edge · Webcam · Muse 2 / S optional
          </span>
        </div>

        {/* Live readouts */}
        <div
          style={{
            marginTop: 80,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            maxWidth: 960,
          }}
        >
          <ReadoutTile label="rPPG · Heart" value="72"   unit="bpm"   trace={ecgTrace}  color="var(--mc-pulse)" />
          <ReadoutTile label="EEG · Alpha"  value="14.2" unit="μV²"   trace={eegTrace}  color="var(--mc-phos)" />
          <ReadoutTile label="Calmness"     value="73"   unit="/100"  trace={calmTrace} color="var(--mc-wet)" />
          <ReadoutTile label="α-bumps"      value="04"   unit="/min"  trace={bumpTrace} color="var(--mc-phos)" />
        </div>
      </section>

      {/* Three pillars */}
      <section
        style={{
          position: "relative",
          borderTop: "1px solid var(--mc-ink-200)",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "var(--mc-ink-200)",
        }}
      >
        {[
          { kicker: "01 · listen",    title: "Sense",     body: "rPPG decodes the pulse from a 30-second face capture. EEG arrives over Bluetooth, four channels, raw and unflattened.", glyph: "❍" },
          { kicker: "02 · interpret", title: "Translate", body: "WASM signal processing extracts band powers, calmness, and alpha bumps — the grammar your art speaks in.", glyph: "≈" },
          { kicker: "03 · render",    title: "Paint",     body: "A particle flow field breathes with your BPM and warms or cools with your calmness. Every session is unrepeatable.", glyph: "✺" },
        ].map((p, i) => (
          <div key={i} style={{ background: "var(--mc-ink-000)", padding: 40, position: "relative", minHeight: 260 }}>
            <Brackets />
            <span className="mc-eyebrow" style={{ color: "var(--mc-phos)" }}>{p.kicker}</span>
            <div className="mc-glow" style={{ fontSize: 52, color: "var(--mc-phos)", marginTop: 20, fontFamily: "var(--mc-serif)" }}>
              {p.glyph}
            </div>
            <h3 className="mc-display" style={{ fontSize: 28, margin: "14px 0 10px", color: "var(--mc-ink-700)" }}>{p.title}</h3>
            <p style={{ fontFamily: "var(--mc-serif)", fontSize: 15, color: "var(--mc-ink-600)", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
              {p.body}
            </p>
          </div>
        ))}
      </section>

      {/* Type + glyphs strip */}
      <section
        style={{
          position: "relative",
          padding: "48px 56px",
          borderTop: "1px solid var(--mc-ink-200)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
        }}
      >
        <div>
          <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>// typefaces</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 18 }}>
            <div>
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>Display — Georgia Italic</span>
              <div className="mc-display" style={{ fontSize: 44, color: "var(--mc-ink-700)", lineHeight: 1 }}>Aa</div>
              <div className="mc-display" style={{ fontSize: 14, color: "var(--mc-ink-600)", marginTop: 4 }}>A quiet mind draws long lines.</div>
            </div>
            <div>
              <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>Data — ui-monospace</span>
              <div className="mc-data" style={{ fontSize: 44, color: "var(--mc-phos)" }}>72.4</div>
              <div className="mc-data" style={{ fontSize: 10, color: "var(--mc-ink-500)", marginTop: 4 }}>BPM · α 14.2 · θ 6.1 · CALM 73</div>
            </div>
          </div>
        </div>
        <div style={{ borderLeft: "1px solid var(--mc-ink-200)", paddingLeft: 36 }}>
          <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>// living glyphs</span>
          <div style={{ display: "flex", gap: 20, marginTop: 18, alignItems: "center" }}>
            <MindGlyph size={60} />
            <MindGlyph size={44} color="var(--mc-wet)" />
            <MindGlyph size={32} color="var(--mc-pulse)" />
            <div style={{ width: 1, height: 50, background: "var(--mc-ink-300)" }} />
            <Sparkline values={genECG(120, 3)} w={160} h={44} color="var(--mc-pulse)" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          padding: "24px 56px",
          borderTop: "1px solid var(--mc-ink-200)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>
          Built on Elata Biosignal SDK · rPPG · EEG · BLE
        </span>
        <Link href="/sessions" style={{ textDecoration: "none" }}>
          <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>Sessions →</span>
        </Link>
      </footer>
    </div>
  );
}
