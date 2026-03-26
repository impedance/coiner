import { getDatabase } from '../client/sqlite';
import { MoneyStep } from '../../types';
import * as Crypto from 'expo-crypto';

export class MoneyStepRepository {
    async getAll(): Promise<MoneyStep[]> {
        const db = await getDatabase();
        return db.getAllAsync<MoneyStep>('SELECT * FROM money_steps WHERE status != \'archived\' ORDER BY created_at ASC');
    }

    async create(step: Partial<MoneyStep>): Promise<string> {
        const db = await getDatabase();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            'INSERT INTO money_steps (id, title, description, step_type, status, started_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            id,
            step.title ?? '',
            step.description ?? null,
            step.step_type ?? 'habit',
            step.status ?? 'active',
            step.started_at || now,
            now,
            now
        );

        return id;
    }

    async update(id: string, step: Partial<MoneyStep>): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        const sets: string[] = [];
        const params: any[] = [];

        if (step.title !== undefined) { sets.push('title = ?'); params.push(step.title); }
        if (step.description !== undefined) { sets.push('description = ?'); params.push(step.description); }
        if (step.step_type !== undefined) { sets.push('step_type = ?'); params.push(step.step_type); }
        if (step.status !== undefined) { 
            sets.push('status = ?'); 
            params.push(step.status);
            if (step.status === 'achieved') {
                sets.push('achieved_at = ?');
                params.push(now);
            }
        }
        
        if (sets.length === 0) return;

        sets.push('updated_at = ?');
        params.push(now);
        params.push(id);

        await db.runAsync(`UPDATE money_steps SET ${sets.join(', ')} WHERE id = ?`, ...params);
    }
}

export const moneyStepRepository = new MoneyStepRepository();
