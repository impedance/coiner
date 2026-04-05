import { getDatabase } from '../client/sqlite';
import * as Crypto from 'expo-crypto';

export async function seedSystemData() {
    const db = await getDatabase();

    const now = new Date().toISOString();

    // Seed system category groups
    const systemGroups = [
        { name: 'Fixed', sort_order: 10 },
        { name: 'Variable', sort_order: 20 },
        { name: 'Savings', sort_order: 30 },
        { name: 'Income', sort_order: 40 },
    ];

    const groupMap: Record<string, string> = {};

    for (const group of systemGroups) {
        let existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM category_groups WHERE name = ?', group.name);
        if (!existing) {
            const id = Crypto.randomUUID();
            await db.runAsync(
                'INSERT INTO category_groups (id, name, sort_order, is_system, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)',
                id, group.name, group.sort_order, now, now
            );
            groupMap[group.name] = id;
        } else {
            groupMap[group.name] = existing.id;
        }
    }

    // Seed system categories if they don't exist
    const systemCategories = [
        { name: 'Reserve', kind: 'expense' as const, bucket_type: 'reserve', group: 'Savings' },
        { name: 'Joy Fund', kind: 'expense' as const, bucket_type: 'joy', group: 'Savings' },
        { name: 'Income', kind: 'income' as const, bucket_type: 'income', group: 'Income' },
        { name: 'General Expense', kind: 'expense' as const, bucket_type: 'expense', group: 'Variable' },
    ];

    for (const cat of systemCategories) {
        const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM categories WHERE name = ?', cat.name);
        const groupId = groupMap[cat.group];

        if (!existing) {
            await db.runAsync(
                'INSERT INTO categories (id, name, kind, group_id, bucket_type, is_system, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)',
                Crypto.randomUUID(), cat.name, cat.kind, groupId, cat.bucket_type, now, now
            );
        } else {
            // Update group_id if it's missing
            await db.runAsync('UPDATE categories SET group_id = ? WHERE id = ? AND group_id IS NULL', groupId, existing.id);
        }
    }

    // Seed system practice definitions
    const systemPractices = [
        { code: 'capture_all', title: 'Capture Every Cent', scope: 'daily' },
        { code: 'reserve_first', title: 'Reserve First (10%)', scope: 'daily' },
        { code: 'weekly_review', title: 'Weekly Review ritual', scope: 'weekly' },
        { code: 'joy_check', title: 'Joy Fund Check', scope: 'daily' },
    ];

    for (const practice of systemPractices) {
        const existing = await db.getFirstAsync('SELECT id FROM practice_definitions WHERE code = ?', practice.code);
        if (!existing) {
            await db.runAsync(
                'INSERT INTO practice_definitions (id, code, title, scope, is_system, created_at) VALUES (?, ?, ?, ?, 1, ?)',
                Crypto.randomUUID(), practice.code, practice.title, practice.scope, now
            );
        }
    }
}
