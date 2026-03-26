import { calculateUnassignedMoney, calculateCategoryStats, calculateWeeklyStats } from '../calculators';
import { Transaction, MonthlyBucketPlan } from '../../types';

describe('Calculators', () => {
    const mockTransactions: Transaction[] = [
        { id: '1', type: 'income', account_id: 'a', amount_cents: 100000, happened_at: '2026-03-01T10:00:00Z', created_at: '', updated_at: '' },
        { id: '2', type: 'expense', account_id: 'a', category_id: 'c1', amount_cents: 2000, happened_at: '2026-03-02T10:00:00Z', created_at: '', updated_at: '' },
        { id: '3', type: 'expense', account_id: 'a', category_id: 'c1', amount_cents: 3000, happened_at: '2026-03-10T10:00:00Z', created_at: '', updated_at: '' },
    ];

    const mockPlans: MonthlyBucketPlan[] = [
        { id: 'p1', month_key: '2026-03', category_id: 'c1', planned_cents: 10000, assigned_cents: 6000, carryover_mode: 'carry', created_at: '', updated_at: '' },
    ];

    describe('calculateUnassignedMoney', () => {
        it('should correctly calculate unassigned money', () => {
            const totalOpening = 50000; // 500.00
            // Total = 50000 + 100000 (income) = 150000
            // Assigned = 6000
            // Result = 144000
            const result = calculateUnassignedMoney(totalOpening, mockTransactions, mockPlans);
            expect(result).toBe(144000);
        });
    });

    describe('calculateCategoryStats', () => {
        it('should correctly calculate category stats for a month', () => {
            const stats = calculateCategoryStats(mockPlans[0], mockTransactions, '2026-03');
            expect(stats.assigned).toBe(6000);
            expect(stats.spent).toBe(5000);
            expect(stats.available).toBe(1000);
        });

        it('should return zero spent if no transactions match the category or month', () => {
            const stats = calculateCategoryStats(mockPlans[0], mockTransactions, '2026-04');
            expect(stats.spent).toBe(0);
        });
    });

    describe('calculateWeeklyStats', () => {
        it('should correctly calculate weekly stats', () => {
            const start = '2026-03-01T00:00:00Z';
            const end = '2026-03-07T23:59:59Z';
            const stats = calculateWeeklyStats(mockTransactions, start, end);
            expect(stats.income).toBe(100000);
            expect(stats.expense).toBe(2000);
            expect(stats.net).toBe(98000);
        });
    });
});
