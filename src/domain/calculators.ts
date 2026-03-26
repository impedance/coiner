import { Transaction, MonthlyBucketPlan } from '../types';

export function calculateUnassignedMoney(
    totalOpeningBalances: number,
    allTransactions: Transaction[],
    allBucketPlans: MonthlyBucketPlan[]
): number {
    const totalIncome = allTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount_cents, 0);
    const totalAssigned = allBucketPlans.reduce((sum, p) => sum + p.assigned_cents, 0);

    return (totalOpeningBalances + totalIncome) - totalAssigned;
}

export function calculateCategoryStats(
    plan: MonthlyBucketPlan | undefined,
    transactions: Transaction[],
    monthKey: string
) {
    const assigned = plan?.assigned_cents || 0;
    const spent = transactions
        .filter(tx => tx.category_id === plan?.category_id && tx.happened_at.startsWith(monthKey))
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    return {
        assigned,
        spent,
        available: assigned - spent
    };
}

export function calculateWeeklyStats(
    transactions: Transaction[],
    periodStart: string,
    periodEnd: string
) {
    const periodTxs = transactions.filter(tx =>
        tx.happened_at >= periodStart && tx.happened_at <= periodEnd
    );

    const income = periodTxs
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    const expense = periodTxs
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    return { income, expense, net: income - expense };
}
