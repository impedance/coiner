import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;
    if (dbPromise) return dbPromise;

    dbPromise = (async () => {
        const openedDb = await SQLite.openDatabaseAsync('moneywork.db');
        db = openedDb;
        dbPromise = null;
        return openedDb;
    })();

    return dbPromise;
}
