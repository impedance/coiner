import { getDatabase } from '../client/sqlite';
import { CategoryGroup } from '../../types';

export class CategoryGroupRepository {
    async getAll(): Promise<CategoryGroup[]> {
        const db = await getDatabase();
        return db.getAllAsync<CategoryGroup>('SELECT * FROM category_groups ORDER BY sort_order ASC, name ASC');
    }

    async getById(id: string): Promise<CategoryGroup | null> {
        const db = await getDatabase();
        return db.getFirstAsync<CategoryGroup>('SELECT * FROM category_groups WHERE id = ?', id);
    }
}

export const categoryGroupRepository = new CategoryGroupRepository();
