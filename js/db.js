/**
 * ForestGuard - IndexedDB Layer
 * Handles persistent storage for sensor data and settings.
 * Stores up to 1GB or browser limit.
 */
class ForestDB {
    constructor() {
        this.dbName = 'ForestGuardDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (e) => reject('Database error: ' + e.target.error);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                // Create readings store with timestamp index
                if (!db.objectStoreNames.contains('readings')) {
                    const store = db.createObjectStore('readings', { keyPath: 'timestamp' });
                    store.createIndex('date', 'date', { unique: false });
                }
                // Create settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this);
            };
        });
    }

    async addReading(data) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            // Add date string for easier indexing
            const record = {
                ...data,
                date: new Date(data.timestamp).toISOString().split('T')[0]
            };

            const transaction = this.db.transaction(['readings'], 'readwrite');
            const store = transaction.objectStore('readings');
            const request = store.add(record);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject('Error saving reading');
        });
    }

    async getReadings(days = 7) {
        if (!this.db) await this.init();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffString = cutoffDate.toISOString();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['readings'], 'readonly');
            const store = transaction.objectStore('readings');
            const range = IDBKeyRange.lowerBound(cutoffString);
            const request = store.getAll(range);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject('Error fetching readings');
        });
    }

    async clearOldData(retentionDays = 30) {
        if (!this.db) await this.init();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const cutoffString = cutoffDate.toISOString();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['readings'], 'readwrite');
            const store = transaction.objectStore('readings');
            const range = IDBKeyRange.upperBound(cutoffString);
            const request = store.delete(range);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject('Error clearing old data');
        });
    }

    async clearAll() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['readings'], 'readwrite');
            const store = transaction.objectStore('readings');
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject('Error clearing database');
        });
    }
}

// Export a singleton instance
const db = new ForestDB();
// Initialize immediately
db.init().catch(console.error);

if (typeof window !== 'undefined') {
    window.db = db;
}
