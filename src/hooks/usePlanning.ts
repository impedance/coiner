import { useState, useCallback, useEffect } from 'react';
import { monthlyBucketPlanRepository } from '../db/repositories/MonthlyBucketPlanRepository';
import { categoryRepository } from '../db/repositories/CategoryRepository';
import { categoryGroupRepository } from '../db/repositories/CategoryGroupRepository';
import { transactionRepository } from '../db/repositories/TransactionRepository';
import { accountRepository } from '../db/repositories/AccountRepository';
import { MonthlyBucketPlan, Category, CategoryGroup, Transaction, Account } from '../types';
import { getReadyToAssign } from '../domain/budget/calculators';

export function usePlanning(monthKey: string) {
    const [plans, setPlans] = useState<MonthlyBucketPlan[]>([]);
    const [allPlans, setAllPlans] = useState<MonthlyBucketPlan[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
    const [unassignedMoney, setUnassignedMoney] = useState(0);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        const [monthlyPlans, fetchedAllPlans, allCats, allGroups, allTxs, allAccs] = await Promise.all([
            monthlyBucketPlanRepository.getByMonth(monthKey),
            monthlyBucketPlanRepository.getAll(),
            categoryRepository.getAll(),
            categoryGroupRepository.getAll(),
            transactionRepository.getAll(),
            accountRepository.getAll(),
        ]);

        setPlans(monthlyPlans);
        setAllPlans(fetchedAllPlans);
        setCategories(allCats);
        setCategoryGroups(allGroups);
        setAccounts(allAccs);
        setTransactions(allTxs);

        const totalOpening = allAccs.reduce((sum, acc) => sum + acc.opening_balance_cents, 0);
        setUnassignedMoney(getReadyToAssign(totalOpening, allTxs, fetchedAllPlans));
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
        allPlans,
        categories,
        categoryGroups,
        accounts,
        transactions,
        unassignedMoney,
        loading,
        assignMoney,
        updatePlanned,
        refresh
    };
}
