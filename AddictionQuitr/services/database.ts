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
      session_date TEXT DEFAULT '',
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

    CREATE TABLE IF NOT EXISTS daily_checklist (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      details TEXT,
      completed_at INTEGER NOT NULL,
      UNIQUE(date, category)
    );

    CREATE TABLE IF NOT EXISTS emotion_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      emotion TEXT,
      intensity INTEGER,
      context TEXT,
      intervention_used TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      category TEXT,
      timeframe TEXT,
      goal_text TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS virtue_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      virtue_type TEXT NOT NULL,
      situation TEXT,
      action_taken TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sleep_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      target_bedtime TEXT,
      target_wake_time TEXT,
      actual_bedtime TEXT,
      actual_wake_time TEXT,
      sleep_quality TEXT,
      barriers TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  // Migration: Add session_date column to chat_messages if it doesn't exist
  // For tables created before this feature, we need to add the column
  try {
    await database.execAsync(`ALTER TABLE chat_messages ADD COLUMN session_date TEXT DEFAULT ''`);
  } catch {
    // Column already exists, ignore the error
  }
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

// ---- Chat Session (Daily Persistence) ----
// Save a chat message with session date
export async function saveChatMessageWithSession(message: {
  id: string;
  role: string;
  content: string;
  tool_calls?: string;
  tool_call_id?: string;
  session_date: string;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO chat_messages (id, role, content, tool_calls, tool_call_id, session_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [message.id, message.role, message.content || '', message.tool_calls || null, message.tool_call_id || null, message.session_date, Date.now()]
  );
}

// Load all messages for a specific day's session
export async function getSessionMessages(date: string): Promise<any[]> {
  const database = await getDatabase();
  const messages = await database.getAllAsync(
    `SELECT * FROM chat_messages WHERE session_date = ? ORDER BY created_at ASC`,
    [date]
  );
  return messages;
}

// Get list of all session dates (for history view)
export async function getSessionDates(): Promise<string[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync(
    `SELECT DISTINCT session_date FROM chat_messages WHERE session_date != '' ORDER BY session_date DESC`
  );
  return results.map((r: any) => r.session_date);
}

// Get session message count for a specific date
export async function getSessionMessageCount(date: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync(
    `SELECT COUNT(*) as count FROM chat_messages WHERE session_date = ?`,
    [date]
  ) as any;
  return result?.count || 0;
}

// Get conversation summary text for a session (all user + assistant messages concatenated)
export async function getSessionSummaryText(date: string): Promise<string> {
  const database = await getDatabase();
  const messages = await database.getAllAsync(
    `SELECT role, content FROM chat_messages WHERE session_date = ? AND role IN ('user', 'assistant') ORDER BY created_at ASC`,
    [date]
  );
  return messages.map((m: any) => `${m.role === 'user' ? '用户' : '助手'}: ${m.content}`).join('\n');
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

// ---- Daily Checklist ----
export async function saveChecklistItem(data: {
  id: string;
  date: string;
  category: string;
  details?: string;
  completed_at?: number;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO daily_checklist (id, date, category, details, completed_at) 
     VALUES (?, ?, ?, ?, ?)`,
    [data.id, data.date, data.category, data.details || null, data.completed_at || Date.now()]
  );
}

export async function getChecklistForDate(date: string): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM daily_checklist WHERE date = ? ORDER BY category',
    [date]
  );
}

export async function getTodayChecklistProgress(): Promise<{ items: any[]; completed: number; total: number }> {
  const today = getTodayDate();
  const items = await getChecklistForDate(today);
  return {
    items,
    completed: items.length,
    total: 6,
  };
}

// ---- Emotion Logs ----
export async function saveEmotionLog(data: {
  id: string;
  date: string;
  type: string;
  emotion?: string;
  intensity?: number;
  context?: string;
  intervention_used?: string;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO emotion_logs (id, date, type, emotion, intensity, context, intervention_used, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.id, data.date, data.type, data.emotion || null, data.intensity || null, data.context || null, data.intervention_used || null, Date.now()]
  );
}

export async function getEmotionLogsForDate(date: string): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM emotion_logs WHERE date = ? ORDER BY created_at DESC',
    [date]
  );
}

export async function getRecentEmotions(limit: number): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM emotion_logs ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
}

// ---- Goals ----
export async function saveGoal(data: {
  id: string;
  type: string;
  category?: string;
  timeframe?: string;
  goal_text: string;
  status?: string;
}) {
  const database = await getDatabase();
  const now = Date.now();
  await database.runAsync(
    `INSERT OR REPLACE INTO goals (id, type, category, timeframe, goal_text, status, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.id, data.type, data.category || null, data.timeframe || null, data.goal_text, data.status || 'active', now, now]
  );
}

export async function getActiveGoals(): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    "SELECT * FROM goals WHERE status = 'active' ORDER BY created_at DESC"
  );
}

