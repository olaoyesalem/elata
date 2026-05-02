"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BandPowers } from "./useEegProcessing";

export interface CalmnessState {
  score: number;       // 0–100
  bumpCount: number;
  lastBump: number | null;
  trend: number[];     // rolling calmness history
}

export function useCalmness(bandPowers: BandPowers | null, bpm: number) {
  const [state, setState] = useState<CalmnessState>({
    score: 50,
    bumpCount: 0,
    lastBump: null,
    trend: Array.from({ length: 200 }, (_, i) => 0.4 + Math.sin(i / 18) * 0.1),
  });

  const prevAlpha = useRef(0);
  const bumpCooldown = useRef(0);

  useEffect(() => {
    if (!bandPowers) return;

    const { alpha, theta, beta, delta } = bandPowers;

    // Calmness model: high alpha + low beta/delta = calm
    const raw = (alpha * 1.8 + theta * 0.6 - beta * 0.9 - delta * 0.3) / 2.1;
    const normalized = Math.min(100, Math.max(0, (raw + 0.4) * 80));

    // Alpha bump detector: rapid alpha increase above threshold
    const alphaDelta = alpha - prevAlpha.current;
    prevAlpha.current = alpha;
    const isAlphaBump = alphaDelta > 0.08 && bumpCooldown.current <= 0 && alpha > 0.6;
    if (isAlphaBump) bumpCooldown.current = 60; // 2s cooldown at 30fps
    if (bumpCooldown.current > 0) bumpCooldown.current -= 1;

    setState(prev => {
      const score = Math.round(prev.score * 0.92 + normalized * 0.08); // smooth
      const trend = [...prev.trend, score / 100];
      if (trend.length > 200) trend.shift();
      return {
        score,
        trend,
        bumpCount: isAlphaBump ? prev.bumpCount + 1 : prev.bumpCount,
        lastBump: isAlphaBump ? Date.now() : prev.lastBump,
      };
    });
  }, [bandPowers]);

  const reset = useCallback(() => {
    setState({ score: 50, bumpCount: 0, lastBump: null, trend: [] });
    prevAlpha.current = 0;
    bumpCooldown.current = 0;
  }, []);

  return { ...state, reset };
}
