// SQLite database service for local data persistence

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('addictionquitr.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      content TEXT,
      tool_calls TEXT,
      tool_call_id TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS diary_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      analysis_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS mantra_records (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      count INTEGER NOT NULL,
      target_count INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      label TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      started_at INTEGER NOT NULL,
      ended_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS daily_stats (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      urge_count INTEGER DEFAULT 0,
      mantra_count INTEGER DEFAULT 0,
      focus_minutes INTEGER DEFAULT 0,
      good_deeds TEXT DEFAULT '[]',
      mood_score INTEGER DEFAULT 5,
      streak INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 30,
      device_event_id TEXT,
      created_at INTEGER NOT NULL
    );
  `);
}

// ---- Chat Messages ----
export async function saveChatMessage(message: {
  id: string;
  role: string;
  content: string | null;
  tool_calls?: string;
  tool_call_id?: string;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO chat_messages (id, role, content, tool_calls, tool_call_id, created_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [message.id, message.role, message.content, message.tool_calls || null, message.tool_call_id || null, Date.now()]
  );
}

export async function getChatHistory(limit: number = 50): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
}

export async function clearChatHistory() {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM chat_messages');
}

// ---- Diary ----
export async function saveDiaryEntry(entry: {
  id: string;
  date: string;
  content: string;
  analysis_json?: string;
}) {
  const database = await getDatabase();
  const now = Date.now();
  await database.runAsync(
    `INSERT OR REPLACE INTO diary_entries (id, date, content, analysis_json, created_at, updated_at, synced) 
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [entry.id, entry.date, entry.content, entry.analysis_json || null, now, now]
  );
}

export async function getDiaryEntry(date: string): Promise<any> {
  const database = await getDatabase();
  return await database.getFirstAsync(
    'SELECT * FROM diary_entries WHERE date = ?',
    [date]
  );
}

export async function getAllDiaryEntries(): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM diary_entries ORDER BY date DESC'
  );
}

// ---- Mantra Records ----
export async function saveMantraRecord(record: {
  id: string;
  date: string;
  count: number;
  target_count: number;
  completed: boolean;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO mantra_records (id, date, count, target_count, completed, created_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [record.id, record.date, record.count, record.target_count, record.completed ? 1 : 0, Date.now()]
  );
}

export async function getMantraCountForDate(date: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(count), 0) as total FROM mantra_records WHERE date = ?',
    [date]
  );
  return result?.total || 0;
}

// ---- Pomodoro Sessions ----
export async function savePomodoroSession(session: {
  id: string;
  date: string;
  duration_minutes: number;
  label?: string;
  completed: boolean;
  started_at: number;
  ended_at?: number;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO pomodoro_sessions (id, date, duration_minutes, label, completed, started_at, ended_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [session.id, session.date, session.duration_minutes, session.label || null, session.completed ? 1 : 0, session.started_at, session.ended_at || null]
  );
}

export async function getFocusMinutesForDate(date: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM pomodoro_sessions WHERE date = ? AND completed = 1',
    [date]
  );
  return result?.total || 0;
}

// ---- Daily Stats ----
export async function saveDailyStats(stats: {
  date: string;
  urge_count?: number;
  mantra_count?: number;
  focus_minutes?: number;
  good_deeds?: string[];
  mood_score?: number;
  streak?: number;
}) {
  const database = await getDatabase();
  const existing = await database.getFirstAsync<any>(
    'SELECT * FROM daily_stats WHERE date = ?',
    [stats.date]
  );

  if (existing) {
    await database.runAsync(
      `UPDATE daily_stats SET 
        urge_count = COALESCE(?, urge_count),
        mantra_count = COALESCE(?, mantra_count),
        focus_minutes = COALESCE(?, focus_minutes),
        good_deeds = COALESCE(?, good_deeds),
        mood_score = COALESCE(?, mood_score),
        streak = COALESCE(?, streak),
        updated_at = ?
       WHERE date = ?`,
      [
        stats.urge_count ?? null,
        stats.mantra_count ?? null,
        stats.focus_minutes ?? null,
        stats.good_deeds ? JSON.stringify(stats.good_deeds) : null,
        stats.mood_score ?? null,
        stats.streak ?? null,
        Date.now(),
        stats.date,
      ]
    );
  } else {
    const id = `stats_${stats.date}`;
    await database.runAsync(
      `INSERT INTO daily_stats (id, date, urge_count, mantra_count, focus_minutes, good_deeds, mood_score, streak, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        stats.date,
        stats.urge_count || 0,
        stats.mantra_count || 0,
        stats.focus_minutes || 0,
        JSON.stringify(stats.good_deeds || []),
        stats.mood_score || 5,
        stats.streak || 0,
        Date.now(),
      ]
    );
  }
}

export async function getDailyStats(date: string): Promise<any> {
  const database = await getDatabase();
  return await database.getFirstAsync(
    'SELECT * FROM daily_stats WHERE date = ?',
    [date]
  );
}

export async function getStatsRange(startDate: string, endDate: string): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM daily_stats WHERE date >= ? AND date <= ? ORDER BY date ASC',
    [startDate, endDate]
  );
}

export async function getCurrentStreak(): Promise<number> {
  const database = await getDatabase();
  const stats = await database.getAllAsync<{ date: string; streak: number }>(
    'SELECT date, streak FROM daily_stats ORDER BY date DESC LIMIT 30'
  );
  if (stats.length === 0) return 0;
  return stats[0].streak || 0;
}

export function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
