import { DiffResult } from '../types/instagram';

const DB_NAME = 'sociality_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const DIFF_KEY = 'sociality_active_diff';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Retrieves the stored DiffResult from IndexedDB (with fallback to localStorage migration).
 */
export async function getStoredDiff(): Promise<DiffResult | null> {
  // 1. Try to read from IndexedDB
  try {
    const db = await openDatabase();
    const diff = await new Promise<DiffResult | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(DIFF_KEY);

      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = () => {
        reject(req.error);
      };
    });

    if (diff) {
      return diff;
    }
  } catch (err) {
    console.warn('Could not read diff from IndexedDB:', err);
  }

  // 2. Fallback / migration from legacy localStorage
  try {
    const saved = localStorage.getItem(DIFF_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as DiffResult;
      // Migrate to IndexedDB in background
      saveStoredDiff(parsed).catch(() => {});
      // Free localStorage quota immediately
      try {
        localStorage.removeItem(DIFF_KEY);
      } catch {}
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading from localStorage fallback:', e);
  }

  return null;
}

/**
 * Saves DiffResult into IndexedDB, removing it from localStorage to prevent QuotaExceededError.
 */
export async function saveStoredDiff(diff: DiffResult): Promise<void> {
  // Remove from localStorage to clear quota
  try {
    localStorage.removeItem(DIFF_KEY);
  } catch {}

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(diff, DIFF_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save diff to IndexedDB:', err);
    // Safe fallback attempt in localStorage only if small enough, but catch any quota error
    try {
      localStorage.setItem(DIFF_KEY, JSON.stringify(diff));
    } catch (storageErr) {
      console.warn('Could not store diff in localStorage fallback (quota exceeded):', storageErr);
    }
  }
}

/**
 * Removes the stored diff from both IndexedDB and localStorage.
 */
export async function clearStoredDiff(): Promise<void> {
  try {
    localStorage.removeItem(DIFF_KEY);
  } catch {}

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(DIFF_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to remove diff from IndexedDB:', err);
  }
}
