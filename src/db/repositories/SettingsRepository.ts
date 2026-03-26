import { getDatabase } from '../client/sqlite';
import { AppSetting } from '../../types';

export class SettingsRepository {
    async get(key: string): Promise<string | null> {
        const db = await getDatabase();
        const result = await db.getFirstAsync<AppSetting>('SELECT * FROM app_settings WHERE key = ?', key);
        return result?.value ?? null;
    }

    async set(key: string, value: string): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        const existing = await this.get(key);

        if (existing !== null) {
            await db.runAsync('UPDATE app_settings SET value = ?, updated_at = ? WHERE key = ?', value, now, key);
        } else {
            await db.runAsync('INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)', key, value, now);
        }
    }

    async getAll(): Promise<AppSetting[]> {
        const db = await getDatabase();
        return db.getAllAsync<AppSetting>('SELECT * FROM app_settings');
    }
}

export const settingsRepository = new SettingsRepository();
