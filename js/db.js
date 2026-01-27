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

    async addReading(data, retryCount = 0) {
        // Ensure database is initialized and ready
        if (!this.db) {
            try {
                await this.init();
            } catch (e) {
                console.error('Failed to initialize database:', e);
                return false;
            }
        }

        // Double-check database is still open
        if (!this.db || this.db.objectStoreNames.length === 0) {
            console.warn('Database not ready, skipping write');
            return false;
        }

        return new Promise(async (resolve, reject) => {
            try {
                // Add date string for easier indexing
                const record = {
                    ...data,
                    date: new Date(data.timestamp).toISOString().split('T')[0]
                };

                const transaction = this.db.transaction(['readings'], 'readwrite');
                const store = transaction.objectStore('readings');
                const request = store.add(record);

                request.onsuccess = () => resolve(true);
                request.onerror = (e) => {
                    console.warn('Error saving reading:', e);
                    resolve(false);
                };
            } catch (e) {
                // If connection is closed, try to re-init and retry once
                if (retryCount < 1 && (e.name === 'InvalidStateError' || e.message.includes('closing'))) {
                    console.log('DB connection closed, retrying...');
                    this.db = null; // Force re-init
                    const result = await this.addReading(data, retryCount + 1);
                    resolve(result);
                } else {
                    console.warn('Transaction failed:', e);
                    resolve(false);
                }
            }
        });
    }

    async getReadings(days = 7) {
        if (!this.db) {
            try {
                await this.init();
            } catch (e) {
                console.error('Failed to initialize database:', e);
                return [];
            }
        }

        if (!this.db || this.db.objectStoreNames.length === 0) {
            console.warn('Database not ready');
            return [];
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffString = cutoffDate.toISOString();

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['readings'], 'readonly');
                const store = transaction.objectStore('readings');
                const range = IDBKeyRange.lowerBound(cutoffString);
                const request = store.getAll(range);

                request.onsuccess = () => resolve(request.result || []);
                request.onerror = (e) => {
                    console.warn('Error fetching readings:', e);
                    resolve([]); // Return empty array instead of rejecting
                };
            } catch (e) {
                console.warn('Transaction failed:', e);
                resolve([]);
            }
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

// Initialize when DOM is ready to prevent timing issues
if (typeof window !== 'undefined') {
    window.db = db;

    // Initialize database when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            db.init().catch(e => console.warn('DB init delayed:', e));
        });
    } else {
        // DOM already loaded
        db.init().catch(e => console.warn('DB init delayed:', e));
    }
}
