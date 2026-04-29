import { 
  getAccountBalance, 
  getTotalAccountBalance, 
  getIncomeTotal, 
  getAssignedTotal, 
  getReadyToAssign, 
  getBucketSpent, 
  getBucketAssigned, 
  getBucketAvailable, 
  getBucketState 
} from '../calculators';
import { Transaction, MonthlyBucketPlan, Account } from '../../../types';

describe('Budget Calculators', () => {
  const mockAccount: Account = {
    id: 'a1',
    name: 'Debit',
    type: 'checking',
    currency: 'USD',
    opening_balance_cents: 1000,
    is_archived: false,
    created_at: '',
    updated_at: ''
  };

  const mockTransactions: Transaction[] = [
    { id: 't1', type: 'income', account_id: 'a1', amount_cents: 5000, happened_at: '2026-03-01T10:00:00Z', created_at: '', updated_at: '' },
    { id: 't2', type: 'expense', account_id: 'a1', category_id: 'c1', amount_cents: 1000, happened_at: '2026-03-05T10:00:00Z', created_at: '', updated_at: '' },
    { id: 't3', type: 'transfer', account_id: 'a1', to_account_id: 'a2', amount_cents: 500, happened_at: '2026-03-10T10:00:00Z', created_at: '', updated_at: '' },
    { id: 't4', type: 'expense', account_id: 'a1', category_id: 'c1', amount_cents: 2000, happened_at: '2026-04-05T10:00:00Z', created_at: '', updated_at: '' },
  ];

  const mockPlans: MonthlyBucketPlan[] = [
    { id: 'p1', month_key: '2026-03', category_id: 'c1', planned_cents: 0, assigned_cents: 3000, carryover_mode: 'carry', created_at: '', updated_at: '' },
    { id: 'p2', month_key: '2026-04', category_id: 'c1', planned_cents: 0, assigned_cents: 1000, carryover_mode: 'carry', created_at: '', updated_at: '' },
  ];

  describe('getAccountBalance', () => {
    it('should calculate balance including opening, income, expense, and transfer', () => {
      const balance = getAccountBalance(mockAccount, mockTransactions);
      // 1000 (opening) + 5000 (income) - 1000 (exp mar) - 500 (transf) - 2000 (exp apr) = 2500
      expect(balance).toBe(2500);
    });

    it('should include incoming transfers', () => {
      const acc2: Account = { ...mockAccount, id: 'a2', opening_balance_cents: 0 };
      const balance = getAccountBalance(acc2, mockTransactions);
      // 0 + 500 (transf from a1) = 500
      expect(balance).toBe(500);
    });
  });

  describe('getReadyToAssign', () => {
    it('should calculate global ready to assign correctly', () => {
      const result = getReadyToAssign(1000, mockTransactions, mockPlans);
      // (1000 (opening) + 5000 (income)) - (3000 (mar) + 1000 (apr)) = 2000
      expect(result).toBe(2000);
    });
  });

  describe('getBucketAvailable', () => {
    it('should calculate available with carryover', () => {
      const marAvail = getBucketAvailable('c1', mockPlans, mockTransactions, '2026-03');
      // Assigned (mar) 3000 - Spent (mar) 1000 = 2000
      expect(marAvail).toBe(2000);

      const aprAvail = getBucketAvailable('c1', mockPlans, mockTransactions, '2026-04');
      // Total Assigned (mar+apr) 4000 - Total Spent (mar+apr) 3000 = 1000
      expect(aprAvail).toBe(1000);
    });

    it('should handle overspending correctly (negative available)', () => {
      const overspentTxs: Transaction[] = [
        ...mockTransactions,
        { id: 't5', type: 'expense', account_id: 'a1', category_id: 'c1', amount_cents: 5000, happened_at: '2026-04-10T10:00:00Z', created_at: '', updated_at: '' }
      ];
      const aprAvail = getBucketAvailable('c1', mockPlans, overspentTxs, '2026-04');
      // Total Assigned 4000 - Total Spent 8000 = -4000
      expect(aprAvail).toBe(-4000);
    });
  });

  describe('getBucketState', () => {
    it('should return correct state for a month', () => {
      const state = getBucketState('c1', mockPlans, mockTransactions, '2026-03');
      expect(state.assignedCents).toBe(3000);
      expect(state.spentCents).toBe(1000);
      expect(state.availableCents).toBe(2000);
      expect(state.isOverspent).toBe(false);
    });
  });
});
