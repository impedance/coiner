import { getDatabase } from '../client/sqlite';
import { MonthlyBucketPlan } from '../../types';
import * as Crypto from 'expo-crypto';

export class MonthlyBucketPlanRepository {
    async getByMonth(monthKey: string): Promise<MonthlyBucketPlan[]> {
        const db = await getDatabase();
        return db.getAllAsync<MonthlyBucketPlan>(
            'SELECT * FROM monthly_bucket_plans WHERE month_key = ?',
            monthKey
        );
    }

    async upsert(plan: Partial<MonthlyBucketPlan> & { month_key: string, category_id: string }): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        const existing = await db.getFirstAsync<MonthlyBucketPlan>(
            'SELECT * FROM monthly_bucket_plans WHERE month_key = ? AND category_id = ?',
            plan.month_key,
            plan.category_id
        );

        if (existing) {
            await db.runAsync(
                'UPDATE monthly_bucket_plans SET planned_cents = ?, assigned_cents = ?, carryover_mode = ?, updated_at = ? WHERE id = ?',
                plan.planned_cents ?? existing.planned_cents,
                plan.assigned_cents ?? existing.assigned_cents,
                plan.carryover_mode ?? existing.carryover_mode,
                now,
                existing.id
            );
        } else {
            const id = Crypto.randomUUID();
            await db.runAsync(
                'INSERT INTO monthly_bucket_plans (id, month_key, category_id, planned_cents, assigned_cents, carryover_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                id,
                plan.month_key,
                plan.category_id,
                plan.planned_cents ?? 0,
                plan.assigned_cents ?? 0,
                plan.carryover_mode ?? 'carry',
                now,
                now
            );
        }
    }
}

export const monthlyBucketPlanRepository = new MonthlyBucketPlanRepository();
