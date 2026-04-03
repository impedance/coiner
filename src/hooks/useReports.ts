import { useState, useMemo, useEffect } from 'react';
import { useDataSelection } from './useData';
import { Transaction, Category, MonthlyBucketPlan } from '../types';

export function useReports() {
    const { transactions, categories, plans, accounts, isReady } = useDataSelection();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isReady) setLoading(false);
    }, [isReady]);

    const spendingByCategory = useMemo(() => {
        const stats: Record<string, number> = {};
        const monthKey = new Date().toISOString().substring(0, 7); // Current month

        transactions
            .filter((tx: Transaction) => tx.type === 'expense' && tx.happened_at.startsWith(monthKey))
            .forEach((tx: Transaction) => {
                if (tx.category_id) {
                    stats[tx.category_id] = (stats[tx.category_id] || 0) + tx.amount_cents;
                }
            });

        return categories
            .filter((c: Category) => c.kind === 'expense')
            .map((c: Category) => ({
                id: c.id,
                name: c.name,
                amount_cents: stats[c.id] || 0,
                color: c.icon ? '#34C759' : '#007AFF', // Placeholder colors for now
            }))
            .sort((a: any, b: any) => b.amount_cents - a.amount_cents)
            .filter((c: any) => c.amount_cents > 0);
    }, [transactions, categories]);

    const incomeVsExpense = useMemo(() => {
        const monthKey = new Date().toISOString().substring(0, 7);
        const income = transactions
            .filter((tx: Transaction) => tx.type === 'income' && tx.happened_at.startsWith(monthKey))
            .reduce((sum: number, tx: Transaction) => sum + tx.amount_cents, 0);
        const expense = transactions
            .filter((tx: Transaction) => tx.type === 'expense' && tx.happened_at.startsWith(monthKey))
            .reduce((sum: number, tx: Transaction) => sum + tx.amount_cents, 0);

        return { income, expense };
    }, [transactions]);

    const reserveTrend = useMemo(() => {
        // Simple reserve trend: last 4 weeks of reserve movement
        // For MVP, we'll just return the current reserve progress
        const reserveCategory = categories.find((c: Category) => c.bucket_type === 'reserve');
        if (!reserveCategory) return { current: 0, target: 0 };

        const monthKey = new Date().toISOString().substring(0, 7);
        const plan = plans.find((p: MonthlyBucketPlan) => p.category_id === reserveCategory.id && p.month_key === monthKey);
        const saved = transactions
            .filter((tx: Transaction) => tx.category_id === reserveCategory.id && tx.happened_at.startsWith(monthKey))
            .reduce((sum: number, tx: Transaction) => sum + tx.amount_cents, 0);

        return {
            current: saved,
            target: plan?.assigned_cents || 0,
        };
    }, [transactions, categories, plans]);

    return {
        spendingByCategory,
        incomeVsExpense,
        reserveTrend,
        loading: !isReady || loading,
    };
}
