import { useState, useEffect, useCallback } from 'react';
import { accountRepository } from '../db/repositories/AccountRepository';
import { transactionRepository } from '../db/repositories/TransactionRepository';
import { categoryRepository } from '../db/repositories/CategoryRepository';
import { monthlyBucketPlanRepository } from '../db/repositories/MonthlyBucketPlanRepository';
import { Account, Transaction, Category, MonthlyBucketPlan } from '../types';
import { migrate } from '../db/client/migrations';
import { seedSystemData } from '../db/seeds/system';

export function useDataSelection() {
    const [isReady, setIsReady] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [plans, setPlans] = useState<MonthlyBucketPlan[]>([]);

    const refresh = useCallback(async () => {
        const monthKey = new Date().toISOString().substring(0, 7);
        const [accs, txs, cats, pls] = await Promise.all([
            accountRepository.getAll(),
            transactionRepository.getAll(),
            categoryRepository.getAll(),
            monthlyBucketPlanRepository.getByMonth(monthKey),
        ]);
        setAccounts(accs);
        setTransactions(txs);
        setCategories(cats);
        setPlans(pls);
    }, []);

    useEffect(() => {
        async function init() {
            await migrate();
            await seedSystemData();
            await refresh();
            setIsReady(true);
        }
        init();
    }, [refresh]);

    return { isReady, accounts, transactions, categories, plans, refresh };
}
