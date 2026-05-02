"use client";

import { useState } from "react";
import Link from "next/link";
import { Wordmark, Brackets } from "@/components/Primitives";
import { FlowField } from "@/components/FlowField";

const MOTIFS = ["flow", "rings", "contour", "mandala", "flow", "rings", "contour", "mandala", "flow"] as const;

const GALLERY_ITEMS = [
  { id: "1", name: "drizzle.sept",    artist: "@maya",   calm: 73, hr: 72, minted: true,  likes: 142 },
  { id: "2", name: "low.tide",        artist: "@kenji",  calm: 90, hr: 60, minted: false, likes: 89  },
  { id: "3", name: "moss.signal",     artist: "@anya",   calm: 75, hr: 68, minted: false, likes: 56  },
  { id: "4", name: "static.bloom",    artist: "@river",  calm: 58, hr: 78, minted: true,  likes: 203 },
  { id: "5", name: "fern.exhale",     artist: "@iz",     calm: 67, hr: 70, minted: false, likes: 31  },
  { id: "6", name: "ash.holding",     artist: "@tomo",   calm: 82, hr: 65, minted: false, likes: 77  },
  { id: "7", name: "linen.morning",   artist: "@noor",   calm: 88, hr: 63, minted: true,  likes: 167 },
  { id: "8", name: "north.window",    artist: "@finn",   calm: 64, hr: 74, minted: false, likes: 44  },
  { id: "9", name: "slate.fold",      artist: "@solene", calm: 71, hr: 69, minted: false, likes: 98  },
];

const SORT_OPTIONS = ["recent", "calmest", "minted", "following"] as const;
type SortOption = typeof SORT_OPTIONS[number];

export default function GalleryPage() {
  const [sort, setSort] = useState<SortOption>("recent");

  const sorted = [...GALLERY_ITEMS].sort((a, b) => {
    if (sort === "calmest") return b.calm - a.calm;
    if (sort === "minted") return (b.minted ? 1 : 0) - (a.minted ? 1 : 0);
    return 0;
  });

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
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Wordmark size={20} color="var(--mc-bone-900)" sub={false} />
        <div style={{ display: "flex", gap: 24 }}>
          {["Sessions", "Gallery", "Studio", "Account"].map((l, i) => (
            <Link
              key={l}
              href={l === "Sessions" ? "/sessions" : l === "Studio" ? "/session" : "/"}
              style={{
                textDecoration: "none",
                fontFamily: "var(--mc-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: 10,
                color: i === 1 ? "var(--mc-bone-900)" : "var(--mc-bone-500)",
                borderBottom: i === 1 ? "1px solid var(--mc-bone-900)" : "none",
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
            // public · {GALLERY_ITEMS.length} paintings
          </span>
          <h1 className="mc-display" style={{ fontSize: 72, lineHeight: 1, margin: "12px 0 0" }}>
            The collective{" "}
            <span style={{ color: "var(--mc-phos-dim)" }}>weather</span>.
          </h1>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {SORT_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setSort(f)}
              className="mc-eyebrow"
              style={{
                padding: "8px 12px",
                border: "1px solid var(--mc-bone-300)",
                color: sort === f ? "var(--mc-bone-900)" : "var(--mc-bone-500)",
                background: sort === f ? "var(--mc-bone-100)" : "transparent",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {sorted.map((item, i) => (
          <div
            key={item.id}
            style={{
              background: "var(--mc-bone-000)",
              border: "1px solid var(--mc-bone-200)",
              transition: "transform 0.15s, box-shadow 0.15s",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div
              style={{
                aspectRatio: "1",
                position: "relative",
                overflow: "hidden",
                background: "var(--mc-ink-000)",
              }}
            >
              <FlowField
                width={380}
                height={380}
                bpm={60 + i * 4}
                calmness={40 + i * 7}
                particleCount={180}
                motif={MOTIFS[i]}
              />
              {item.minted && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    padding: "3px 7px",
                    background: "var(--mc-bone-900)",
                    color: "var(--mc-phos)",
                  }}
                >
                  <span className="mc-eyebrow" style={{ fontSize: 8 }}>● minted</span>
                </div>
              )}
              <Brackets color="var(--mc-bone-100)" opacity={0.5} />
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span
                  className="mc-display"
                  style={{ fontSize: 20, fontStyle: "italic", color: "var(--mc-bone-900)" }}
                >
                  {item.name}
                </span>
                <span className="mc-eyebrow" style={{ color: "var(--mc-bone-500)" }}>
                  {item.artist}
                </span>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 10, alignItems: "center" }}>
                <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-500)" }}>
                  calm <span style={{ color: "var(--mc-bone-900)" }}>{item.calm}</span>
                </span>
                <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-500)" }}>
                  hr <span style={{ color: "var(--mc-bone-900)" }}>{item.hr}</span>
                </span>
                <span className="mc-data" style={{ fontSize: 11, color: "var(--mc-bone-500)", marginLeft: "auto" }}>
                  ♡ {item.likes}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 56,
          textAlign: "center",
          padding: "32px 0",
          borderTop: "1px solid var(--mc-bone-200)",
        }}
      >
        <span className="mc-eyebrow" style={{ color: "var(--mc-bone-400)" }}>
          Share your nervous system with the world.
        </span>
        <div style={{ marginTop: 16 }}>
          <Link href="/session" style={{ textDecoration: "none" }}>
            <button className="mc-btn" style={{ borderColor: "var(--mc-bone-900)", color: "var(--mc-bone-900)", background: "var(--mc-bone-100)" }}>
              ▶ begin a session
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
