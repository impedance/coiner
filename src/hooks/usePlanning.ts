import { useState, useCallback, useEffect } from 'react';
import { monthlyBucketPlanRepository } from '../db/repositories/MonthlyBucketPlanRepository';
import { categoryRepository } from '../db/repositories/CategoryRepository';
import { categoryGroupRepository } from '../db/repositories/CategoryGroupRepository';
import { transactionRepository } from '../db/repositories/TransactionRepository';
import { accountRepository } from '../db/repositories/AccountRepository';
import { MonthlyBucketPlan, Category, CategoryGroup, Transaction, Account } from '../types';
import { calculateUnassignedMoney } from '../domain/calculators';

export function usePlanning(monthKey: string) {
    const [plans, setPlans] = useState<MonthlyBucketPlan[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
    const [unassignedMoney, setUnassignedMoney] = useState(0);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        const [allPlans, allCats, allGroups, allTxs, allAccs] = await Promise.all([
            monthlyBucketPlanRepository.getByMonth(monthKey),
            categoryRepository.getAll(),
            categoryGroupRepository.getAll(),
            transactionRepository.getAll(),
            accountRepository.getAll(),
        ]);

        setPlans(allPlans);
        setCategories(allCats);
        setCategoryGroups(allGroups);

        // Calculate Total Money (Lifetime)
        const totalOpening = allAccs.reduce((sum, acc) => sum + acc.opening_balance_cents, 0);

        // Total money actually assigned (across all time)
        const db = await (await import('../db/client/sqlite')).getDatabase();
        const assignedResult = await db.getFirstAsync<{ total: number }>('SELECT SUM(assigned_cents) as total FROM monthly_bucket_plans');
        const allAssignedPlansRecord = await db.getAllAsync<MonthlyBucketPlan>('SELECT * FROM monthly_bucket_plans');

        setUnassignedMoney(calculateUnassignedMoney(totalOpening, allTxs, allAssignedPlansRecord));
        setLoading(false);
    }, [monthKey]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const assignMoney = async (categoryId: string, amountCents: number) => {
        await monthlyBucketPlanRepository.upsert({
            month_key: monthKey,
            category_id: categoryId,
            assigned_cents: amountCents,
        });
        await refresh();
    };

    const updatePlanned = async (categoryId: string, amountCents: number) => {
        await monthlyBucketPlanRepository.upsert({
            month_key: monthKey,
            category_id: categoryId,
            planned_cents: amountCents,
        });
        await refresh();
    };

    return {
        plans,
        categories,
        categoryGroups,
        unassignedMoney,
        loading,
        assignMoney,
        updatePlanned,
        refresh
    };
}
