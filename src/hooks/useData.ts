import { useState, useEffect, useCallback } from 'react';
import { accountRepository } from '../db/repositories/AccountRepository';
import { transactionRepository } from '../db/repositories/TransactionRepository';
import { categoryRepository } from '../db/repositories/CategoryRepository';
import { Account, Transaction, Category } from '../types';
import { migrate } from '../db/client/migrations';
import { seedSystemData } from '../db/seeds/system';

export function useDataSelection() {
    const [isReady, setIsReady] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const refresh = useCallback(async () => {
        const [accs, txs, cats] = await Promise.all([
            accountRepository.getAll(),
            transactionRepository.getAll(),
            categoryRepository.getAll(),
        ]);
        setAccounts(accs);
        setTransactions(txs);
        setCategories(cats);
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

    return { isReady, accounts, transactions, categories, refresh };
}
