import { useState, useMemo, useEffect, useCallback } from 'react';
import { useDataSelection } from './useData';
import { Transaction, Category, MonthlyBucketPlan, Goal, Cycle } from '../types';

export function useReports() {
    const { 
        transactions, categories, plans, goals, cycles, isReady 
    } = useDataSelection();
    
    const [loading, setLoading] = useState(true);
    const [monthOffset, setMonthOffset] = useState(0); // 0 = current, -1 = previous

    useEffect(() => {
        if (isReady) setLoading(false);
    }, [isReady]);

    const activeMonthKey = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + monthOffset);
        return d.toISOString().substring(0, 7);
    }, [monthOffset]);

    const spendingByCategory = useMemo(() => {
        const stats: Record<string, number> = {};

        transactions
            .filter((tx: Transaction) => tx.type === 'expense' && tx.happened_at.startsWith(activeMonthKey))
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
            }))
            .sort((a: any, b: any) => b.amount_cents - a.amount_cents)
            .filter((c: any) => c.amount_cents > 0);
    }, [transactions, categories, activeMonthKey]);

    const incomeVsExpense = useMemo(() => {
        const income = transactions
            .filter((tx: Transaction) => tx.type === 'income' && tx.happened_at.startsWith(activeMonthKey))
            .reduce((sum: number, tx: Transaction) => sum + tx.amount_cents, 0);
        const expense = transactions
            .filter((tx: Transaction) => tx.type === 'expense' && tx.happened_at.startsWith(activeMonthKey))
            .reduce((sum: number, tx: Transaction) => sum + tx.amount_cents, 0);

        return { income, expense };
    }, [transactions, activeMonthKey]);

    const reserveTrend = useMemo(() => {
        const reserveCategory = categories.find((c: Category) => c.bucket_type === 'reserve');
        if (!reserveCategory) return { current: 0, target: 0 };

        const plan = plans.find((p: MonthlyBucketPlan) => p.category_id === reserveCategory.id && p.month_key === activeMonthKey);
        const saved = transactions
            .filter((tx: Transaction) => tx.category_id === reserveCategory.id && tx.happened_at.startsWith(activeMonthKey))
            .reduce((sum: number, tx: Transaction) => sum + tx.amount_cents, 0);

        return {
            current: saved,
            target: plan?.assigned_cents || 0,
        };
    }, [transactions, categories, plans, activeMonthKey]);

    const joyTrend = useMemo(() => {
        const joyCategory = categories.find((c: Category) => c.bucket_type === 'joy');
        if (!joyCategory) return { current: 0, target: 0 };

        const plan = plans.find((p: MonthlyBucketPlan) => p.category_id === joyCategory.id && p.month_key === activeMonthKey);
        const spent = transactions
            .filter((tx: Transaction) => tx.category_id === joyCategory.id && tx.happened_at.startsWith(activeMonthKey))
            .reduce((sum: number, tx: Transaction) => sum + tx.amount_cents, 0);

        return {
            current: spent,
            target: plan?.assigned_cents || 0,
        };
    }, [transactions, categories, plans, activeMonthKey]);

    const goalsSummary = useMemo(() => {
        const activeGoals = goals.filter((g: Goal) => g.status === 'active');
        const totalTarget = activeGoals.reduce((sum, g) => sum + g.target_cents, 0);
        const totalCurrent = activeGoals.reduce((sum, g) => sum + g.current_cents, 0);

        return {
            count: activeGoals.length,
            totalTarget,
            totalCurrent,
            percentage: totalTarget > 0 ? totalCurrent / totalTarget : 0,
        };
    }, [goals]);

    const cycleSummary = useMemo(() => {
        const activeCycle = cycles.find((c: Cycle) => c.status === 'active');
        if (!activeCycle) return null;

        // In a real app we'd fetch checkins here, for now we simplified to the cycle object
        return {
            title: activeCycle.title,
            progress: 0.65, // Placeholder - in a real repo we'd compute from practice_checkins
            daysLeft: Math.max(0, Math.ceil((new Date(activeCycle.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
        };
    }, [cycles]);

    const nextAction = useMemo(() => {
        const unassigned = transactions.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount_cents : 0), 0) -
            plans.filter(p => p.month_key === activeMonthKey).reduce((sum, p) => sum + p.assigned_cents, 0);

        if (unassigned > 100) return { 
            title: 'Assign Income', 
            desc: `${(unassigned / 100).toFixed(0)}€ to be assigned to your buckets.`, 
            icon: 'wallet-outline',
            route: '/plan' 
        };
        
        const activeCycle = cycles.find(c => c.status === 'active');
        if (activeCycle) return {
            title: 'Daily Practice',
            desc: 'Check in on your current behavior cycle.',
            icon: 'fitness-outline',
            route: '/behavior'
        };

        const today = new Date();
        if (today.getDay() === 0 || today.getDay() === 6) return {
            title: 'Weekly Review',
            desc: 'Time for your weekly ritual and reflection.',
            icon: 'journal-outline',
            route: '/review'
        };

        return {
            title: 'Capture Everything',
            desc: 'Log any small expense that happened today.',
            icon: 'camera-outline',
            route: '/transaction/new?type=expense'
        };
    }, [transactions, plans, cycles, activeMonthKey]);

    const monthPace = useMemo(() => {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        return now.getDate() / daysInMonth;
    }, []);

    return {
        spendingByCategory,
        incomeVsExpense,
        reserveTrend,
        joyTrend,
        goalsSummary,
        cycleSummary,
        monthOffset,
        setMonthOffset,
        activeMonthKey,
        nextAction,
        monthPace,
        loading: !isReady || loading,
    };
}
