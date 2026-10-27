# AdaptIQ Offline-First & Synchronization Protocol

## 1. Overview
In alignment with UN Sustainable Development Goal 4, AdaptIQ functions seamlessly on under-resourced school hardware and intermittent rural internet connections. The platform incorporates a local-first persistence strategy that prevents data loss during disconnects.

## 2. IndexedDB Storage Architecture
Local storage in the browser uses native IndexedDB with four object stores:
1. `questionSets`: Pre-downloaded question batches available for offline practice.
2. `attempts`: Locally completed attempts with timestamps, question versions, and user selections.
3. `syncQueue`: FIFO queue of unsynced learning events keyed by a unique UUID `eventId`.
4. `metadata`: Stores the last successful sync timestamp and offline status flags.

## 3. Answer Event Lifecycle
```
[User Answers Question]
          |
          v
[Generate Event UUID]
          |
          v
[Save to IndexedDB Store ('attempts' & 'syncQueue')]
          |
          +-----------------------+
          |                       |
     (Online?)                (Offline?)
          |                       |
          v                       v
[Send POST /api/attempts]   [Queue in 'syncQueue']
          |                       |
          v                  [Wait for 'online' event]
   [Server 200 OK]                |
          |                       v
  [Mark Synced Locally]     [POST /api/attempts/sync]
                                  |
                                  v
                          [Server Deduplicates by eventId]
                                  |
                                  v
                          [Acknowledge & Clear Queue]
```

## 4. Idempotent Deduplication
Each attempt record includes an `eventId` (sparse unique index in MongoDB). If a network interruption causes a resubmission, the server recognizes the existing `eventId` and returns the existing record without inflating the student's score or corrupting mastery statistics.

## 5. Security & Multi-User Shared Devices
- Plaintext PINs and passwords are never cached in IndexedDB.
- Offline practice sets are stored per student ID.
- Upon logout, pending sync events are preserved in a quarantined local queue to prevent student data loss, while active authentication tokens are purged from browser memory.
