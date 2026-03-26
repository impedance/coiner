import { getDatabase } from '../client/sqlite';
import { WeeklyReview } from '../../types';
import * as Crypto from 'expo-crypto';

export class WeeklyReviewRepository {
    async getByWeek(weekKey: string): Promise<WeeklyReview | null> {
        const db = await getDatabase();
        return db.getFirstAsync<WeeklyReview>(
            'SELECT * FROM weekly_reviews WHERE week_key = ?',
            weekKey
        );
    }

    async getAll(): Promise<WeeklyReview[]> {
        const db = await getDatabase();
        return db.getAllAsync<WeeklyReview>('SELECT * FROM weekly_reviews ORDER BY week_key DESC');
    }

    async upsert(review: Partial<WeeklyReview> & { week_key: string, period_start: string, period_end: string }): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        const existing = await db.getFirstAsync<WeeklyReview>(
            'SELECT * FROM weekly_reviews WHERE week_key = ?',
            review.week_key
        );

        if (existing) {
            await db.runAsync(
                `UPDATE weekly_reviews SET 
                    income_cents = ?, 
                    expense_cents = ?, 
                    reserve_delta_cents = ?, 
                    joy_delta_cents = ?, 
                    reflection = ?, 
                    next_focus = ?, 
                    updated_at = ? 
                WHERE id = ?`,
                review.income_cents ?? existing.income_cents,
                review.expense_cents ?? existing.expense_cents,
                review.reserve_delta_cents ?? existing.reserve_delta_cents,
                review.joy_delta_cents ?? existing.joy_delta_cents,
                review.reflection ?? existing.reflection ?? null,
                review.next_focus ?? existing.next_focus ?? null,
                now,
                existing.id
            );
        } else {
            const id = Crypto.randomUUID();
            await db.runAsync(
                `INSERT INTO weekly_reviews (
                    id, week_key, period_start, period_end, income_cents, expense_cents, 
                    reserve_delta_cents, joy_delta_cents, reflection, next_focus, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                id,
                review.week_key,
                review.period_start,
                review.period_end,
                review.income_cents ?? 0,
                review.expense_cents ?? 0,
                review.reserve_delta_cents ?? 0,
                review.joy_delta_cents ?? 0,
                review.reflection ?? null,
                review.next_focus ?? null,
                now,
                now
            );
        }
    }
}

export const weeklyReviewRepository = new WeeklyReviewRepository();
