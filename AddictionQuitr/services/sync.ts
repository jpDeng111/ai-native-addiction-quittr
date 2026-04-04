// Cloud sync service - Supabase integration placeholder

// For MVP/hackathon, this is a stub that can be connected to Supabase later.
// All data is stored locally first (offline-first), sync happens in background.

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export interface SyncStatus {
  lastSyncTime: number | null;
  pendingCount: number;
  isSyncing: boolean;
}

let syncStatus: SyncStatus = {
  lastSyncTime: null,
  pendingCount: 0,
  isSyncing: false,
};

export function getSyncStatus(): SyncStatus {
  return { ...syncStatus };
}

// Stub: sync diary entries to cloud
export async function syncDiaryEntries(): Promise<boolean> {
  // TODO: Implement with Supabase client
  // 1. Get all unsynced diary entries from SQLite (synced = 0)
  // 2. POST to Supabase diary_entries table
  // 3. Mark as synced in local DB
  console.log('[Sync] Diary sync not yet implemented - using local only');
  return true;
}

// Stub: sync daily stats to cloud
export async function syncDailyStats(): Promise<boolean> {
  // TODO: Implement with Supabase client
  console.log('[Sync] Stats sync not yet implemented - using local only');
  return true;
}

// Stub: full sync
export async function performFullSync(): Promise<boolean> {
  if (syncStatus.isSyncing) return false;

  syncStatus.isSyncing = true;
  try {
    await syncDiaryEntries();
    await syncDailyStats();
    syncStatus.lastSyncTime = Date.now();
    syncStatus.isSyncing = false;
    return true;
  } catch (error) {
    console.error('[Sync] Full sync failed:', error);
    syncStatus.isSyncing = false;
    return false;
  }
}

// Stub: download data from cloud (for new device)
export async function pullFromCloud(): Promise<boolean> {
  // TODO: Implement pulling data from Supabase
  console.log('[Sync] Pull from cloud not yet implemented');
  return true;
}
