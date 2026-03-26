import { getDatabase } from '../client/sqlite';
import * as Crypto from 'expo-crypto';

export async function seedSystemData() {
    const db = await getDatabase();

    const now = new Date().toISOString();

    // Seed system categories if they don't exist
    const systemCategories = [
        { name: 'Reserve', kind: 'expense', bucket_type: 'reserve' },
        { name: 'Joy Fund', kind: 'expense', bucket_type: 'joy' },
        { name: 'Income', kind: 'income', bucket_type: 'income' },
        { name: 'General Expense', kind: 'expense', bucket_type: 'expense' },
    ];

    for (const cat of systemCategories) {
        const existing = await db.getFirstAsync('SELECT id FROM categories WHERE name = ?', cat.name);
        if (!existing) {
            await db.runAsync(
                'INSERT INTO categories (id, name, kind, bucket_type, is_system, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)',
                Crypto.randomUUID(), cat.name, cat.kind, cat.bucket_type, now, now
            );
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
