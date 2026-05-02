"use client";

import { useEffect, useRef } from "react";

interface FlowFieldProps {
  width?: number;
  height?: number;
  bpm?: number;
  calmness?: number;
  particleCount?: number;
  motif?: "flow" | "rings" | "contour" | "mandala";
  background?: string;
  paused?: boolean;
  burst?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FlowField({
  width = 800,
  height = 500,
  bpm = 72,
  calmness = 65,
  particleCount = 300,
  motif = "flow",
  background = "transparent",
  paused = false,
  burst = 0,
  className,
  style,
}: FlowFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ bpm, calmness, motif, particleCount, paused, burst });
  propsRef.current = { bpm, calmness, motif, particleCount, paused, burst };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const noise = (x: number, y: number, t: number) =>
      Math.sin(x * 0.012 + t * 0.6) * Math.cos(y * 0.014 + t * 0.4) +
      0.5 * Math.sin((x + y) * 0.008 + t * 0.9);

    interface Particle {
      x: number; y: number; vx: number; vy: number; life: number; hue: number;
    }

    const state = { particles: [] as Particle[], t: 0, lastBurst: 0 };

    const init = () => {
      state.particles = [];
      for (let i = 0; i < propsRef.current.particleCount; i++) {
        state.particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0, vy: 0,
          life: Math.random() * 200,
          hue: Math.random(),
        });
      }
    };
    init();

    const colorAt = (mix: number): string => {
      if (mix < 0.5) {
        const k = mix * 2;
        return `oklch(${0.78} ${0.16 - k * 0.03} ${55 + k * 145})`;
      } else {
        const k = (mix - 0.5) * 2;
        return `oklch(${0.78 + k * 0.08} ${0.13 + k * 0.07} ${200 - k * 55})`;
      }
    };

    let raf: number;
    const tick = () => {
      const { bpm: curBpm, calmness: curCalmness, motif: curMotif, paused: curPaused, burst: curBurst } =
        propsRef.current;

      if (!curPaused) state.t += 0.008 * (curBpm / 72);
      const t = state.t;
      const calm = curCalmness / 100;

      if (curBurst > state.lastBurst) {
        state.lastBurst = curBurst;
        for (const p of state.particles) {
          const cx = width / 2, cy = height / 2;
          const dx = p.x - cx, dy = p.y - cy;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx += (dx / d) * 4;
          p.vy += (dy / d) * 4;
        }
      }

      ctx.fillStyle = `rgba(8, 12, 14, ${0.06 + (1 - calm) * 0.12})`;
      ctx.fillRect(0, 0, width, height);

      const speed = (curBpm / 72) * 1.2;

      for (const p of state.particles) {
        let ang: number;
        if (curMotif === "rings") {
          const dx = p.x - width / 2, dy = p.y - height / 2;
          ang = Math.atan2(dy, dx) + Math.PI / 2 + Math.sin(t + Math.sqrt(dx * dx + dy * dy) * 0.02) * 0.3;
        } else if (curMotif === "contour") {
          ang = noise(p.x, p.y, t * 0.3) * Math.PI;
        } else if (curMotif === "mandala") {
          const dx = p.x - width / 2, dy = p.y - height / 2;
          const a = Math.atan2(dy, dx);
          ang = Math.round(a / (Math.PI / 6)) * (Math.PI / 6) + Math.PI / 2;
        } else {
          ang = noise(p.x, p.y, t) * Math.PI * 2;
        }

        p.vx = p.vx * 0.92 + Math.cos(ang) * speed * 0.4;
        p.vy = p.vy * 0.92 + Math.sin(ang) * speed * 0.4;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.life <= 0) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.vx = 0; p.vy = 0;
          p.life = 100 + Math.random() * 200;
          p.hue = Math.random();
        }

        const mix = calm * 0.7 + p.hue * 0.3;
        ctx.fillStyle = colorAt(mix);
        ctx.globalAlpha = 0.6 + p.hue * 0.3;
        const r = 0.8 + (1 - calm) * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width, height, display: "block", background, ...style }}
    />
  );
}
