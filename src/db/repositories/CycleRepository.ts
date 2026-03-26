import { getDatabase } from '../client/sqlite';
import { Cycle, CyclePractice } from '../../types';
import * as Crypto from 'expo-crypto';

export class CycleRepository {
    async getActiveCycle(): Promise<Cycle | null> {
        const db = await getDatabase();
        return db.getFirstAsync<Cycle>('SELECT * FROM cycles WHERE status = "active" LIMIT 1');
    }

    async getAll(): Promise<Cycle[]> {
        const db = await getDatabase();
        return db.getAllAsync<Cycle>('SELECT * FROM cycles ORDER BY start_date DESC');
    }

    async getById(id: string): Promise<Cycle | null> {
        const db = await getDatabase();
        return db.getFirstAsync<Cycle>('SELECT * FROM cycles WHERE id = ?', id);
    }

    async startCycle(cycle: Partial<Cycle>, practiceDefinitionIds: string[]): Promise<string> {
        const db = await getDatabase();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        await db.withTransactionAsync(async () => {
            // Deactivate any existing active cycles
            await db.runAsync('UPDATE cycles SET status = "completed", updated_at = ? WHERE status = "active"', now);

            await db.runAsync(
                'INSERT INTO cycles (id, title, duration_days, mode, start_date, end_date, status, target_level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                id,
                cycle.title ?? 'New Cycle',
                cycle.duration_days ?? 30,
                cycle.mode || 'soft',
                cycle.start_date ?? now,
                cycle.end_date ?? now,
                'active',
                cycle.target_level || 'minimum',
                now,
                now
            );

            for (const practiceId of practiceDefinitionIds) {
                await db.runAsync(
                    'INSERT INTO cycle_practices (id, cycle_id, practice_definition_id, required) VALUES (?, ?, ?, ?)',
                    Crypto.randomUUID(),
                    id,
                    practiceId,
                    1
                );
            }
        });

        return id;
    }

    async updateStatus(id: string, status: 'active' | 'completed' | 'failed'): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        await db.runAsync('UPDATE cycles SET status = ?, updated_at = ? WHERE id = ?', status, now, id);
    }

    async getPractices(cycleId: string): Promise<CyclePractice[]> {
        const db = await getDatabase();
        return db.getAllAsync<CyclePractice>('SELECT * FROM cycle_practices WHERE cycle_id = ?', cycleId);
    }
}

export const cycleRepository = new CycleRepository();
