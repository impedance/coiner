import { useState, useEffect, useCallback } from 'react';
import { moneyStepRepository } from '../db/repositories/MoneyStepRepository';
import { MoneyStep } from '../types';

export function useMoneySteps() {
    const [steps, setSteps] = useState<MoneyStep[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        const data = await moneyStepRepository.getAll();
        setSteps(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const createStep = async (title: string, description: string, stepType: string) => {
        await moneyStepRepository.create({
            title,
            description,
            step_type: stepType,
        });
        await refresh();
    };

    const completeStep = async (id: string) => {
        await moneyStepRepository.update(id, { status: 'achieved' });
        await refresh();
    };

    return {
        steps,
        loading,
        createStep,
        completeStep,
        refresh,
    };
}
