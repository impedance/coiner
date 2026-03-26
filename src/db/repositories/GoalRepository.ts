import { getDatabase } from '../client/sqlite';
import { Goal, GoalContribution } from '../../types';
import * as Crypto from 'expo-crypto';

export class GoalRepository {
    async getAll(): Promise<Goal[]> {
        const db = await getDatabase();
        return db.getAllAsync<Goal>('SELECT * FROM goals WHERE status != "archived" ORDER BY created_at DESC');
    }

    async getById(id: string): Promise<Goal | null> {
        const db = await getDatabase();
        return db.getFirstAsync<Goal>('SELECT * FROM goals WHERE id = ?', id);
    }

    async create(goal: Partial<Goal>): Promise<string> {
        const db = await getDatabase();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            'INSERT INTO goals (id, name, goal_type, target_cents, current_cents, due_date, status, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            id,
            goal.name ?? '',
            goal.goal_type ?? 'custom',
            goal.target_cents ?? 0,
            goal.current_cents ?? 0,
            goal.due_date ?? null,
            goal.status ?? 'active',
            goal.note ?? null,
            now,
            now
        );

        return id;
    }

    async update(id: string, goal: Partial<Goal>): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        const sets: string[] = [];
        const params: any[] = [];

        if (goal.name !== undefined) { sets.push('name = ?'); params.push(goal.name); }
        if (goal.goal_type !== undefined) { sets.push('goal_type = ?'); params.push(goal.goal_type); }
        if (goal.target_cents !== undefined) { sets.push('target_cents = ?'); params.push(goal.target_cents); }
        if (goal.current_cents !== undefined) { sets.push('current_cents = ?'); params.push(goal.current_cents); }
        if (goal.due_date !== undefined) { sets.push('due_date = ?'); params.push(goal.due_date); }
        if (goal.status !== undefined) { sets.push('status = ?'); params.push(goal.status); }
        if (goal.note !== undefined) { sets.push('note = ?'); params.push(goal.note); }

        if (sets.length === 0) return;

        sets.push('updated_at = ?');
        params.push(now);
        params.push(id);

        await db.runAsync(`UPDATE goals SET ${sets.join(', ')} WHERE id = ?`, ...params);
    }

    async addContribution(contribution: Partial<GoalContribution> & { goal_id: string, amount_cents: number }): Promise<string> {
        const db = await getDatabase();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        await db.withTransactionAsync(async () => {
            await db.runAsync(
                'INSERT INTO goal_contributions (id, goal_id, transaction_id, amount_cents, happened_at, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                id,
                contribution.goal_id,
                contribution.transaction_id ?? null,
                contribution.amount_cents,
                contribution.happened_at || now,
                contribution.note ?? null,
                now
            );

            await db.runAsync(
                'UPDATE goals SET current_cents = current_cents + ?, updated_at = ? WHERE id = ?',
                contribution.amount_cents,
                now,
                contribution.goal_id
            );
        });

        return id;
    }

    async getContributions(goalId: string): Promise<GoalContribution[]> {
        const db = await getDatabase();
        return db.getAllAsync<GoalContribution>(
            'SELECT * FROM goal_contributions WHERE goal_id = ? ORDER BY happened_at DESC',
            goalId
        );
    }
}

export const goalRepository = new GoalRepository();