export async function updateGoalStatus(id: string, status: string) {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE goals SET status = ?, updated_at = ? WHERE id = ?',
    [status, Date.now(), id]
  );
}

// ---- Virtue Logs ----
export async function saveVirtueLog(data: {
  id: string;
  date: string;
  virtue_type: string;
  situation?: string;
  action_taken?: string;
  notes?: string;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO virtue_logs (id, date, virtue_type, situation, action_taken, notes, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.id, data.date, data.virtue_type, data.situation || null, data.action_taken || null, data.notes || null, Date.now()]
  );
}

export async function getVirtueLogsForDate(date: string): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM virtue_logs WHERE date = ? ORDER BY created_at DESC',
    [date]
  );
}

// ---- Sleep Logs ----
export async function saveSleepLog(data: {
  id: string;
  date: string;
  target_bedtime?: string;
  target_wake_time?: string;
  actual_bedtime?: string;
  actual_wake_time?: string;
  sleep_quality?: string;
  barriers?: string;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO sleep_logs (id, date, target_bedtime, target_wake_time, actual_bedtime, actual_wake_time, sleep_quality, barriers, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.id, data.date, data.target_bedtime || null, data.target_wake_time || null, data.actual_bedtime || null, data.actual_wake_time || null, data.sleep_quality || null, data.barriers || null, Date.now()]
  );
}

export async function getSleepLogForDate(date: string): Promise<any> {
  const database = await getDatabase();
  return await database.getFirstAsync(
    'SELECT * FROM sleep_logs WHERE date = ?',
    [date]
  );
}

export async function getSleepLogsForWeek(startDate: string, endDate: string): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM sleep_logs WHERE date >= ? AND date <= ? ORDER BY date ASC',
    [startDate, endDate]
  );
}

// ---- Aggregated Today Progress ----
export async function getTodayProgress(): Promise<{
  checklistCompleted: string[];
  checklistTotal: number;
  emotionLogs: number;
  lastEmotion: { emotion: string; intensity: number } | null;
  sleepLogged: boolean;
  goalsCount: number;
  virtueLogsToday: number;
}> {
  const today = getTodayDate();
  const database = await getDatabase();

  // Get checklist items for today
  const checklistItems = await database.getAllAsync<{ category: string }>(
    'SELECT category FROM daily_checklist WHERE date = ?',
    [today]
  );
  const checklistCompleted = checklistItems.map(item => item.category);

  // Get emotion logs count for today
  const emotionCountResult = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM emotion_logs WHERE date = ?',
    [today]
  );
  const emotionLogs = emotionCountResult?.count || 0;

  // Get last emotion
  const lastEmotionRow = await database.getFirstAsync<{ emotion: string; intensity: number }>(
    'SELECT emotion, intensity FROM emotion_logs ORDER BY created_at DESC LIMIT 1'
  );
  const lastEmotion = lastEmotionRow ? { emotion: lastEmotionRow.emotion, intensity: lastEmotionRow.intensity } : null;

  // Check if sleep logged
  const sleepLog = await database.getFirstAsync<{ id: string }>(
    'SELECT id FROM sleep_logs WHERE date = ?',
    [today]
  );
  const sleepLogged = !!sleepLog;

  // Get active goals count
  const goalsCountResult = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM goals WHERE status = 'active'"
  );
  const goalsCount = goalsCountResult?.count || 0;

  // Get virtue logs count for today
  const virtueCountResult = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM virtue_logs WHERE date = ?',
    [today]
  );
  const virtueLogsToday = virtueCountResult?.count || 0;

  return {
    checklistCompleted,
    checklistTotal: 6,
    emotionLogs,
    lastEmotion,
    sleepLogged,
    goalsCount,
    virtueLogsToday,
  };
}
