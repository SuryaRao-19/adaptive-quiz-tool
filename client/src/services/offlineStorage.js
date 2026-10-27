/**
 * IndexedDB Offline Repository & Synchronization Engine (Phase 8.2 & 8.4)
 * 
 * Enables students in low-connectivity classrooms to:
 * 1. Cache practice question banks locally while connected.
 * 2. Practice without an active internet connection.
 * 3. Persist answer events locally before reporting them as saved.
 * 4. Idempotently batch-sync answers to the server upon reconnection.
 */

const DB_NAME = 'AdaptIQ_Offline_DB';
const DB_VERSION = 1;

let dbPromise = null;

export const initOfflineDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Cached Question Sets
      if (!db.objectStoreNames.contains('questionSets')) {
        db.createObjectStore('questionSets', { keyPath: 'id' });
      }

      // 2. Saved Attempts (Local Archive)
      if (!db.objectStoreNames.contains('attempts')) {
        const attemptStore = db.createObjectStore('attempts', { keyPath: 'eventId' });
        attemptStore.createIndex('timestamp', 'timestamp', { unique: false });
        attemptStore.createIndex('topic', 'topic', { unique: false });
      }

      // 3. Outbox Synchronization Queue
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'eventId' });
      }

      // 4. Metadata (last sync, user preferences)
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
};

/**
 * Cache questions for offline practice.
 */
export const cacheQuestionSet = async (subject, topic, questions) => {
  try {
    const db = await initOfflineDB();
    const id = `${subject}_${topic}`;
    const tx = db.transaction('questionSets', 'readwrite');
    const store = tx.objectStore('questionSets');
    store.put({
      id,
      subject,
      topic,
      questions,
      cachedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn('[Offline DB] Error caching question set:', err);
    return false;
  }
};

/**
 * Retrieve cached questions for a topic.
 */
export const getCachedQuestionSet = async (subject, topic) => {
  try {
    const db = await initOfflineDB();
    const id = `${subject}_${topic}`;
    const tx = db.transaction('questionSets', 'readonly');
    const store = tx.objectStore('questionSets');

    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result ? request.result.questions : null);
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
};

/**
 * Save an attempt event locally and enqueue it for background sync.
 */
export const saveOfflineAttempt = async (attemptData) => {
  try {
    const db = await initOfflineDB();
    const eventId = attemptData.eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const eventRecord = {
      ...attemptData,
      eventId,
      timestamp: attemptData.timestamp || new Date().toISOString()
    };

    const tx = db.transaction(['attempts', 'syncQueue'], 'readwrite');
    tx.objectStore('attempts').put(eventRecord);
    tx.objectStore('syncQueue').put(eventRecord);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(eventRecord);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[Offline DB] Failed to save offline attempt:', err);
    throw err;
  }
};

/**
 * Retrieve all pending answer events awaiting server synchronization.
 */
export const getPendingSyncQueue = async () => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
};

/**
 * Remove successfully synchronized events from the sync queue.
 */
export const markEventsAsSynced = async (eventIds = []) => {
  if (!eventIds.length) return;
  try {
    const db = await initOfflineDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    for (const id of eventIds) {
      store.delete(id);
    }
  } catch (err) {
    console.warn('[Offline DB] Error acknowledging synced events:', err);
  }
};

/**
 * Executes batch synchronization of pending events with the backend.
 */
export const syncPendingAttempts = async (apiClient) => {
  try {
    const queue = await getPendingSyncQueue();
    if (!queue || queue.length === 0) {
      return { synced: 0, pending: 0 };
    }

    const payload = { events: queue };
    const res = await apiClient.post('/attempts/sync', payload);

    if (res.data?.success && Array.isArray(res.data.acknowledgedEventIds)) {
      await markEventsAsSynced(res.data.acknowledgedEventIds);
      const remaining = await getPendingSyncQueue();
      return {
        synced: res.data.acknowledgedEventIds.length,
        pending: remaining.length
      };
    }
    return { synced: 0, pending: queue.length };
  } catch (err) {
    console.warn('[Offline Sync] Sync attempt deferred:', err?.message || err);
    return { synced: 0, error: err };
  }
};

// Automatic listener for network recovery
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('[Network] Connectivity restored. Attempting background sync...');
    try {
      const { default: api } = await import('./api');
      await syncPendingAttempts(api);
    } catch (e) {
      // Deferred until next attempt
    }
  });
}
