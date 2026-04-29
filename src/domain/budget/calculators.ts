import { Account, Transaction, MonthlyBucketPlan, Category } from '../../types';

export type BucketState = {
  categoryId: string;
  assignedCents: number;
  spentCents: number;
  availableCents: number;
  isOverspent: boolean;
};

export type BudgetSummary = {
  totalBalanceCents: number;
  readyToAssignCents: number;
  bucketStates: BucketState[];
};

/**
 * Calculates the balance of a single account including opening balance,
 * income, expenses, and transfers.
 */
export function getAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.opening_balance_cents;
  for (const tx of transactions) {
    if (tx.account_id === account.id) {
      if (tx.type === 'expense') balance -= tx.amount_cents;
      if (tx.type === 'income') balance += tx.amount_cents;
      if (tx.type === 'transfer') balance -= tx.amount_cents;
      if (tx.type === 'adjustment') balance = tx.amount_cents;
    } else if (tx.to_account_id === account.id && tx.type === 'transfer') {
      balance += tx.amount_cents;
    }
  }
  return balance;
}

/**
 * Calculates the total balance across all accounts.
 */
export function getTotalAccountBalance(accounts: Account[], transactions: Transaction[]): number {
  return accounts.reduce((sum, acc) => sum + getAccountBalance(acc, transactions), 0);
}

/**
 * Calculates the total income across all transactions.
 */
export function getIncomeTotal(transactions: Transaction[]): number {
  return transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount_cents, 0);
}

/**
 * Calculates the total amount assigned to all buckets across all time.
 */
export function getAssignedTotal(plans: MonthlyBucketPlan[]): number {
  return plans.reduce((sum, p) => sum + p.assigned_cents, 0);
}

/**
 * Calculates the "Ready to Assign" amount.
 * Ready to Assign = (Sum of Opening Balances + Total Income) - Total Assigned.
 */
export function getReadyToAssign(openingBalances: number, transactions: Transaction[], plans: MonthlyBucketPlan[]): number {
  const totalIncome = getIncomeTotal(transactions);
  const totalAssigned = getAssignedTotal(plans);
  return (openingBalances + totalIncome) - totalAssigned;
}

/**
 * Calculates the amount spent in a specific bucket during a specific month.
 */
export function getBucketSpent(categoryId: string, transactions: Transaction[], monthKey: string): number {
  return transactions
    .filter(tx => 
      tx.category_id === categoryId && 
      tx.type === 'expense' && 
      tx.happened_at.startsWith(monthKey)
    )
    .reduce((sum, tx) => sum + tx.amount_cents, 0);
}

/**
 * Calculates the amount assigned to a specific bucket in a specific month.
 */
export function getBucketAssigned(categoryId: string, plans: MonthlyBucketPlan[], monthKey?: string): number {
  if (monthKey) {
    return plans.find(p => p.category_id === categoryId && p.month_key === monthKey)?.assigned_cents || 0;
  }
  return plans
    .filter(p => p.category_id === categoryId)
    .reduce((sum, p) => sum + p.assigned_cents, 0);
}

/**
 * Calculates the available amount in a bucket at the end of a specific month.
 * This includes carryover from previous months.
 */
export function getBucketAvailable(categoryId: string, plans: MonthlyBucketPlan[], transactions: Transaction[], monthKey: string): number {
  const totalAssignedUntil = plans
    .filter(p => p.category_id === categoryId && p.month_key <= monthKey)
    .reduce((sum, p) => sum + p.assigned_cents, 0);
  
  const totalSpentUntil = transactions
    .filter(tx => 
      tx.category_id === categoryId && 
      tx.type === 'expense' && 
      tx.happened_at.substring(0, 7) <= monthKey
    )
    .reduce((sum, tx) => sum + tx.amount_cents, 0);

  return totalAssignedUntil - totalSpentUntil;
}

/**
 * Gets the full state of a bucket for a specific month.
 */
export function getBucketState(categoryId: string, plans: MonthlyBucketPlan[], transactions: Transaction[], monthKey: string): BucketState {
  const assignedCents = getBucketAssigned(categoryId, plans, monthKey);
  const spentCents = getBucketSpent(categoryId, transactions, monthKey);
  const availableCents = getBucketAvailable(categoryId, plans, transactions, monthKey);

  return {
    categoryId,
    assignedCents,
    spentCents,
    availableCents,
    isOverspent: availableCents < 0
  };
}

/**
 * Gets a summary of the entire budget for a specific month.
 */
export function getBudgetSummary(
  accounts: Account[],
  transactions: Transaction[],
  plans: MonthlyBucketPlan[],
  categories: Category[],
  monthKey: string
): BudgetSummary {
  const totalOpening = accounts.reduce((sum, acc) => sum + acc.opening_balance_cents, 0);
  
  return {
    totalBalanceCents: getTotalAccountBalance(accounts, transactions),
    readyToAssignCents: getReadyToAssign(totalOpening, transactions, plans),
    bucketStates: categories.map(cat => getBucketState(cat.id, plans, transactions, monthKey))
  };
}
