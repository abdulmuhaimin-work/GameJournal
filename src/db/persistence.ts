const DB_KEY = 'game-journal-db';

export function saveToIndexedDB(data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GameJournal', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('store', 'readwrite');
      const store = tx.objectStore('store');
      store.put(data, DB_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
    request.onupgradeneeded = (e) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore('store');
    };
  });
}

export function loadFromIndexedDB(): Promise<Uint8Array | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GameJournal', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('store', 'readonly');
      const store = tx.objectStore('store');
      const getReq = store.get(DB_KEY);
      getReq.onsuccess = () => {
        db.close();
        resolve(getReq.result ?? null);
      };
      getReq.onerror = () => reject(getReq.error);
    };
    request.onupgradeneeded = (e) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore('store');
    };
  });
}
