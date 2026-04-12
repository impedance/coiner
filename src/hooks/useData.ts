import { useState, useEffect, useCallback } from 'react';
import { accountRepository } from '../db/repositories/AccountRepository';
import { transactionRepository } from '../db/repositories/TransactionRepository';
import { categoryRepository } from '../db/repositories/CategoryRepository';
import { monthlyBucketPlanRepository } from '../db/repositories/MonthlyBucketPlanRepository';
import { goalRepository } from '../db/repositories/GoalRepository';
import { cycleRepository } from '../db/repositories/CycleRepository';
import { practiceRepository } from '../db/repositories/PracticeRepository';
import { artifactRepository } from '../db/repositories/ArtifactRepository';
import { moneyStepRepository } from '../db/repositories/MoneyStepRepository';
import { 
    Account, Transaction, Category, MonthlyBucketPlan, 
    Goal, Cycle, PracticeDefinition, Artifact, MoneyStep 
} from '../types';
import { migrate } from '../db/client/migrations';
import { seedSystemData } from '../db/seeds/system';

export function useDataSelection() {
    const [isReady, setIsReady] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [plans, setPlans] = useState<MonthlyBucketPlan[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [practices, setPractices] = useState<PracticeDefinition[]>([]);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [moneySteps, setMoneySteps] = useState<MoneyStep[]>([]);

    const refresh = useCallback(async () => {
        const monthKey = new Date().toISOString().substring(0, 7);
        const [accs, txs, cats, pls, g_list, c_list, p_list, a_list, s_list] = await Promise.all([
            accountRepository.getAll(),
            transactionRepository.getAll(),
            categoryRepository.getAll(),
            monthlyBucketPlanRepository.getByMonth(monthKey),
            goalRepository.getAll(),
            cycleRepository.getAll(),
            practiceRepository.getDefinitions(),
            artifactRepository.getAll(),
            moneyStepRepository.getAll(),
        ]);
        setAccounts(accs);
        setTransactions(txs);
        setCategories(cats);
        setPlans(pls);
        setGoals(g_list);
        setCycles(c_list);
        setPractices(p_list);
        setArtifacts(a_list);
        setMoneySteps(s_list);
    }, []);

    useEffect(() => {
        async function init() {
            try {
                await migrate();
                await seedSystemData();
                await refresh();
            } catch (error) {
                console.error('Failed to initialize data:', error);
            } finally {
                setIsReady(true);
            }
        }
        init();
    }, [refresh]);

    return { 
        isReady, 
        accounts, 
        transactions, 
        categories, 
        plans, 
        goals, 
        cycles, 
        practices, 
        artifacts, 
        moneySteps, 
        refresh 
    };
}
