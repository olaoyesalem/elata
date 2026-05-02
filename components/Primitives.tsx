"use client";

import React from "react";

/* ─── Wordmark ───────────────────────────────────────────────────────── */
export function Wordmark({
  size = 28,
  color,
  sub = true,
  glyph = true,
}: {
  size?: number;
  color?: string;
  sub?: boolean;
  glyph?: boolean;
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {glyph && <MindGlyph size={size * 0.95} color={color} />}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span
          className="mc-display"
          style={{ fontSize: size, color: color || "var(--mc-ink-700)", letterSpacing: "-0.015em" }}
        >
          Mind<span style={{ fontStyle: "normal", opacity: 0.55 }}>·</span>Canvas
        </span>
        {sub && (
          <span
            className="mc-eyebrow"
            style={{
              fontSize: Math.max(8, size * 0.32),
              color: color ? color : "var(--mc-ink-500)",
              marginTop: 4,
            }}
          >
            Biofeedback Studio
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── MindGlyph ──────────────────────────────────────────────────────── */
export function MindGlyph({
  size = 28,
  color = "var(--mc-phos)",
}: {
  size?: number;
  color?: string;
}) {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <radialGradient id={`g-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={color} stopOpacity="0.25" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill={`url(#g-${id})`} />
      <circle cx="20" cy="20" r="17.5" stroke={color} strokeOpacity="0.5" strokeWidth="0.6" />
      <path
        d="M3 20 L10 20 L13 12 L17 28 L21 8 L25 30 L29 18 L37 20"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 2px ${color})` }}
      />
    </svg>
  );
}

/* ─── Sparkline ──────────────────────────────────────────────────────── */
function sparkPath(values: number[], w: number, h: number, pad = 2): string {
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

export function Sparkline({
  values,
  w = 140,
  h = 28,
  color = "var(--mc-phos)",
  fill = true,
  strokeWidth = 1.2,
}: {
  values: number[];
  w?: number;
  h?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
}) {
  const d = sparkPath(values, w, h);
  const area = d + ` L ${w - 2} ${h - 2} L 2 ${h - 2} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", flexShrink: 0 }}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Band power bars ────────────────────────────────────────────────── */
export function BandBars({
  bands,
  color = "var(--mc-phos)",
  h = 60,
}: {
  bands: { label: string; value: number }[];
  color?: string;
  h?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: h }}>
      {bands.map((b, i) => (
        <div
          key={i}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}
        >
          <div
            style={{
              width: "100%",
              height: `${b.value * 100}%`,
              background: `linear-gradient(180deg, ${color}, color-mix(in oklch, ${color} 30%, transparent))`,
              boxShadow: `0 0 8px color-mix(in oklch, ${color} 40%, transparent)`,
              transition: "height 400ms",
            }}
          />
          <div className="mc-eyebrow" style={{ fontSize: 8, color: "var(--mc-ink-500)" }}>
            {b.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Corner brackets ────────────────────────────────────────────────── */
export function Brackets({
  color = "var(--mc-phos)",
  size = 10,
  opacity = 0.5,
}: {
  color?: string;
  size?: number;
  opacity?: number;
}) {
  const corners = [
    { top: 0, left: 0, transform: "rotate(0deg)" },
    { top: 0, right: 0, transform: "rotate(90deg)" },
    { bottom: 0, right: 0, transform: "rotate(180deg)" },
    { bottom: 0, left: 0, transform: "rotate(270deg)" },
  ];
  return (
    <>
      {corners.map((s, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 10 10"
          style={{ position: "absolute", ...s, opacity, pointerEvents: "none" }}
        >
          <path d="M0 4 L0 0 L4 0" stroke={color} strokeWidth="1" fill="none" />
        </svg>
      ))}
    </>
  );
}

/* ─── DataReadout ────────────────────────────────────────────────────── */
export function DataReadout({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span className="mc-eyebrow" style={{ color: "var(--mc-ink-500)" }}>
        {label}
      </span>
      <span
        className="mc-data"
        style={{
          fontSize: 22,
          fontVariantNumeric: "tabular-nums",
          color: color || "var(--mc-phos)",
          textShadow: color
            ? `0 0 8px ${color}40`
            : "0 0 8px color-mix(in oklch, var(--mc-phos) 40%, transparent)",
        }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 4 }}>{unit}</span>
        )}
      </span>
    </div>
  );
}

/* ─── Placeholder ────────────────────────────────────────────────────── */
export function Placeholder({
  w = "100%",
  h = 200,
  label = "imagery",
  dark = true,
}: {
  w?: string | number;
  h?: number | string;
  label?: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        backgroundImage: dark
          ? "repeating-linear-gradient(-45deg, var(--mc-ink-100) 0 8px, var(--mc-ink-050) 8px 16px)"
          : "repeating-linear-gradient(-45deg, var(--mc-bone-100) 0 8px, var(--mc-bone-050) 8px 16px)",
        border: `1px solid ${dark ? "var(--mc-ink-200)" : "var(--mc-bone-200)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: dark ? "var(--mc-ink-500)" : "var(--mc-bone-400)",
        fontFamily: "var(--mc-mono)",
        fontSize: 10,
        textTransform: "uppercase" as const,
        letterSpacing: "0.15em",
      }}
    >
      [ {label} ]
    </div>
  );
}

/* ─── Data generators (deterministic enough for SSR) ─────────────────── */
export function genECG(n = 220, beats = 4): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * beats * Math.PI * 2;
    const phase = (i % Math.floor(n / beats)) / Math.floor(n / beats);
    let v = Math.sin(t * 0.5) * 0.05;
    if (phase > 0.45 && phase < 0.5) v -= 0.3;
    if (phase > 0.5 && phase < 0.55) v += 1;
    if (phase > 0.55 && phase < 0.6) v -= 0.5;
    if (phase > 0.7 && phase < 0.85) v += 0.18 * Math.sin((phase - 0.7) * 20);
    out.push(v + (Math.sin(i * 137.5) * 0.5 - 0.25) * 0.04);
  }
  return out;
}

export function genEEG(n = 320, seed = 1): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const v =
      Math.sin(t * 22 + seed) * 0.4 +
      Math.sin(t * 50 + seed * 2) * 0.2 +
      Math.sin(t * 9 + seed * 3) * 0.6 +
      (Math.sin(i * seed * 73.1) * 0.5 - 0.25) * 0.25;
    out.push(v);
  }
  return out;
}
