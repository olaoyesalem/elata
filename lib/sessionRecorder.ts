import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface SessionRecord {
  timestamp: number;
  bpm: number;
  calmness: number;
  alphaBump: boolean;
  eegChannels?: [number, number, number, number];
  bandPowers?: { delta: number; theta: number; alpha: number; beta: number; gamma: number };
}

export interface SessionMeta {
  id: string;
  name: string;
  date: number;
  duration: number;
  mode: string;
  maxCalmness: number;
  avgHR: number;
  bumpCount: number;
  thumbnail?: string; // data URL
}

interface MindCanvasDB extends DBSchema {
  sessions: {
    key: string;
    value: { meta: SessionMeta; records: SessionRecord[] };
    indexes: { "by-date": number };
  };
}

let dbInstance: IDBPDatabase<MindCanvasDB> | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<MindCanvasDB>("mind-canvas", 1, {
    upgrade(db) {
      const store = db.createObjectStore("sessions", { keyPath: "meta.id" });
      store.createIndex("by-date", "meta.date");
    },
  });
  return dbInstance;
}

export class SessionRecorder {
  private records: SessionRecord[] = [];
  private startTime = 0;
  private mode = "freestyle";
  private _recording = false;

  get recording() { return this._recording; }

  start(mode = "freestyle") {
    this.records = [];
    this.startTime = Date.now();
    this.mode = mode;
    this._recording = true;
  }

  push(record: Omit<SessionRecord, "timestamp">) {
    if (!this._recording) return;
    this.records.push({ ...record, timestamp: Date.now() - this.startTime });
  }

  async stop(name: string, thumbnail?: string): Promise<SessionMeta> {
    this._recording = false;
    const duration = Date.now() - this.startTime;
    const bpms = this.records.map(r => r.bpm).filter(Boolean);
    const calms = this.records.map(r => r.calmness);
    const bumps = this.records.filter(r => r.alphaBump).length;

    const meta: SessionMeta = {
      id: `${Date.now()}`,
      name,
      date: this.startTime,
      duration,
      mode: this.mode,
      maxCalmness: Math.max(...calms, 0),
      avgHR: bpms.length ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : 0,
      bumpCount: bumps,
      thumbnail,
    };

    const db = await getDB();
    await db.put("sessions", { meta, records: [...this.records] });
    return meta;
  }
}

export async function listSessions(): Promise<SessionMeta[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("sessions", "by-date");
  return all.map(e => e.meta).reverse();
}

export async function getSession(id: string) {
  const db = await getDB();
  return db.get("sessions", id);
}

export async function deleteSession(id: string) {
  const db = await getDB();
  return db.delete("sessions", id);
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function generateSessionName(): string {
  const adj = ["drizzle", "morning", "static", "low", "fern", "moss", "ash", "linen", "north", "slate", "amber", "dusk", "tide", "bloom"];
  const noun = ["sept", "linen", "signal", "tide", "exhale", "holding", "fold", "window", "light", "breath", "still", "field"];
  return `${adj[Math.floor(Math.random() * adj.length)]}.${noun[Math.floor(Math.random() * noun.length)]}`;
}
