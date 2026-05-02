"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import { useRPPG } from "@/hooks/useRPPG";
import { useEegDevice } from "@/hooks/useEegDevice";
import { useEegProcessing } from "@/hooks/useEegProcessing";
import { useCalmness } from "@/hooks/useCalmness";

export type SessionMode = "freestyle" | "focus" | "breathing";

interface BioSignalContextValue {
  // rPPG
  bpm: number;
  ibi: number;
  hrv: number;
  snr: number;
  ecgBuffer: number[];
  rppgStatus: string;
  rppgError: string | null;
  startRPPG: () => void;
  stopRPPG: () => void;

  // EEG device
  eegStatus: string;
  eegDeviceName: string | null;
  eegBattery: number;
  eegSignalQuality: [number, number, number, number];
  eegError: string | null;
  connectEeg: () => void;
  disconnectEeg: () => void;

  // EEG processing
  bandPowers: { delta: number; theta: number; alpha: number; beta: number; gamma: number };
  channelBuffers: number[][];
  alphaThetaRatio: number;
  dominantBand: string;

  // Calmness
  calmness: number;
  bumpCount: number;
  lastBump: number | null;
  calmnessTrind: number[];

  // Session
  sessionMode: SessionMode;
  setSessionMode: (m: SessionMode) => void;
  burstSignal: number;
  triggerBurst: () => void;
}

const BioSignalCtx = createContext<BioSignalContextValue | null>(null);

export function BioSignalProvider({ children }: { children: React.ReactNode }) {
  const rppg = useRPPG();
  const eegDevice = useEegDevice();
  const eegProc = useEegProcessing();
  const calmness = useCalmness(
    eegDevice.status === "streaming" ? eegProc.bandPowers : null,
    rppg.bpm
  );

  const [sessionMode, setSessionMode] = useState<SessionMode>("freestyle");
  const [burstSignal, setBurstSignal] = useState(0);

  const triggerBurst = () => setBurstSignal(b => b + 1);

  const connectEeg = () => {
    eegDevice.connect((sample) => {
      eegProc.processSample(sample);
    });
  };

  const value: BioSignalContextValue = {
    bpm: rppg.bpm || 72,
    ibi: rppg.ibi,
    hrv: rppg.hrv,
    snr: rppg.snr,
    ecgBuffer: rppg.ecgBuffer,
    rppgStatus: rppg.status,
    rppgError: rppg.error,
    startRPPG: rppg.start,
    stopRPPG: rppg.stop,

    eegStatus: eegDevice.status,
    eegDeviceName: eegDevice.deviceName,
    eegBattery: eegDevice.batteryLevel,
    eegSignalQuality: eegDevice.signalQuality,
    eegError: eegDevice.error,
    connectEeg,
    disconnectEeg: eegDevice.disconnect,

    bandPowers: eegProc.bandPowers,
    channelBuffers: eegProc.channelBuffers,
    alphaThetaRatio: eegProc.alphaThetaRatio,
    dominantBand: eegProc.dominantBand,

    calmness: calmness.score,
    bumpCount: calmness.bumpCount,
    lastBump: calmness.lastBump,
    calmnessTrind: calmness.trend,

    sessionMode,
    setSessionMode,
    burstSignal,
    triggerBurst,
  };

  return <BioSignalCtx.Provider value={value}>{children}</BioSignalCtx.Provider>;
}

export function useBioSignal() {
  const ctx = useContext(BioSignalCtx);
  if (!ctx) throw new Error("useBioSignal must be used within BioSignalProvider");
  return ctx;
}
