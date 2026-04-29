import { getDatabase } from '../client/sqlite';
import { Category } from '../../types';
import * as Crypto from 'expo-crypto';

export class CategoryRepository {
    async getAll(): Promise<Category[]> {
        const db = await getDatabase();
        return db.getAllAsync<Category>('SELECT * FROM categories WHERE is_archived = 0 ORDER BY sort_order ASC, name ASC');
    }

    async create(data: Partial<Category>): Promise<string> {
        const db = await getDatabase();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();
        await db.runAsync(
            'INSERT INTO categories (id, name, kind, group_id, bucket_type, sort_order, is_archived, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            id,
            data.name || 'New Category',
            data.kind || 'expense',
            data.group_id || null,
            data.bucket_type || 'expense',
            data.sort_order || 0,
            0,
            now,
            now
        );
        return id;
    }

    async update(id: string, data: Partial<Category>): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        const fields: string[] = [];
        const values: any[] = [];
        
        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.group_id !== undefined) {
            fields.push('group_id = ?');
            values.push(data.group_id);
        }
        if (data.sort_order !== undefined) {
            fields.push('sort_order = ?');
            values.push(data.sort_order);
        }
        if (data.is_archived !== undefined) {
            fields.push('is_archived = ?');
            values.push(data.is_archived ? 1 : 0);
        }

        if (fields.length === 0) return;

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);
        await db.runAsync(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, ...values);
    }

    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        await db.runAsync('UPDATE categories SET is_archived = 1, updated_at = ? WHERE id = ?', now, id);
    }
}

export const categoryRepository = new CategoryRepository();
