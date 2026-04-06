import { useState, useCallback, useEffect } from 'react';
import { weeklyReviewRepository } from '../db/repositories/WeeklyReviewRepository';
import { transactionRepository } from '../db/repositories/TransactionRepository';
import { categoryRepository } from '../db/repositories/CategoryRepository';
import { WeeklyReview } from '../types';

export function useWeeklyReview(weekKey: string, periodStart: string, periodEnd: string) {
    const [review, setReview] = useState<WeeklyReview | null>(null);
    const [stats, setStats] = useState({ 
        income: 0, 
        expense: 0,
        reserve_delta: 0,
        joy_delta: 0
    });
    const [history, setHistory] = useState<WeeklyReview[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);

        const [existing, allTxs, allCats, allReviews] = await Promise.all([
            weeklyReviewRepository.getByWeek(weekKey),
            transactionRepository.getAll(),
            categoryRepository.getAll(),
            weeklyReviewRepository.getAll()
        ]);

        setReview(existing);
        setHistory(allReviews.slice(0, 6).reverse()); // Show last 6 reviews in chronological order

        const periodTxs = allTxs.filter(tx =>
            tx.happened_at >= periodStart && tx.happened_at <= periodEnd
        );
// ... existing logic for income, expense, reserve_delta, joy_delta ...
        const income = periodTxs
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount_cents, 0);

        const expense = periodTxs
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount_cents, 0);
            
        const reserveCat = allCats.find(c => c.bucket_type === 'reserve');
        const joyCat = allCats.find(c => c.bucket_type === 'joy');
        
        const reserve_delta = periodTxs
            .filter(tx => tx.category_id === reserveCat?.id)
            .reduce((sum, tx) => sum + tx.amount_cents, 0);

        const joy_delta = periodTxs
            .filter(tx => tx.category_id === joyCat?.id)
            .reduce((sum, tx) => sum + tx.amount_cents, 0);

        setStats({ income, expense, reserve_delta, joy_delta });
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
            reserve_delta_cents: stats.reserve_delta,
            joy_delta_cents: stats.joy_delta,
            ...data
        });
        await refresh();
    };

    return {
        review,
        stats,
        history,
        loading,
        saveReview,
        refresh
    };
}
