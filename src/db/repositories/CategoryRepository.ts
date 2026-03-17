import { getDatabase } from '../client/sqlite';
import { Category } from '../../types';
import * as Crypto from 'expo-crypto';

export class CategoryRepository {
    async getAll(): Promise<Category[]> {
        const db = await getDatabase();
        return db.getAllAsync<Category>('SELECT * FROM categories WHERE is_archived = 0 ORDER BY sort_order ASC, name ASC');
    }

    async getById(id: string): Promise<Category | null> {
        const db = await getDatabase();
        return db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?', id);
    }
}

export const categoryRepository = new CategoryRepository();
