import { useState, useCallback, useEffect } from 'react';
import { weeklyReviewRepository } from '../db/repositories/WeeklyReviewRepository';
import { transactionRepository } from '../db/repositories/TransactionRepository';
import { goalRepository } from '../db/repositories/GoalRepository';
import { WeeklyReview } from '../types';

export function useWeeklyReview(weekKey: string, periodStart: string, periodEnd: string) {
    const [review, setReview] = useState<WeeklyReview | null>(null);
    const [stats, setStats] = useState({ income: 0, expense: 0 });
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);

        // Fetch existing review
        const existing = await weeklyReviewRepository.getByWeek(weekKey);
        setReview(existing);

        // Fetch transactions for the period to calculate stats
        const allTxs = await transactionRepository.getAll();
        const periodTxs = allTxs.filter(tx =>
            tx.happened_at >= periodStart && tx.happened_at <= periodEnd
        );

        const income = periodTxs
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount_cents, 0);

        const expense = periodTxs
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount_cents, 0);

        setStats({ income, expense });
        setLoading(false);
    }, [weekKey, periodStart, periodEnd]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const saveReview = async (data: Partial<WeeklyReview>) => {
        await weeklyReviewRepository.upsert({
            week_key: weekKey,
            period_start: periodStart,
            period_end: periodEnd,
            income_cents: stats.income,
            expense_cents: stats.expense,
            ...data
        });
        await refresh();
    };

    return {
        review,
        stats,
        loading,
        saveReview,
        refresh
    };
}
