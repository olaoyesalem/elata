"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface RPPGState {
  bpm: number;
  ibi: number;
  hrv: number;
  snr: number;
  status: "idle" | "requesting" | "calibrating" | "streaming" | "error";
  error: string | null;
  ecgBuffer: number[];
}

const BUFFER_SIZE = 360;

export function useRPPG() {
  const [state, setState] = useState<RPPGState>({
    bpm: 0,
    ibi: 0,
    hrv: 0,
    snr: 0,
    status: "idle",
    error: null,
    ecgBuffer: [],
  });

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);
  const bpmRef = useRef(72);

  const start = useCallback(async () => {
    setState(s => ({ ...s, status: "requesting", error: null }));

    try {
      // Try to load the real SDK first
      let sdkAvailable = false;
      try {
        const { RPPG } = await import("@elata-biosciences/rppg-web" as string);
        sdkAvailable = !!RPPG;
      } catch {
        sdkAvailable = false;
      }

      if (sdkAvailable) {
        // Real SDK path — future implementation
        setState(s => ({ ...s, status: "streaming" }));
        return;
      }

      // Mock path: use camera for permission UX, then simulate signal
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      setState(s => ({ ...s, status: "calibrating" }));

      // Simulate calibration delay then start streaming mock data
      setTimeout(() => {
        setState(s => ({ ...s, status: "streaming" }));
        bpmRef.current = 64 + Math.floor(Math.random() * 16);
      }, 3000);

      const tick = () => {
        tRef.current += 1;
        const t = tRef.current;

        // Simulate BPM drift
        if (t % 60 === 0) {
          bpmRef.current = Math.max(55, Math.min(100, bpmRef.current + (Math.random() - 0.5) * 3));
        }

        const bpm = bpmRef.current;
        const ibi = (60 / bpm) * 1000;
        const phase = ((t * bpm) / 60) % 1;

        // ECG-ish sample
        let sample = Math.sin(phase * Math.PI * 2) * 0.05;
        if (phase > 0.45 && phase < 0.5) sample -= 0.3;
        if (phase > 0.5 && phase < 0.55) sample += 1;
        if (phase > 0.55 && phase < 0.6) sample -= 0.5;
        sample += (Math.random() - 0.5) * 0.04;

        setState(s => {
          const buf = [...s.ecgBuffer, sample];
          if (buf.length > BUFFER_SIZE) buf.shift();
          return {
            ...s,
            bpm: Math.round(bpm * 10) / 10,
            ibi: Math.round(ibi),
            hrv: 30 + Math.sin(t / 40) * 12,
            snr: 12 + Math.sin(t / 70) * 2,
            ecgBuffer: buf,
          };
        });

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setState(s => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : "Camera access denied",
      }));
    }
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setState(s => ({ ...s, status: "idle" }));
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { ...state, start, stop };
}
