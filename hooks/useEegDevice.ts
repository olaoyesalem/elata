"use client";

import { useCallback, useRef, useState } from "react";

export interface EegSample {
  timestamp: number;
  channels: [number, number, number, number]; // TP9, AF7, AF8, TP10
}

export interface EegDeviceState {
  status: "idle" | "connecting" | "connected" | "streaming" | "error";
  deviceName: string | null;
  batteryLevel: number;
  signalQuality: [number, number, number, number];
  error: string | null;
}

type SampleCallback = (sample: EegSample) => void;

const CHANNEL_NAMES = ["TP9", "AF7", "AF8", "TP10"] as const;

export function useEegDevice() {
  const [state, setState] = useState<EegDeviceState>({
    status: "idle",
    deviceName: null,
    batteryLevel: 0,
    signalQuality: [0, 0, 0, 0],
    error: null,
  });

  const rafRef = useRef<number>(0);
  const tRef = useRef(0);
  const callbackRef = useRef<SampleCallback | null>(null);

  const connect = useCallback(async (onSample: SampleCallback) => {
    callbackRef.current = onSample;
    setState(s => ({ ...s, status: "connecting", error: null }));

    try {
      // Try real BLE SDK
      let sdkAvailable = false;
      try {
        const mod = await import("@elata-biosciences/eeg-web-ble" as string);
        sdkAvailable = !!mod;
      } catch {
        sdkAvailable = false;
      }

      if (sdkAvailable) {
        setState(s => ({ ...s, status: "connected" }));
        return;
      }

      // Mock: check WebBluetooth availability for UX
      if (!("bluetooth" in navigator)) {
        throw new Error("Web Bluetooth not supported in this browser (use Chrome/Edge)");
      }

      // Simulate BLE connection handshake
      setState(s => ({ ...s, status: "connecting" }));
      await new Promise(r => setTimeout(r, 1200));

      setState(s => ({
        ...s,
        status: "streaming",
        deviceName: "Muse-S-0x4A2B",
        batteryLevel: 78,
        signalQuality: [88, 92, 76, 95],
      }));

      // Stream simulated EEG at ~256 Hz (throttled to ~30fps for React)
      const tick = () => {
        tRef.current += 1;
        const t = tRef.current / 30;
        const seeds = [1.2, 3.1, 5.7, 7.4];
        const channels = seeds.map((seed, i) => {
          return (
            Math.sin(t * 22 + seed) * 0.4 +
            Math.sin(t * 50 + seed * 2) * 0.2 +
            Math.sin(t * 9 + seed * 3) * 0.6 +
            (Math.sin(tRef.current * seed * 73.1) * 0.5 - 0.25) * 0.25
          ) * 40; // μV scale
        }) as [number, number, number, number];

        callbackRef.current?.({ timestamp: Date.now(), channels });
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setState(s => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : "BLE connection failed",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    callbackRef.current = null;
    setState({
      status: "idle",
      deviceName: null,
      batteryLevel: 0,
      signalQuality: [0, 0, 0, 0],
      error: null,
    });
  }, []);

  return { ...state, channelNames: CHANNEL_NAMES, connect, disconnect };
}
