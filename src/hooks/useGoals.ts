import { useState, useCallback, useEffect } from 'react';
import { goalRepository } from '../db/repositories/GoalRepository';
import { Goal, GoalContribution } from '../types';

export function useGoals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        const allGoals = await goalRepository.getAll();
        setGoals(allGoals);
        setLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const createGoal = async (goal: Partial<Goal>) => {
        const id = await goalRepository.create(goal);
        await refresh();
        return id;
    };

    const updateGoal = async (id: string, goal: Partial<Goal>) => {
        await goalRepository.update(id, goal);
        await refresh();
    };

    const contribute = async (goalId: string, amountCents: number, note?: string) => {
        await goalRepository.addContribution({
            goal_id: goalId,
            amount_cents: amountCents,
            happened_at: new Date().toISOString(),
            note,
        });
        await refresh();
    };

    const getContributions = async (goalId: string) => {
        return await goalRepository.getContributions(goalId);
    };

    const archiveGoal = async (id: string) => {
        await goalRepository.update(id, { status: 'archived' });
        await refresh();
    };

    return {
        goals,
        loading,
        createGoal,
        updateGoal,
        contribute,
        getContributions,
        archiveGoal,
        refresh
    };
}
