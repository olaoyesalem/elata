"use client";

import { useCallback, useRef, useState } from "react";
import type { EegSample } from "./useEegDevice";

export interface BandPowers {
  delta: number; // 1–4 Hz
  theta: number; // 4–8 Hz
  alpha: number; // 8–13 Hz
  beta: number;  // 13–30 Hz
  gamma: number; // 30–45 Hz
}

export interface EegProcessingState {
  bandPowers: BandPowers;
  channelBuffers: number[][];
  alphaThetaRatio: number;
  dominantBand: keyof BandPowers;
}

const BUFFER_LEN = 420;

export function useEegProcessing() {
  const [state, setState] = useState<EegProcessingState>({
    bandPowers: { delta: 0.4, theta: 0.28, alpha: 0.5, beta: 0.45, gamma: 0.18 },
    channelBuffers: [[], [], [], []],
    alphaThetaRatio: 1.5,
    dominantBand: "alpha",
  });

  const tRef = useRef(0);

  const processSample = useCallback((sample: EegSample) => {
    tRef.current += 1;
    const t = tRef.current;

    setState(prev => {
      // Update channel buffers
      const newBuffers = prev.channelBuffers.map((buf, i) => {
        const next = [...buf, sample.channels[i]];
        if (next.length > BUFFER_LEN) next.shift();
        return next;
      });

      // Simulate band power evolution (real WASM call would go here)
      const slowT = t / 120;
      const alpha = Math.min(1, Math.max(0.1, 0.5 + Math.sin(slowT * 0.7) * 0.25 + Math.sin(slowT * 2.1) * 0.1));
      const theta = Math.min(1, Math.max(0.1, 0.28 + Math.sin(slowT * 0.4) * 0.12));
      const delta = Math.min(1, Math.max(0.1, 0.4 + Math.sin(slowT * 0.2) * 0.1));
      const beta  = Math.min(1, Math.max(0.1, 0.45 + Math.sin(slowT * 1.1) * 0.15));
      const gamma = Math.min(1, Math.max(0.05, 0.18 + Math.sin(slowT * 2.3) * 0.06));

      const bands: BandPowers = { delta, theta, alpha, beta, gamma };
      const entries = Object.entries(bands) as [keyof BandPowers, number][];
      const dominant = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];

      return {
        bandPowers: bands,
        channelBuffers: newBuffers,
        alphaThetaRatio: alpha / theta,
        dominantBand: dominant,
      };
    });
  }, []);

  return { ...state, processSample };
}
